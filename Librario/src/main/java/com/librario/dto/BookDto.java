package com.librario.dto;

import lombok.Data;

@Data
public class BookDto {
    private String title;
    private String author;
    private String genre;
    private String publisher;
    private Integer publicationYear;
    private String isbn;
    private Integer totalCopies;
    private String shelfLocation;
    private String imageUrl; //Added this
    private Integer availableCopies;

    public Integer getAvailableCopies() {
        return availableCopies;
    }
}
