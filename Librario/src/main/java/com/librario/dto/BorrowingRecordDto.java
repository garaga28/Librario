package com.librario.dto;

import lombok.Data;
import java.util.Date;

@Data
public class BorrowingRecordDto {
    private Long borrowingRecordId;
    private Long memberId;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private Date borrowDate;
    private Date expectedReturnDate;
    private Date returnDate;
    private boolean isReturned;
}