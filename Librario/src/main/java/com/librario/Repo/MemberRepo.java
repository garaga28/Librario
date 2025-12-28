package com.librario.Repo;

import com.librario.Entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepo extends JpaRepository<Member, Long> {
    Optional<Member> findByUserId(Long userId);
}
