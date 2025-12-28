package com.librario.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Date;
import java.util.List;

@Entity
@Data
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    @OneToMany(mappedBy = "member")
    private List<BorrowingRecord> borrowingRecords;

    @Column(name = "end_date")
    private Instant endDate;

    @Column(name = "membership_type")
    private String membershipType;

    @Column(name = "start_date")
    private Instant startDate;

    private String status;

    @JsonIgnore
    public boolean isActive() {
        if (startDate == null || endDate == null) {
            return false;
        }
        Instant now = Instant.now();
        return !now.isBefore(startDate) && !now.isAfter(endDate);
    }
}
