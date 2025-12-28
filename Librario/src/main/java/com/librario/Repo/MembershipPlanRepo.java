package com.librario.Repo;

import com.librario.Entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipPlanRepo extends JpaRepository<MembershipPlan, Long> {
    Optional<MembershipPlan> findByTypeIgnoreCase(String type);
}
