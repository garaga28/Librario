package com.librario.Controller;

import com.librario.Service.OverdueService;
import com.librario.dto.OverdueBookDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/overdue")
public class OverdueController {

    @Autowired
    private OverdueService overdueService;

    // LIBRARIANS and ADMINS to see all overdue books.
    @GetMapping("/books")
    public ResponseEntity<List<OverdueBookDTO>> getAllOverdueBooks() {
        List<OverdueBookDTO> overdueBooks = overdueService.getOverdueBooks();
        if (overdueBooks.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(overdueBooks, HttpStatus.OK);
    }

    // MEMBER to see their own overdue books.
    @GetMapping("/books/member/{memberId}")
    public ResponseEntity<List<OverdueBookDTO>> getMemberOverdueBooks(@PathVariable Long memberId) {
        List<OverdueBookDTO> overdueBooks = overdueService.getOverdueBooksByMemberId(memberId);
        if (overdueBooks.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(overdueBooks, HttpStatus.OK);
    }

    @PutMapping("/{borrowingRecordId}/payment-status")
    public ResponseEntity<String> updatePaymentStatus(@PathVariable Long borrowingRecordId) {
        try {
            overdueService.markOverduePaymentCompleted(borrowingRecordId);
            return ResponseEntity.ok("Payment for borrowing record " + borrowingRecordId + " marked as completed.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}