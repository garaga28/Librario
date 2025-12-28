package com.librario.dto;

import java.time.LocalDate;

public class OverdueBookDTO {

    private Long borrowingRecordId;
    private String bookTitle;
    private Long memberId;
    private String memberName;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private long overdueDays;
    private double fineAmount;
    private String paymentStatus;

    public OverdueBookDTO() {
    }

    public OverdueBookDTO(Long borrowingRecordId, String bookTitle,long memberId, String memberName, LocalDate borrowDate, LocalDate dueDate, long overdueDays, double fineAmount, String paymentStatus) {
        this.borrowingRecordId = borrowingRecordId;
        this.bookTitle = bookTitle;
        this.memberId = memberId;
        this.memberName = memberName;
        this.borrowDate = borrowDate;
        this.dueDate = dueDate;
        this.overdueDays = overdueDays;
        this.fineAmount = fineAmount;
        this.paymentStatus = paymentStatus;
    }

    public Long getBorrowingRecordId() {
        return borrowingRecordId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public Long getMemberId() {
        return memberId;
    }

    public String getMemberName() {
        return memberName;
    }

    public LocalDate getBorrowDate() {
        return borrowDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public long getOverdueDays() {
        return overdueDays;
    }

    public double getFineAmount() {
        return fineAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setBorrowingRecordId(Long borrowingRecordId) {
        this.borrowingRecordId = borrowingRecordId;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public void setMemberName(String memberName) {
        this.memberName = memberName;
    }

    public void setBorrowDate(LocalDate borrowDate) {
        this.borrowDate = borrowDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public void setOverdueDays(long overdueDays) {
        this.overdueDays = overdueDays;
    }

    public void setFineAmount(double fineAmount) {
        this.fineAmount = fineAmount;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}