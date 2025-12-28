package com.librario.Repo;

import com.librario.Entity.BorrowingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface BorrowingRecordRepository extends JpaRepository<BorrowingRecord, Long> {

    Optional<BorrowingRecord> findByMemberIdAndBookIdAndReturnedFalse(Long memberId, Long bookId);

    List<BorrowingRecord> findByMemberIdAndReturned(Long memberId, boolean returned);

    List<BorrowingRecord> findByReturned(boolean returned);

    void deleteByBookId(Long id);

    void deleteByMemberId(Long id);

    // BorrowingRecordRepository.java
    List<BorrowingRecord> findByMemberId(Long memberId);
}