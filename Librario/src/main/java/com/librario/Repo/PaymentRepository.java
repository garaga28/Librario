package com.librario.Repo;

import com.librario.Entity.Payment;
import com.librario.Entity.PaymentStatus;
import com.librario.Entity.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    List<Payment> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    Optional<Payment> findByBorrowingRecordIdAndStatusAndType(Long borrowingRecordId, PaymentStatus status, PaymentType type);

    // NEW: Method to check if a completed payment exists for a borrowing record
    boolean existsByBorrowingRecordIdAndStatusAndType(Long borrowingRecordId, PaymentStatus status, PaymentType type);
    // PaymentRepository.java
    void deleteByBorrowingRecordId(Long borrowingRecordId);
    // PaymentRepository.java
    void deleteByMemberId(Long memberId);
}