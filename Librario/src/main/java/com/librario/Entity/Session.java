package com.librario.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
@Table(name = "sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "login_time", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date loginTime;

    @Column(name = "logout_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date logoutTime;

    @Column(nullable = false, unique = true)
    private String token;
}
