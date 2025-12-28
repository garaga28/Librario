package com.librario.Controller;

import com.librario.Entity.*;
import com.librario.Repo.BorrowingRecordRepository;
import com.librario.Repo.PaymentRepository;
import com.librario.Service.RazorpayService;
import com.librario.dto.OnlineOrderRequest;
import com.librario.dto.PaymentHistoryDTO;
import com.razorpay.Order;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class RazorpayController {

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BorrowingRecordRepository borrowingRecordRepository;

    /*@GetMapping("/createOnlineOrder")
    public ResponseEntity<String> createOnlineOrder(
            @RequestParam Long memberId,
            @RequestParam BigDecimal amount,
            @RequestParam PaymentType type,
            @RequestParam(required = false) Optional<Long> borrowingRecordId) {
        try {
            Order order = razorpayService.createOnlineOrder(memberId, amount, type, "receipt_" + System.currentTimeMillis(), borrowingRecordId);
            return new ResponseEntity<>(order.toString(), HttpStatus.OK);
        } catch (RazorpayException e) {
            return new ResponseEntity<>("Error creating Razorpay order: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }*/
    @PostMapping("/createOnlineOrder")
    public ResponseEntity<String> createOnlineOrder(@RequestBody OnlineOrderRequest request) {
        try {
            // Check borrowingRecordId is provided for overdue charges.
            if (request.getType() == PaymentType.overdue_charges && request.getBorrowingRecordId().isEmpty()) {
                return new ResponseEntity<>("borrowingRecordId is mandatory for overdue charges.", HttpStatus.BAD_REQUEST);
            }

            Order order = razorpayService.createOnlineOrder(
                    request.getMemberId(),
                    request.getAmount(),
                    request.getType(),
                    "receipt_" + System.currentTimeMillis(),
                    request.getBorrowingRecordId()
            );
            return new ResponseEntity<>(order.toString(), HttpStatus.OK);
        } catch (RazorpayException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error creating Razorpay order: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/verifyPayment")
    public ResponseEntity<String> verifyPayment(@RequestParam String orderId, @RequestParam String paymentId, @RequestParam String razorpaySignature) {
        if (razorpayService.verifyOnlinePayment(orderId, paymentId, razorpaySignature)) {
            // Payment is successful and verified. Business logic to update user/borrowing records
            // can be implemented here or in the service layer.
            return new ResponseEntity<>("Payment successful and verified!", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Payment verification failed.", HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/recordCashPayment")
    public ResponseEntity<String> recordCashPayment(
            @RequestParam Long memberId,
            @RequestParam BigDecimal amount,
            @RequestParam PaymentType type,
            @RequestParam(required = false) Optional<Long> borrowingRecordId) {
        try {
            Payment payment = new Payment();
            payment.setMemberId(memberId);
            payment.setAmount(amount);
            payment.setType(type);
            payment.setPaymentMethod(PaymentMethod.cash);
            payment.setStatus(PaymentStatus.completed);
            borrowingRecordId.ifPresent(payment::setBorrowingRecordId);

            paymentRepository.save(payment);
            if (borrowingRecordId.isPresent()) {
                Optional<BorrowingRecord> recordOptional = borrowingRecordRepository.findById(borrowingRecordId.get());
                if (recordOptional.isPresent()) {
                    BorrowingRecord record = recordOptional.get();
                    record.setReturned(true);
                    borrowingRecordRepository.save(record);
                }
            }

            return new ResponseEntity<>("Cash payment recorded successfully!", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error recording cash payment: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/history/member/{memberId}")
    public ResponseEntity<List<Payment>> getPaymentHistory(@PathVariable Long memberId) {
        List<Payment> payments = razorpayService.getPaymentHistoryByMemberId(memberId);
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }

    @GetMapping("/history/all")
    public ResponseEntity<List<PaymentHistoryDTO>> getAllPaymentHistory() {
        try {
            List<PaymentHistoryDTO> paymentHistory = razorpayService.getAllPaymentHistory();
            return new ResponseEntity<>(paymentHistory, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}