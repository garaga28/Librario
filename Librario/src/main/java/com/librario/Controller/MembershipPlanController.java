package com.librario.Controller;

import com.librario.Entity.MembershipPlan;
import com.librario.Service.MembershipPlanService;
import com.librario.dto.MembershipPlanDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership-plans")
public class MembershipPlanController {

    @Autowired
    private MembershipPlanService membershipPlanService;

    // Secured for ADMIN and LIBRARIAN roles
    @PostMapping
    public ResponseEntity<MembershipPlan> addPlan(@RequestBody MembershipPlanDto planDto) {
        MembershipPlan newPlan = membershipPlanService.addPlan(planDto);
        return new ResponseEntity<>(newPlan, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MembershipPlan> updatePlan(@PathVariable Long id, @RequestBody MembershipPlanDto planDto) {
        MembershipPlan updatedPlan = membershipPlanService.updatePlan(id, planDto);
        return new ResponseEntity<>(updatedPlan, HttpStatus.OK);
    }

    // Secured for ADMIN and LIBRARIAN roles
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        membershipPlanService.deletePlan(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Accessible to all authenticated users (members can view plan options)
    @GetMapping
    public ResponseEntity<List<MembershipPlan>> getAllPlans() {
        List<MembershipPlan> plans = membershipPlanService.getAllPlans();
        return new ResponseEntity<>(plans, HttpStatus.OK);
    }
}
