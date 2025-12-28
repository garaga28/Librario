package com.librario.Service;

import com.librario.Entity.BorrowingRecord;
import com.librario.Entity.BorrowingRequest;
import com.librario.Entity.Member;
import com.librario.Entity.Book;
import com.librario.Repo.BorrowingRequestRepository;
import com.librario.Repo.BorrowingRecordRepository;
import com.librario.Repo.MemberRepo;
import com.librario.Repo.BookRepo;
import com.librario.dto.BorrowingRequestDetailsDto;
import com.librario.dto.EmailDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BorrowingRequestService {

    private final BorrowingRequestRepository borrowingRequestRepository;
    private final BorrowingRecordRepository borrowingRecordRepository;
    private final MemberRepo memberRepo;
    private final BookRepo bookRepo;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Autowired
    public BorrowingRequestService(BorrowingRequestRepository borrowingRequestRepository, BorrowingRecordRepository borrowingRecordRepository, MemberRepo memberRepo, BookRepo bookRepo, EmailService emailService, SimpMessagingTemplate messagingTemplate, NotificationService notificationService) {
        this.borrowingRequestRepository = borrowingRequestRepository;
        this.borrowingRecordRepository = borrowingRecordRepository;
        this.memberRepo = memberRepo;
        this.bookRepo = bookRepo;
        this.emailService = emailService;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    public BorrowingRequest submitRequest(Long memberId, Long bookId) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with id: " + memberId));

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + bookId));

        Optional<BorrowingRequest> existingRequest = borrowingRequestRepository.findByMemberIdAndStatus(memberId, "PENDING")
                .stream()
                .filter(request -> request.getBookId().equals(bookId))
                .findFirst();

        if (existingRequest.isPresent()) {
            throw new IllegalStateException("A pending borrowing request for this book already exists for this member.");
        }

        BorrowingRequest request = new BorrowingRequest();
        request.setMemberId(memberId);
        request.setBookId(bookId);
        request.setRequestDate(new Date());
        request.setStatus("PENDING");
        BorrowingRequest savedRequest = borrowingRequestRepository.save(request);

        // Add this line to send the notification
        notificationService.createNotification(
                "A new borrowing request for '" + book.getTitle() + "' has been submitted by " + member.getUser().getName() + ".",
                "borrowingRequest"
        );
        return savedRequest;
    }

    public List<BorrowingRequestDetailsDto> getPendingRequests() {
        List<BorrowingRequest> pendingRequests = borrowingRequestRepository.findByStatus("PENDING");

        return pendingRequests.stream().map(request -> {
            // Corrected: Get the member's name from the 'name' field in the associated User entity
            String memberName = memberRepo.findById(request.getMemberId())
                    .map(member -> member.getUser().getName())
                    .orElse("Unknown Member");

            // Book's title is correct as per your Book.java file
            String bookTitle = bookRepo.findById(request.getBookId())
                    .map(Book::getTitle)
                    .orElse("Unknown Book");

            return new BorrowingRequestDetailsDto(request, memberName, bookTitle);
        }).collect(Collectors.toList());
    }

    @Transactional
    public boolean acceptRequest(Long requestId) {
        Optional<BorrowingRequest> optionalRequest = borrowingRequestRepository.findById(requestId);
        if (optionalRequest.isPresent()) {
            BorrowingRequest request = optionalRequest.get();
            if ("PENDING".equals(request.getStatus())) {
                Book book = bookRepo.findById(request.getBookId())
                        .orElseThrow(() -> new RuntimeException("Book not found"));

                if (book.getAvailableCopies() > 0) {
                    Member member = memberRepo.findById(request.getMemberId())
                            .orElseThrow(() -> new RuntimeException("Member not found"));

                    BorrowingRecord newRecord = new BorrowingRecord();
                    newRecord.setMember(member);
                    newRecord.setBook(book);
                    newRecord.setBorrowDate(new Date());
                    newRecord.setReturned(false);
                    BorrowingRecord savedRecord = borrowingRecordRepository.save(newRecord);

                    book.setAvailableCopies(book.getAvailableCopies() - 1);
                    if (book.getAvailableCopies() == 0) {
                        book.setStatus("ON_LOAN");
                    }
                    bookRepo.save(book);

                    request.setStatus("ACCEPTED");
                    borrowingRequestRepository.save(request);

                    // Start of new email logic
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
                    // End of new email logic
                    notificationService.createNotification(
                            "Borrowing request for '" + bookRepo.findById(request.getBookId()).get().getTitle() + "' has been approved for " + memberRepo.findById(request.getMemberId()).get().getUser().getName() + ".",
                            "borrowingRequest"
                    );

                    notificationService.createNotificationForUser(member.getUser(), "Your borrowing request for \"" + book.getTitle() + "\" has been approved.", "borrowingRequest");

                    // Low Stock Email Logic for Librarian (newly added)
                    if (book.getAvailableCopies() == 1) {
                        String librarianEmail = "anshikagarg2105@gmail.com"; // Replace with actual librarian email
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
                    return true;
                }
            }
        }
        return false;
    }


    public boolean rejectRequest(Long requestId) {
        Optional<BorrowingRequest> optionalRequest = borrowingRequestRepository.findById(requestId);
        if (optionalRequest.isPresent()) {
            BorrowingRequest request = optionalRequest.get();
            if ("PENDING".equals(request.getStatus())) {
                request.setStatus("REJECTED");
                borrowingRequestRepository.save(request);
                notificationService.createNotification(
                        "Borrowing request for '" + bookRepo.findById(request.getBookId()).get().getTitle() + "' has been rejected for " + memberRepo.findById(request.getMemberId()).get().getUser().getName() + ".",
                        "borrowingRequest"
                );
                return true;
            }
        }
        return false;
    }

    public List<BorrowingRequest> getPendingRequestsByMemberId(Long memberId) {
        return borrowingRequestRepository.findByMemberIdAndStatus(memberId, "PENDING");
    }

    public List<BorrowingRequest> getPendingRequestsByUserId(Long userId) {
        Optional<Member> member = memberRepo.findByUserId(userId);
        if (member.isPresent()) {
            Long memberId = member.get().getId();
            return borrowingRequestRepository.findByMemberIdAndStatus(memberId, "PENDING");
        }
        return List.of(); // Return an empty list if no member is found for the given userId
    }

    //added this for userdashboard title and author
    public List<BorrowingRequestDetailsDto> getPendingRequestsByMemberIdWithBookDetails(Long memberId) {
        return borrowingRequestRepository.findByMemberIdAndStatus(memberId, "PENDING")
                .stream()
                .map(request -> {
                    Optional<Book> bookOptional = bookRepo.findById(request.getBookId());
                    String bookTitle = bookOptional.map(Book::getTitle).orElse("Unknown Title");
                    return new BorrowingRequestDetailsDto(request, "", bookTitle);
                })
                .collect(Collectors.toList());
    }

}