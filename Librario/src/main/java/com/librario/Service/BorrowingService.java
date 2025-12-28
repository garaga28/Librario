package com.librario.Service;

import com.librario.Entity.Book;
import com.librario.Entity.BorrowingRecord;
import com.librario.Entity.Member;
import com.librario.Exception.BookNotAvailableException;
import com.librario.Repo.BookRepo;
import com.librario.Repo.BorrowingRecordRepository;
import com.librario.Repo.MemberRepo;
import com.librario.dto.BorrowingRecordDto;
import com.librario.dto.EmailDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Calendar;

@Service
public class BorrowingService {

    @Autowired
    private BorrowingRecordRepository borrowingRecordRepository;
    @Autowired
    private MemberRepo memberRepository;
    @Autowired
    private BookRepo bookRepository;
    @Autowired
    private EmailService emailService;


    @Transactional
    public BorrowingRecord borrowBook(BorrowingRecordDto recordDto) {
        Member member = memberRepository.findByUserId(recordDto.getMemberId())
                .orElseThrow(() -> new BookNotAvailableException("Member not found."));

        Book book = bookRepository.findById(recordDto.getBookId())
                .orElseThrow(() -> new BookNotAvailableException("Book not found."));

        if (book.getAvailableCopies() <= 0) {
            throw new BookNotAvailableException("Book is currently not available for borrowing.");
        }

        BorrowingRecord record = new BorrowingRecord();
        record.setMember(member);
        record.setBook(book);
        record.setBorrowDate(new Date());
        record.setReturned(false);

        book.setAvailableCopies(book.getAvailableCopies() - 1);

        if (book.getAvailableCopies() == 0) {
            book.setStatus("UNAVAILABLE");
        }

        bookRepository.save(book);
        BorrowingRecord savedRecord = borrowingRecordRepository.save(record);

        // Prepare email details
        String memberEmail = member.getUser().getEmail();
        String bookTitle = book.getTitle();
        String bookAuthor = book.getAuthor();
        Date borrowDate = savedRecord.getBorrowDate();

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(borrowDate);
        String membershipType = member.getMembershipType();
        if ("PREMIUM".equalsIgnoreCase(membershipType)) {
            calendar.add(Calendar.DAY_OF_MONTH, 30);
        } else {
            calendar.add(Calendar.DAY_OF_MONTH, 15);
        }
        Date dueDate = calendar.getTime();

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");

        String emailSubject = "Book Borrowed Successfully!";
        String emailBody = String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<head>" +
                        "<style>" +
                        "body { font-family: Arial, sans-serif; }" +
                        ".container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto; }" +
                        "h2 { color: #333; }" +
                        "p { line-height: 1.6; }" +
                        ".details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }" +
                        ".detail-item { margin-bottom: 10px; }" +
                        "strong { color: #555; }" +
                        "</style>" +
                        "</head>" +
                        "<body>" +
                        "<div class=\"container\">" +
                        "<h2>Confirmation of Book Borrowing</h2>" +
                        "<p>Dear %s,</p>" +
                        "<p>This email confirms that you have successfully borrowed a book from our library. Here are the details of your borrowing record:</p>" +
                        "<div class=\"details\">" +
                        "<div class=\"detail-item\"><strong>Book Title:</strong> %s</div>" +
                        "<div class=\"detail-item\"><strong>Author:</strong> %s</div>" +
                        "<div class=\"detail-item\"><strong>Borrow Date:</strong> %s</div>" +
                        "<div class=\"detail-item\"><strong>Due Date:</strong> %s</div>" +
                        "</div>" +
                        "<p>Please remember to return the book by the due date to avoid any late fees. Thank you for using our library services!</p>" +
                        "<p>Sincerely,<br>The Librario Team</p>" +
                        "</div>" +
                        "</body>" +
                        "</html>",
                member.getUser().getName(),
                bookTitle,
                bookAuthor,
                dateFormat.format(borrowDate),
                dateFormat.format(dueDate)
        );

        EmailDetails emailDetails = new EmailDetails(memberEmail, emailSubject, emailBody, true);
        emailService.sendSimpleMail(emailDetails);

