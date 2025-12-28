package com.librario.Repo;

import com.librario.Entity.BorrowingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BorrowingRequestRepository extends JpaRepository<BorrowingRequest, Long> {
    List<BorrowingRequest> findByStatus(String status);
    List<BorrowingRequest> findByMemberIdAndStatus(Long memberId, String status);
    void deleteByMemberId(Long memberId);
}
