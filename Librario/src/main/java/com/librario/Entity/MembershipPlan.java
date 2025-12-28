package com.librario.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "membership_plans")
public class MembershipPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String type; // BASIC, PREMIUM

    @Column(nullable = false)
    private Double fees;

    @Column(nullable = false)
    private Integer borrowingLimit;

    @Column(nullable = false)
    private Integer durationInMonths;
}
