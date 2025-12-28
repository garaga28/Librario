package com.librario.Controller;

import com.librario.Entity.BorrowingRecord;
import com.librario.Exception.BookNotAvailableException;
import com.librario.Service.BorrowingService;
import com.librario.dto.BorrowingRecordDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrowings")
public class BorrowingController {

    private final BorrowingService borrowingService;

    public BorrowingController(BorrowingService borrowingService) {
        this.borrowingService = borrowingService;
    }

    // This method will handle borrowing a book.
    @PostMapping("/borrow")
    public ResponseEntity<?> borrowBook(@RequestBody BorrowingRecordDto recordDto) {
        try {
            BorrowingRecord record = borrowingService.borrowBook(recordDto);
            return new ResponseEntity<>(record, HttpStatus.CREATED);
        } catch (BookNotAvailableException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // This method will handle returning a book.
    @PutMapping("/return")
    public ResponseEntity<?> returnBook(@RequestBody BorrowingRecordDto recordDto) {
        try {
            BorrowingRecord record = borrowingService.returnBook(recordDto);
            return new ResponseEntity<>(record, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // New endpoint for librarian to mark a book as returned
    @PutMapping("/librarian/return/{id}")
    public ResponseEntity<?> librarianReturnBook(@PathVariable Long id) {
        try {
            BorrowingRecord record = borrowingService.librarianReturnBook(id);
            return new ResponseEntity<>(record, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // This method will get all borrowing records.
    @GetMapping
    public ResponseEntity<List<BorrowingRecord>> getAllRecords() {
        List<BorrowingRecord> records = borrowingService.getAllRecords();
        return new ResponseEntity<>(records, HttpStatus.OK);
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<BorrowingRecordDto>> getBorrowedBooksByMemberId(@PathVariable Long memberId) {
        List<BorrowingRecordDto> records = borrowingService.getBorrowedBooksByUserId(memberId);
        return new ResponseEntity<>(records, HttpStatus.OK);
    }

    @PostMapping("/librarian/borrow")
    public ResponseEntity<?> librarianBorrowBook(@RequestBody Map<String, Long> request) {
        try {
            Long memberId = request.get("memberId");
            Long bookId = request.get("bookId");
            borrowingService.librarianBorrowBook(memberId, bookId);
            return new ResponseEntity<>("Book borrowed successfully for the member.", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to borrow book: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/returned/{memberId}")
    public ResponseEntity<List<BorrowingRecordDto>> getReturnedBooksByMemberId(@PathVariable Long memberId) {
        List<BorrowingRecordDto> records = borrowingService.getReturnedBooksByMemberId(memberId);
        return ResponseEntity.ok(records);
    }
}