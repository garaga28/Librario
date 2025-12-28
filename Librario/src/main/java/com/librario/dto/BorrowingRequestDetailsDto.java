package com.librario.dto;

import com.librario.Entity.BorrowingRequest;
import java.util.Date;
import lombok.Data;

@Data
public class BorrowingRequestDetailsDto {
    private Long requestId;
    private String memberName;
    private String bookTitle;
    private Date requestDate;
    private String status;

    public BorrowingRequestDetailsDto(BorrowingRequest request, String memberName, String bookTitle) {
        this.requestId = request.getRequestId();
        this.memberName = memberName;
        this.bookTitle = bookTitle;
        this.requestDate = request.getRequestDate();
        this.status = request.getStatus();
    }
}