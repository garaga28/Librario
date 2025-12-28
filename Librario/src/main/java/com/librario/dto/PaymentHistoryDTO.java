package com.librario.dto;

import com.librario.Entity.Payment;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentHistoryDTO {
    private Long paymentId;
    private String memberName;
    private BigDecimal amount;
    private String type;
    private String paymentMethod;
    private String status;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    public PaymentHistoryDTO(Payment payment, String memberName) {
        this.paymentId = payment.getPayment_id();
        this.memberName = memberName;
        this.amount = payment.getAmount();
        this.type = payment.getType().toString();
        this.paymentMethod = payment.getPaymentMethod().toString();
        this.status = payment.getStatus().toString();
        this.razorpayOrderId = payment.getRazorpayOrderId();
        this.razorpayPaymentId = payment.getRazorpayPaymentId();
        this.razorpaySignature = payment.getRazorpaySignature();
    }
}