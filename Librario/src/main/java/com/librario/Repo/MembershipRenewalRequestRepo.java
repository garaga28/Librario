// src/main/java/com/librario/Repo/MembershipRenewalRequestRepo.java
package com.librario.Repo;

import com.librario.Entity.MembershipRenewalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRenewalRequestRepo extends JpaRepository<MembershipRenewalRequest, Long> {
    Optional<MembershipRenewalRequest> findByMemberIdAndStatus(Long memberId, String status);
    List<MembershipRenewalRequest> findByStatus(String status);
}