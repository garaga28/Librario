package com.librario.Controller;

import com.librario.Entity.Book;
import com.librario.Service.BookService;
import com.librario.dto.BookDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    // ================== ADD BOOK (OPTION 1) ==================
    @PostMapping("/add")
    public ResponseEntity<Book> addBook(@RequestBody BookDto bookDto) {
        Book newBook = bookService.addBook(bookDto);
        return new ResponseEntity<>(newBook, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody BookDto bookDto) {
        Book updatedBook = bookService.updateBook(id, bookDto);
        if (updatedBook != null) return new ResponseEntity<>(updatedBook, HttpStatus.OK);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookService.getAllBooks();
        return new ResponseEntity<>(books, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(book -> new ResponseEntity<>(book, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/{id}/borrow")
    public ResponseEntity<Void> borrowBook(@PathVariable Long id) {
        boolean borrowed = bookService.borrowBook(id);
        return borrowed ? new ResponseEntity<>(HttpStatus.OK) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<Void> returnBook(@PathVariable Long id) {
        boolean returned = bookService.returnBook(id);
        return returned ? new ResponseEntity<>(HttpStatus.OK) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
