package com.librario.Service;

import com.librario.Entity.Payment;
import com.librario.Repo.PaymentRepository;
import com.librario.Entity.PaymentMethod;
import com.librario.Entity.PaymentStatus;
import com.librario.Entity.PaymentType;
import com.librario.Entity.BorrowingRecord;
import com.librario.Entity.Member;
import com.librario.Entity.Book;
import com.librario.Repo.MemberRepo;
import com.librario.Repo.BorrowingRecordRepository;
import com.librario.dto.EmailDetails;
import com.librario.dto.PaymentHistoryDTO;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RazorpayService {

    @Value("${razorpay.api.key}")
    private String apiKey;

    @Value("${razorpay.api.secret}")
    private String apiSecret;

    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private MemberRepo memberRepo;
    @Autowired
    private BorrowingRecordRepository borrowingRecordRepository;
    @Autowired
    private NotificationService notificationService;

    public Order createOnlineOrder(Long memberId, BigDecimal amount, PaymentType type, String receipt, Optional<Long> borrowingRecordId) throws RazorpayException {
        RazorpayClient razorpayClient = new RazorpayClient(apiKey, apiSecret);
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receipt);

        Order order = razorpayClient.Orders.create(orderRequest);

        // Store a new payment record as pending
        Payment payment = new Payment();
        payment.setMemberId(memberId);
        payment.setAmount(amount);
        payment.setType(type);
        payment.setPaymentMethod(PaymentMethod.online);
        payment.setStatus(PaymentStatus.pending);
        payment.setRazorpayOrderId(order.get("id"));
        borrowingRecordId.ifPresent(payment::setBorrowingRecordId);

        paymentRepository.save(payment);

        return order;
    }

    public boolean verifyOnlinePayment(String orderId, String paymentId, String razorpaySignature) {
        try {
            // Find the pending payment record
            Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment record not found for order ID: " + orderId));

            String payload = orderId + "|" + paymentId;
            boolean isVerified = Utils.verifySignature(payload, razorpaySignature, apiSecret);

            if (isVerified) {
                // Update payment record with successful details
                payment.setStatus(PaymentStatus.completed);
                payment.setRazorpayPaymentId(paymentId);
                payment.setRazorpaySignature(razorpaySignature);
                paymentRepository.save(payment);

                Optional<Member> memberOptional = memberRepo.findById(payment.getMemberId());
                if (memberOptional.isPresent()) {
                    Member member = memberOptional.get();
                    notificationService.createNotification(
                            "A new online payment of Rs. " + payment.getAmount() + " has been received from " + member.getUser().getName() + ".",
                            "payment"
                    );
                }

                sendPaymentConfirmationEmail(payment);
            } else {
                payment.setStatus(PaymentStatus.failed);
                paymentRepository.save(payment);
            }
            return isVerified;
        } catch (RazorpayException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public void recordCashPayment(Long memberId, BigDecimal amount, PaymentType type, Optional<Long> borrowingRecordId) {
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
            Optional<Member> memberOptional = memberRepo.findById(payment.getMemberId());
            if (memberOptional.isPresent()) {
                Member member = memberOptional.get();
                notificationService.createNotification(
                        "A cash payment of Rs. " + payment.getAmount() + " has been recorded for " + member.getUser().getName() + ".",
                        "payment"
                );
            }
        }
        sendPaymentConfirmationEmail(payment);
    }

    public List<Payment> getPaymentHistoryByMemberId(Long memberId) {
        return paymentRepository.findByMemberIdOrderByCreatedAtDesc(memberId);
    }

    private void sendPaymentConfirmationEmail(Payment payment) {
        try {
            Optional<BorrowingRecord> recordOptional = borrowingRecordRepository.findById(payment.getBorrowingRecordId());
            if (recordOptional.isPresent()) {
                BorrowingRecord record = recordOptional.get();
                Optional<Member> memberOptional = memberRepo.findById(payment.getMemberId());
                if (memberOptional.isPresent()) {
                    Member member = memberOptional.get();
                    Book book = record.getBook();

                    String memberEmail = member.getUser().getEmail();
                    String emailSubject = "Payment Confirmation: Overdue Charges for " + book.getTitle();
                    String emailBody = String.format(
                            "<!DOCTYPE html>" +
                                    "<html>" +
                                    "<head>" +
                                    "<style>" +
                                    "body { font-family: Arial, sans-serif; }" +
                                    ".container { padding: 20px; border: 1px solid #c8e6c9; border-radius: 5px; max-width: 600px; margin: auto; background-color: #e8f5e9; }" +
                                    ".header { background-color: #4CAF50; color: white; padding: 15px; text-align: center; font-size: 24px; border-radius: 5px 5px 0 0; }" +
                                    ".content { padding: 20px; }" +
                                    "p { line-height: 1.6; color: #333; }" +
                                    ".details { background-color: #f1f8e9; padding: 15px; border-left: 4px solid #81C784; }" +
                                    ".detail-item { margin-bottom: 10px; }" +
                                    "strong { color: #2e7d32; }" +
                                    ".amount { color: #1b5e20; font-weight: bold; }" +
                                    "</style>" +
                                    "</head>" +
                                    "<body>" +
                                    "<div class=\"container\">" +
                                    "<div class=\"header\">Payment Received!</div>" +
                                    "<div class=\"content\">" +
                                    "<p>Dear %s,</p>" +
                                    "<p>Thank you for your recent payment. We have successfully received the overdue charges for the following book:</p>" +
                                    "<div class=\"details\">" +
                                    "<div class=\"detail-item\"><strong>Book Title:</strong> %s</div>" +
                                    "<div class=\"detail-item\"><strong>Author:</strong> %s</div>" +
                                    "<div class=\"detail-item\"><strong>Amount Paid:</strong> Rs. %.2f</div>" +
                                    "</div>" +
                                    "<p style='margin-top: 20px;'>Your account has been updated. We appreciate your prompt payment.</p>" +
                                    "<p>Sincerely,<br>The Librario Team</p>" +
                                    "</div>" +
                                    "</div>" +
                                    "</body>" +
                                    "</html>",
                            member.getUser().getName(),
                            book.getTitle(),
                            book.getAuthor(),
                            payment.getAmount()
                    );
                    EmailDetails emailDetails = new EmailDetails(memberEmail, emailSubject, emailBody, true);
                    emailService.sendSimpleMail(emailDetails);
                }
            }

        } catch (Exception e) {
            System.err.println("Failed to send payment confirmation email: " + e.getMessage());
        }


    }


    public List<PaymentHistoryDTO> getAllPaymentHistory() {
        return paymentRepository.findAll().stream().map(payment -> {
            String memberName = "N/A";
            Optional<Member> memberOptional = memberRepo.findById(payment.getMemberId());
            if (memberOptional.isPresent()) {
                Member member = memberOptional.get();
                if (member.getUser() != null) {
                    memberName = member.getUser().getName();
                }
            }
            return new PaymentHistoryDTO(payment, memberName);
        }).collect(Collectors.toList());
    }
}