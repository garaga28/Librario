package com.librario.Service;

import com.librario.Entity.MembershipPlan;
import com.librario.Repo.MembershipPlanRepo;
import com.librario.dto.MembershipPlanDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MembershipPlanService {

    @Autowired
    private MembershipPlanRepo membershipPlanRepo;

    // Method to add a new membership plan
    public MembershipPlan addPlan(MembershipPlanDto planDto) {
        MembershipPlan plan = new MembershipPlan();
        plan.setType(planDto.getType());
        plan.setFees(planDto.getFees());
        plan.setBorrowingLimit(planDto.getBorrowingLimit());
        plan.setDurationInMonths(planDto.getDurationInMonths());
        return membershipPlanRepo.save(plan);
    }

    public MembershipPlan updatePlan(Long id, MembershipPlanDto planDto) {
        MembershipPlan plan = membershipPlanRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Membership plan not found with ID: " + id));

        Optional<MembershipPlan> existingPlanByType = membershipPlanRepo.findByTypeIgnoreCase(planDto.getType());
        if (existingPlanByType.isPresent() && !existingPlanByType.get().getId().equals(id)) {
            throw new IllegalArgumentException("Another plan with this type already exists.");
        }

        plan.setType(planDto.getType());
        plan.setFees(planDto.getFees());
        plan.setBorrowingLimit(planDto.getBorrowingLimit());
        plan.setDurationInMonths(planDto.getDurationInMonths());
        return membershipPlanRepo.save(plan);
    }

    // Method to get a membership plan by its type
    public Optional<MembershipPlan> getPlanByType(String type) {
        return membershipPlanRepo.findAll().stream()
                .filter(plan -> plan.getType().equalsIgnoreCase(type))
                .findFirst();
    }

    // Method to get all membership plans
    public List<MembershipPlan> getAllPlans() {
        return membershipPlanRepo.findAll();
    }

    // Method to delete a membership plan
    public void deletePlan(Long id) {
        membershipPlanRepo.deleteById(id);
    }
}
