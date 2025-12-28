package com.librario.Controller;

import com.librario.Service.BorrowedBookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/librarian")
public class BorrowedBookController {

    private final BorrowedBookService borrowedBookService;

    public BorrowedBookController(BorrowedBookService borrowedBookService) {
        this.borrowedBookService = borrowedBookService;
    }

    @GetMapping("/borrowed-books")
    public ResponseEntity<List<Map<String, Object>>> getBorrowedBooks() {
        List<Map<String, Object>> borrowedBooks = borrowedBookService.getBorrowedBooks();
        return ResponseEntity.ok(borrowedBooks);
    }
}