        return savedRecord;
    }

    @Transactional
    public BorrowingRecord returnBook(BorrowingRecordDto recordDto) {
        Member member = memberRepository.findByUserId(recordDto.getMemberId())
                .orElseThrow(() -> new BookNotAvailableException("Member not found."));

        BorrowingRecord record = borrowingRecordRepository.findByMemberIdAndBookIdAndReturnedFalse(
                        member.getId(), recordDto.getBookId()
                )
                .orElseThrow(() -> new BookNotAvailableException("No active borrowing record found for this member and book."));

        record.setReturnDate(new Date());
        record.setReturned(true);
        Book book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        book.setStatus("AVAILABLE");

        bookRepository.save(book);
        return borrowingRecordRepository.save(record);
    }

    @Transactional
    public BorrowingRecord librarianReturnBook(Long borrowingRecordId) {
        BorrowingRecord record = borrowingRecordRepository.findById(borrowingRecordId)
                .orElseThrow(() -> new BookNotAvailableException("No borrowing record found with the provided ID."));

        if (record.isReturned()) {
            throw new BookNotAvailableException("This book has already been returned.");
        }

        record.setReturnDate(new Date());
        record.setReturned(true);

        Book book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        book.setStatus("AVAILABLE");

        bookRepository.save(book);
        BorrowingRecord savedRecord = borrowingRecordRepository.save(record);

        // Prepare email details for return confirmation
        Member member = savedRecord.getMember();
        String memberEmail = member.getUser().getEmail();
        String bookTitle = savedRecord.getBook().getTitle();
        String bookAuthor = savedRecord.getBook().getAuthor();
        Date returnDate = savedRecord.getReturnDate();

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");

        String emailSubject = "Book Returned Successfully!";
        String emailBody = String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<head>" +
                        "<style>" +
                        "body { font-family: Arial, sans-serif; }" +
                        ".container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto; }" +
                        "h2 { color: #333; }" +
                        "p { line-height: 1.6; }" +
                        ".details { background-color: #00FF00; padding: 15px; border-radius: 5px; }" +
                        ".detail-item { margin-bottom: 10px; }" +
                        "strong { color: #555; }" +
                        "</style>" +
                        "</head>" +
                        "<body>" +
                        "<div class=\"container\">" +
                        "<h2>Confirmation of Book Return</h2>" +
                        "<p>Dear %s,</p>" +
                        "<p>This email confirms that you have successfully returned the book to our library. Here are the details of the returned book:</p>" +
                        "<div class=\"details\">" +
                        "<div class=\"detail-item\"><strong>Book Title:</strong> %s</div>" +
                        "<div class=\"detail-item\"><strong>Author:</strong> %s</div>" +
                        "<div class=\"detail-item\"><strong>Return Date:</strong> %s</div>" +
                        "</div>" +
                        "<p>Thank you for using our library services!</p>" +
                        "<p>Sincerely,<br>The Librario Team</p>" +
                        "</div>" +
                        "</body>" +
                        "</html>",
                member.getUser().getName(),
                bookTitle,
                bookAuthor,
                dateFormat.format(returnDate)
        );

        EmailDetails emailDetails = new EmailDetails(memberEmail, emailSubject, emailBody, true);
        emailService.sendSimpleMail(emailDetails);

        return savedRecord;
    }

    public List<BorrowingRecord> getAllRecords() {
        return borrowingRecordRepository.findAll();
    }

    public List<BorrowingRecordDto> getBorrowedBooksByUserId(Long userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new BookNotAvailableException("Member not found."));

        List<BorrowingRecord> records = borrowingRecordRepository.findByMemberIdAndReturned(member.getId(), false);

        String membershipType = member.getMembershipType();

        return records.stream()
                .map(record -> {
                    BorrowingRecordDto dto = new BorrowingRecordDto();
                    dto.setBorrowingRecordId(record.getId());
                    dto.setBookId(record.getBook().getId());
                    dto.setBookTitle(record.getBook().getTitle());
                    dto.setBookAuthor(record.getBook().getAuthor());
                    dto.setBorrowDate(record.getBorrowDate());

                    Calendar calendar = Calendar.getInstance();
                    calendar.setTime(record.getBorrowDate());

                    if ("PREMIUM".equalsIgnoreCase(membershipType)) {
                        calendar.add(Calendar.DAY_OF_MONTH, 30);
                    } else {
                        calendar.add(Calendar.DAY_OF_MONTH, 15);
                    }

                    dto.setExpectedReturnDate(calendar.getTime());
                    dto.setReturned(record.isReturned());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void librarianBorrowBook(Long memberId, Long bookId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found."));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found."));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is not available for borrowing.");
        }

        // Create a new borrowing record
        BorrowingRecord newRecord = new BorrowingRecord();
        newRecord.setMember(member);
        newRecord.setBook(book);
        newRecord.setBorrowDate(new Date());
        newRecord.setReturned(false);
        BorrowingRecord savedRecord = borrowingRecordRepository.save(newRecord);

        // Decrease available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        // Update book status if all copies are borrowed
        if (book.getAvailableCopies() == 0) {
            book.setStatus("ON_LOAN");
        }
        bookRepository.save(book);

        // Prepare and send email
        String memberEmail = member.getUser().getEmail();
        String bookTitle = book.getTitle();
        String bookAuthor = book.getAuthor();
        Date borrowDate = savedRecord.getBorrowDate();

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(borrowDate);
        String membershipType = member.getMembershipType();
        if ("PREMIUM".equalsIgnoreCase(membershipType)) {
            calendar.add(Calendar.DAY_OF_MONTH, 30);
        } else {
            calendar.add(Calendar.DAY_OF_MONTH, 15);
        }
        Date dueDate = calendar.getTime();

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");

        String emailSubject = "Book Borrowed Successfully!";
        String emailBody = String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<head>" +
                        "<style>" +
                        "body { font-family: Arial, sans-serif; }" +
                        ".container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto; }" +
                        "h2 { color: #333; }" +
                        "p { line-height: 1.6; }" +
                        ".details { background-color: #0000FF; padding: 15px; border-radius: 5px; }" +
                        ".detail-item { margin-bottom: 10px; }" +
                        "strong { color: #555; }" +
                        "</style>" +
                        "</head>" +
                        "<body>" +
                        "<div class=\"container\">" +
                        "<h2>Confirmation of Book Borrowing</h2>" +
                        "<p>Dear %s,</p>" +
                        "<p>This email confirms that you have successfully borrowed a book from our library. Here are the details of your borrowing record:</p>" +
                        "<div class=\"details\">" +
                        "<div class=\"detail-item\"><strong>Book Title:</strong> %s</div>" +
                        "<div class=\"detail-item\"><strong>Author:</strong> %s</div>" +
                        "<div class=\"detail-item\"><strong>Borrow Date:</strong> %s</div>" +
                        "<div class=\"detail-item\"><strong>Due Date:</strong> %s</div>" +
                        "</div>" +
                        "<p>Please remember to return the book by the due date to avoid any late fees. Thank you for using our library services!</p>" +
                        "<p>Sincerely,<br>The Librario Team</p>" +
                        "</div>" +
                        "</body>" +
                        "</html>",
                member.getUser().getName(),
                bookTitle,
                bookAuthor,
                dateFormat.format(borrowDate),
                dateFormat.format(dueDate)
        );
        EmailDetails emailDetails = new EmailDetails(memberEmail, emailSubject, emailBody, true);
        emailService.sendSimpleMail(emailDetails);

        // Low Stock Email Logic for Librarian
        if (book.getAvailableCopies() == 1) {
            String librarianEmail = "anshikagarg2105@gmail.com";
            String lowStockEmailSubject = "Low Stock Alert: " + book.getTitle();
            String lowStockEmailBody = String.format(
                    "<!DOCTYPE html>" +
                            "<html>" +
                            "<head>" +
                            "<style>" +
                            "body { font-family: Arial, sans-serif; }" +
                            ".container { padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; margin: 20px auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }" +
                            ".header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                            ".content { padding: 20px; text-align: center; }" +
                            "h2 { color: white; margin: 0; }" +
                            "h3 { color: #333; }" +
                            "p { line-height: 1.6; color: #555; }" +
                            ".details-box { background-color: #ffebee; border: 1px solid #ef9a9a; border-left: 5px solid #d32f2f; padding: 15px; margin-top: 20px; text-align: left; }" +
                            "strong { color: #d32f2f; }" +
                            "</style>" +
                            "</head>" +
                            "<body>" +
                            "<div class=\"container\">" +
                            "<div class=\"header\">" +
                            "<h2>🚨 Low Stock Alert 🚨</h2>" +
                            "</div>" +
                            "<div class=\"content\">" +
                            "<h3>A book is running low in stock!</h3>" +
                            "<p>This is an automated alert to inform you that the number of available copies for a book has dropped to **1**.</p>" +
                            "<div class=\"details-box\">" +
                            "<p><strong>Book Title:</strong> %s</p>" +
                            "<p><strong>Author:</strong> %s</p>" +
                            "<p><strong>Copies Left:</strong> 1</p>" +
                            "</div>" +
                            "<p style=\"margin-top: 25px;\">Please consider re-stocking this book to ensure it remains available for members.</p>" +
                            "</div>" +
                            "</div>" +
                            "</body>" +
                            "</html>",
                    book.getTitle(),
                    book.getAuthor()
            );
            EmailDetails lowStockEmailDetails = new EmailDetails(librarianEmail, lowStockEmailSubject, lowStockEmailBody, true);
            emailService.sendSimpleMail(lowStockEmailDetails);
        }
    }

    public List<BorrowingRecordDto> getReturnedBooksByMemberId(Long memberId) {
        List<BorrowingRecord> returnedRecords = borrowingRecordRepository.findByMemberIdAndReturned(memberId, true);
        return returnedRecords.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private BorrowingRecordDto convertToDto(BorrowingRecord record) {
        BorrowingRecordDto dto = new BorrowingRecordDto();
        dto.setBorrowingRecordId(record.getId());
        dto.setMemberId(record.getMember().getId());
        dto.setBookId(record.getBook().getId());
        dto.setBookTitle(record.getBook().getTitle());
        dto.setBookAuthor(record.getBook().getAuthor());
        dto.setBorrowDate(record.getBorrowDate());
        dto.setExpectedReturnDate(null);
        dto.setReturnDate(record.getReturnDate());
        dto.setReturned(record.isReturned());
        return dto;
    }
}