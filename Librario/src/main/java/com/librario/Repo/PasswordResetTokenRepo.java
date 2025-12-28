package com.librario.Repo;

import com.librario.Entity.PasswordResetToken;
import com.librario.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepo extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByUser_EmailAndOtpHashAndExpiryTimeAfterAndUsedFalse(String email, String otpHash, Date now);

    Optional<PasswordResetToken> findByUser_EmailAndUsedFalseAndExpiryTimeAfter(String email, Date expiryTime);

    List<PasswordResetToken> findByUserAndUsedFalse(User user);
}
