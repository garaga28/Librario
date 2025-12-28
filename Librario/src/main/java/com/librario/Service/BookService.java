package com.librario.Service;

import com.librario.Entity.Book;
import com.librario.Repo.BookRepo;
import com.librario.Repo.BorrowingRecordRepository;
import com.librario.dto.BookDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepo bookRepo;

    @Autowired
    private BorrowingRecordRepository borrowingRecordRepo;

    public Book addBook(BookDto bookDto) {
        Book book = new Book();
        book.setTitle(bookDto.getTitle());
        book.setAuthor(bookDto.getAuthor());
        book.setGenre(bookDto.getGenre());
        book.setPublisher(bookDto.getPublisher());
        book.setPublicationYear(bookDto.getPublicationYear());
        book.setIsbn(bookDto.getIsbn());
        book.setTotalCopies(bookDto.getTotalCopies());
        book.setAvailableCopies(bookDto.getTotalCopies());
        book.setStatus("AVAILABLE");
        book.setShelfLocation(bookDto.getShelfLocation());
        book.setImageUrl(bookDto.getImageUrl());
        return bookRepo.save(book);
    }

    public Book updateBook(Long id, BookDto bookDto) {
        Optional<Book> bookOptional = bookRepo.findById(id);
        if (bookOptional.isPresent()) {
            Book book = bookOptional.get();

            // Calculate the number of books currently on loan
            int borrowedCopies = book.getTotalCopies() - book.getAvailableCopies();

            // Check if the total number of copies has changed
            if (bookDto.getTotalCopies() != book.getTotalCopies()) {
                // Recalculate available copies based on the change in total copies
                int newAvailableCopies = bookDto.getTotalCopies() - borrowedCopies;

                // Ensure available copies don't exceed the new total copies
                book.setAvailableCopies(Math.max(0, newAvailableCopies));

                // Update the status based on new available copies
                if (newAvailableCopies > 0) {
                    book.setStatus("AVAILABLE");
                } else {
                    book.setStatus("ON_LOAN");
                }
            } else {
                // If total copies hasn't changed, update available copies from DTO
                book.setAvailableCopies(bookDto.getAvailableCopies());
            }

            book.setTitle(bookDto.getTitle());
            book.setAuthor(bookDto.getAuthor());
            book.setGenre(bookDto.getGenre());
            book.setPublisher(bookDto.getPublisher());
            book.setPublicationYear(bookDto.getPublicationYear());
            book.setIsbn(bookDto.getIsbn());
            book.setTotalCopies(bookDto.getTotalCopies());
            book.setShelfLocation(bookDto.getShelfLocation());
            book.setImageUrl(bookDto.getImageUrl());
            book.setUpdatedAt(new Date());

            return bookRepo.save(book);
        }
        return null;
    }

    @Transactional
    public void deleteBook(Long id) {
        borrowingRecordRepo.deleteByBookId(id);
        bookRepo.deleteById(id);
    }

    public Optional<Book> getBookById(Long id) {
        return bookRepo.findById(id);
    }

    public List<Book> getAllBooks() {
        return bookRepo.findAll();
    }

    // New method for a member borrowing a book
    public boolean borrowBook(Long id) {
        Optional<Book> bookOptional = bookRepo.findById(id);
        if (bookOptional.isPresent()) {
            Book book = bookOptional.get();
            if (book.getAvailableCopies() > 0) {
                book.setAvailableCopies(book.getAvailableCopies() - 1);
                if (book.getAvailableCopies() == 0) {
                    book.setStatus("ON_LOAN");
                }
                book.setUpdatedAt(new Date());
                bookRepo.save(book);
                return true;
            }
        }
        return false;
    }

    // New method for a member returning a book
    public boolean returnBook(Long id) {
        Optional<Book> bookOptional = bookRepo.findById(id);
        if (bookOptional.isPresent()) {
            Book book = bookOptional.get();
            if (book.getAvailableCopies() < book.getTotalCopies()) {
                book.setAvailableCopies(book.getAvailableCopies() + 1);
                if (book.getAvailableCopies() == book.getTotalCopies()) {
                    book.setStatus("AVAILABLE");
                }
                book.setUpdatedAt(new Date());
                bookRepo.save(book);
                return true;
            }
        }
        return false;
    }
}
