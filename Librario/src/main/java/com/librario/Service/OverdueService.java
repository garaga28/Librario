package com.librario.Service;

import com.librario.Entity.*;
import com.librario.Repo.PaymentRepository;
import com.librario.dto.EmailDetails;
import com.librario.dto.OverdueBookDTO;
import com.librario.Repo.BorrowingRecordRepository;
import com.librario.Repo.MemberRepo;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.ZoneId;

@Service
public class OverdueService {

    private static final int BASIC_LOAN_DAYS = 15;
    private static final int PREMIUM_LOAN_DAYS = 30;
    private static final double FINE_PER_DAY = 10.0;

    @Autowired
    private BorrowingRecordRepository borrowingRecordsRepository;

    @Autowired
    private MemberRepo membersRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EmailService emailService;

    public List<OverdueBookDTO> getOverdueBooks() {
        LocalDate today = LocalDate.now();
        List<BorrowingRecord> allBorrowedRecords = borrowingRecordsRepository.findByReturned(false);

        return allBorrowedRecords.stream()
                .filter(record -> {
                    LocalDate borrowDate = record.getBorrowDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                    Member member = membersRepository.findById(record.getMember().getId()).orElse(null);

                    if (member == null) {
                        return false;
                    }

                    int loanDays = getLoanDaysByMembershipType(member.getMembershipType());
                    LocalDate dueDate = borrowDate.plusDays(loanDays);

                    return today.isAfter(dueDate);
                })
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<OverdueBookDTO> getOverdueBooksByMemberId(Long memberId) {
        LocalDate today = LocalDate.now();
        List<BorrowingRecord> borrowedRecords = borrowingRecordsRepository.findByMemberIdAndReturned(memberId, false);

        return borrowedRecords.stream()
                .filter(record -> {
                    LocalDate borrowDate = record.getBorrowDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                    Member member = membersRepository.findById(record.getMember().getId()).orElse(null);

                    if (member == null) {
                        return false;
                    }

                    int loanDays = getLoanDaysByMembershipType(member.getMembershipType());
                    LocalDate dueDate = borrowDate.plusDays(loanDays);

                    return today.isAfter(dueDate);
                })
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public double calculateFine(BorrowingRecord record) {
        LocalDate today = LocalDate.now();
        LocalDate borrowDate = record.getBorrowDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        Member member = membersRepository.findById(record.getMember().getId()).orElse(null);

        if (member == null) {
            return 0.0;
        }

        int loanDays = getLoanDaysByMembershipType(member.getMembershipType());
        LocalDate dueDate = borrowDate.plusDays(loanDays);

        if (today.isAfter(dueDate)) {
            long overdueDays = ChronoUnit.DAYS.between(dueDate, today);
            return overdueDays * FINE_PER_DAY;
        }
        return 0.0;
    }

    private int getLoanDaysByMembershipType(String membershipType) {
        return "BASIC".equalsIgnoreCase(membershipType) ? BASIC_LOAN_DAYS : PREMIUM_LOAN_DAYS;
    }

    private OverdueBookDTO convertToDto(BorrowingRecord record) {
        LocalDate today = LocalDate.now();
        LocalDate borrowDate = record.getBorrowDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        Member member = membersRepository.findById(record.getMember().getId()).orElse(null);
        int loanDays = getLoanDaysByMembershipType(member.getMembershipType());
        LocalDate dueDate = borrowDate.plusDays(loanDays);
        long overdueDays = ChronoUnit.DAYS.between(dueDate, today);
        double fineAmount = overdueDays * FINE_PER_DAY;

        // Check for completed payment status
        boolean isPaymentCompleted = paymentRepository.existsByBorrowingRecordIdAndStatusAndType(
                record.getId(), PaymentStatus.completed, PaymentType.overdue_charges
        );

        return new OverdueBookDTO(
                record.getId(),
                record.getBook().getTitle(),
                record.getMember().getId(),
                record.getMember().getUser().getName(),
                borrowDate,
                dueDate,
                overdueDays,
                fineAmount,
                isPaymentCompleted ? "Completed" : "Pending"
        );
    }
    @Transactional
    public void markOverduePaymentCompleted(Long borrowingRecordId) {
        BorrowingRecord record = borrowingRecordsRepository.findById(borrowingRecordId)
                .orElseThrow(() -> new RuntimeException("Borrowing record not found with ID: " + borrowingRecordId));

        // Calculate the overdue amount
        double fineAmount = calculateOverdueFine(record);

        // Find existing pending payment or create a new one
        Payment existingPayment = paymentRepository.findByBorrowingRecordIdAndStatusAndType(
                borrowingRecordId, PaymentStatus.pending, PaymentType.overdue_charges
        ).orElseGet(() -> {
            // Create a new payment record if it doesn't exist
            Payment newPayment = new Payment();
            newPayment.setMemberId(record.getMember().getId());
            newPayment.setBorrowingRecordId(record.getId());
            newPayment.setAmount(BigDecimal.valueOf(fineAmount));
            newPayment.setType(PaymentType.overdue_charges);
            newPayment.setPaymentMethod(PaymentMethod.cash);
            return newPayment;
        });

        existingPayment.setStatus(PaymentStatus.completed);
        paymentRepository.save(existingPayment);
    }

    public double calculateOverdueFine(BorrowingRecord record) {
        LocalDate today = LocalDate.now();
        LocalDate borrowDate = record.getBorrowDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        Member member = membersRepository.findById(record.getMember().getId()).orElse(null);
        if (member == null) {
            return 0.0;
        }
        int loanDays = getLoanDaysByMembershipType(member.getMembershipType());
        LocalDate dueDate = borrowDate.plusDays(loanDays);
        if (today.isAfter(dueDate)) {
            long overdueDays = ChronoUnit.DAYS.between(dueDate, today);
            return overdueDays * FINE_PER_DAY;
        }
        return 0.0;
    }

    @Transactional
    @Scheduled(cron = "0 16 22 * * *")
    public void sendDueDateReminders() {
        List<BorrowingRecord> allBorrowedRecords = borrowingRecordsRepository.findByReturned(false);

        LocalDate today = LocalDate.now();

        allBorrowedRecords.stream()
                .filter(record -> {
                    LocalDate borrowDate = record.getBorrowDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                    Member member = membersRepository.findById(record.getMember().getId()).orElse(null);
                    if (member == null) return false;
                    int loanDays = getLoanDaysByMembershipType(member.getMembershipType());
                    LocalDate dueDate = borrowDate.plusDays(loanDays);
                    return ChronoUnit.DAYS.between(today, dueDate) == 2;
                })
                .forEach(record -> {
                    try {
                        Member member = record.getMember();
                        Book book = record.getBook();

                        String memberEmail = member.getUser().getEmail();
                        String bookTitle = book.getTitle();
                        String bookAuthor = book.getAuthor();
                        Date dueDate = Date.from(record.getBorrowDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().plusDays(getLoanDaysByMembershipType(member.getMembershipType())).atStartOfDay(ZoneId.systemDefault()).toInstant());

                        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");

                        String emailSubject = "Library Book Due Date Reminder!";
                        String emailBody = String.format(
                                "<!DOCTYPE html>" +
                                        "<html>" +
                                        "<head>" +
                                        "<style>" +
                                        "body { font-family: Arial, sans-serif; }" +
                                        ".container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto; }" +
                                        "h2 { color: #333; }" +
                                        "p { line-height: 1.6; }" +
                                        ".details { background-color: #ffccbc; padding: 15px; border-radius: 5px; }" +
                                        ".detail-item { margin-bottom: 10px; }" +
                                        "strong { color: #555; }" +
                                        "</style>" +
                                        "</head>" +
                                        "<body>" +
                                        "<div class=\"container\">" +
                                        "<h2>Upcoming Due Date Alert</h2>" +
                                        "<p>Dear %s,</p>" +
                                        "<p>This is a friendly reminder that your borrowed book is due in two days. Please return it on time to avoid any late fees.</p>" +
                                        "<div class=\"details\">" +
                                        "<div class=\"detail-item\"><strong>Book Title:</strong> %s</div>" +
                                        "<div class=\"detail-item\"><strong>Author:</strong> %s</div>" +
                                        "<div class=\"detail-item\"><strong>Due Date:</strong> %s</div>" +
                                        "</div>" +
                                        "<p>Thank you for your cooperation!</p>" +
                                        "<p>Sincerely,<br>The Librario Team</p>" +
                                        "</div>" +
                                        "</body>" +
                                        "</html>",
                                member.getUser().getName(),
                                bookTitle,
                                bookAuthor,
                                dateFormat.format(dueDate)
                        );
                        EmailDetails emailDetails = new EmailDetails(memberEmail, emailSubject, emailBody, true);
                        emailService.sendSimpleMail(emailDetails);

                    } catch (Exception e) {
                        System.err.println("Failed to send due date reminder email: " + e.getMessage());
                    }
                });
    }

    @Transactional
    @Scheduled(cron = "0 55 17 * * *")
    public void sendOverdueNotifications() {
        LocalDate today = LocalDate.now();
        List<BorrowingRecord> allBorrowedRecords = borrowingRecordsRepository.findByReturned(false);

        allBorrowedRecords.stream()
                .filter(record -> {
                    LocalDate borrowDate = record.getBorrowDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                    Member member = membersRepository.findById(record.getMember().getId()).orElse(null);
                    if (member == null) return false;
                    int loanDays = getLoanDaysByMembershipType(member.getMembershipType());
                    LocalDate dueDate = borrowDate.plusDays(loanDays);
                    return today.isAfter(dueDate);
                })
                .forEach(record -> {
                    try {
                        Member member = record.getMember();
                        Book book = record.getBook();
                        String memberEmail = member.getUser().getEmail();

                        LocalDate borrowDate = record.getBorrowDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                        int loanDays = getLoanDaysByMembershipType(member.getMembershipType());
                        LocalDate dueDate = borrowDate.plusDays(loanDays);
                        long overdueDays = ChronoUnit.DAYS.between(dueDate, today);
                        double fineAmount = overdueDays * FINE_PER_DAY;

                        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");

                        String emailSubject = "URGENT: Overdue Book Alert!";
                        String emailBody = String.format(
                                "<!DOCTYPE html>" +
                                        "<html>" +
                                        "<head>" +
                                        "<style>" +
                                        "body { font-family: Arial, sans-serif; }" +
                                        ".container { padding: 20px; border: 1px solid #ffccbc; border-radius: 5px; max-width: 600px; margin: auto; background-color: #fff3e0; }" +
                                        ".header { background-color: #ff5722; color: white; padding: 15px; text-align: center; font-size: 24px; border-radius: 5px 5px 0 0; }" +
                                        ".content { padding: 20px; }" +
                                        "p { line-height: 1.6; color: #333; }" +
                                        ".details { background-color: #fff8e1; padding: 15px; border-left: 4px solid #ff9800; }" +
                                        ".detail-item { margin-bottom: 10px; }" +
                                        "strong { color: #5d4037; }" +
                                        ".fine { color: #d32f2f; font-weight: bold; }" +
                                        "</style>" +
                                        "</head>" +
                                        "<body>" +
                                        "<div class=\"container\">" +
                                        "<div class=\"header\">Overdue Book Notification</div>" +
                                        "<div class=\"content\">" +
                                        "<p>Dear %s,</p>" +
                                        "<p>This is to inform you that the following book has not been returned by its due date and is now **overdue**.</p>" +
                                        "<div class=\"details\">" +
                                        "<div class=\"detail-item\"><strong>Book Title:</strong> %s</div>" +
                                        "<div class=\"detail-item\"><strong>Author:</strong> %s</div>" +
                                        "<div class=\"detail-item\"><strong>Due Date:</strong> %s</div>" +
                                        "<div class=\"detail-item fine\"><strong>Overdue Charges:</strong> Rs. %.2f per day, starting today.</div>" +
                                        "</div>" +
                                        "<p style='margin-top: 20px;'>Please return the book to the library as soon as possible to stop accumulating fines. You can pay the penalty both online or in cash at the library.</p>" +
                                        "<p>Thank you for your prompt attention to this matter.</p>" +
                                        "<p>Sincerely,<br>The Librario Team</p>" +
                                        "</div>" +
                                        "</div>" +
                                        "</body>" +
                                        "</html>",
                                member.getUser().getName(),
                                book.getTitle(),
                                book.getAuthor(),
                                dateFormat.format(Date.from(dueDate.atStartOfDay(ZoneId.systemDefault()).toInstant())),
                                FINE_PER_DAY
                        );

                        EmailDetails emailDetails = new EmailDetails(memberEmail, emailSubject, emailBody, true);
                        emailService.sendSimpleMail(emailDetails);
                    } catch (Exception e) {
                        System.err.println("Failed to send overdue notification email to member: " + e.getMessage());
                    }
                });
    }

    private void sendPaymentConfirmationEmail(Payment payment) {
        try {
            Optional<BorrowingRecord> recordOptional = borrowingRecordsRepository.findById(payment.getBorrowingRecordId());
            if (recordOptional.isPresent()) {
                BorrowingRecord record = recordOptional.get();
                Member member = record.getMember();
                Book book = record.getBook();

                String memberEmail = member.getUser().getEmail();
                String emailSubject = "Payment Confirmation: Overdue Charges for " + book.getTitle();
                String emailBody = String.format(
                        "<!DOCTYPE html>" +
                                "<html>" +
                                "<head>" +
                                "<style>" +
                                "body { font-family: Arial, sans-serif; }" +
                                ".container { padding: 20px; border: 1px solid #c8e6c9; border-radius: 5px; max-width: 600px; margin: auto; background-color: #e8f5e9; }" +
                                ".header { background-color: #4CAF50; color: white; padding: 15px; text-align: center; font-size: 24px; border-radius: 5px 5px 0 0; }" +
                                ".content { padding: 20px; }" +
                                "p { line-height: 1.6; color: #333; }" +
                                ".details { background-color: #f1f8e9; padding: 15px; border-left: 4px solid #81C784; }" +
                                ".detail-item { margin-bottom: 10px; }" +
                                "strong { color: #2e7d32; }" +
                                ".amount { color: #1b5e20; font-weight: bold; }" +
                                "</style>" +
                                "</head>" +
                                "<body>" +
                                "<div class=\"container\">" +
                                "<div class=\"header\">Payment Received!</div>" +
                                "<div class=\"content\">" +
                                "<p>Dear %s,</p>" +
                                "<p>Thank you for your recent payment. We have successfully received the overdue charges for the following book:</p>" +
                                "<div class=\"details\">" +
                                "<div class=\"detail-item\"><strong>Book Title:</strong> %s</div>" +
                                "<div class=\"detail-item\"><strong>Author:</strong> %s</div>" +
                                "<div class=\"detail-item\"><strong>Amount Paid:</strong> Rs. %.2f</div>" +
                                "</div>" +
                                "<p style='margin-top: 20px;'>Your account has been updated. We appreciate your prompt payment.</p>" +
                                "<p>Sincerely,<br>The Librario Team</p>" +
                                "</div>" +
                                "</div>" +
                                "</body>" +
                                "</html>",
                        member.getUser().getName(),
                        book.getTitle(),
                        book.getAuthor(),
                        payment.getAmount()
                );

                EmailDetails emailDetails = new EmailDetails(memberEmail, emailSubject, emailBody, true);
                emailService.sendSimpleMail(emailDetails);
            }
        } catch (Exception e) {
            System.err.println("Failed to send payment confirmation email: " + e.getMessage());
        }
    }
}