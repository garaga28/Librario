// src/main/java/com/librario/Entity/MembershipRenewalRequest.java
package com.librario.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Data
@Table(name = "membership_renewal_requests")
public class MembershipRenewalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "member_id", referencedColumnName = "id", nullable = false)
    private Member member;

    private String status; // PENDING, APPROVED, REJECTED

    private Instant requestedDate;

    private Instant processedDate;
}