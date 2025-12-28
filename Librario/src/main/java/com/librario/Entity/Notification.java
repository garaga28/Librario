package com.librario.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Entity
@Data
@Table(name = "notifications")
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private boolean isRead = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_user_id", nullable = false)
    @JsonIgnore
    private User recipient;

    private Instant createdAt = Instant.now();

    public Notification(String message, String type, User recipient) {
        this.message = message;
        this.type = type;
        this.recipient = recipient;
    }
}