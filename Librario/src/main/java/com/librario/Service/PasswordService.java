package com.librario.Service;

import com.librario.Entity.PasswordResetToken;
import com.librario.Entity.User;
import com.librario.Repo.PasswordResetTokenRepo;
import com.librario.Repo.UserRepo;
import com.librario.dto.EmailDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class PasswordService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepo passwordResetTokenRepo;

    private final Random random = new Random();

    @Autowired
    public PasswordService(
            UserRepo userRepo,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            PasswordResetTokenRepo passwordResetTokenRepo
    ) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.passwordResetTokenRepo = passwordResetTokenRepo;
    }

    // ================================
    // REQUIRED BY CONTROLLER
    // ================================

    public void sendOtp(String email) {
        createAndSendResetToken(email);
    }

    public boolean verifyOtp(String email, String otp) {
        Optional<PasswordResetToken> tokenOptional =
                passwordResetTokenRepo
                        .findByUser_EmailAndUsedFalseAndExpiryTimeAfter(email, new Date());

        if (tokenOptional.isEmpty()) {
            return false;
        }

        PasswordResetToken token = tokenOptional.get();
        return passwordEncoder.matches(otp, token.getOtpHash());
    }

    public boolean resetPassword(String email, String otp, String newPassword) {
        Optional<PasswordResetToken> tokenOptional =
                passwordResetTokenRepo
                        .findByUser_EmailAndUsedFalseAndExpiryTimeAfter(email, new Date());

        if (tokenOptional.isEmpty()) {
            return false;
        }

        PasswordResetToken token = tokenOptional.get();

        if (!passwordEncoder.matches(otp, token.getOtpHash())) {
            return false;
        }

        token.setUsed(true);
        passwordResetTokenRepo.save(token);

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        return true;
    }

    // ================================
    // INTERNAL HELPER (PRIVATE LOGIC)
    // ================================

    private void createAndSendResetToken(String email) {
        Optional<User> userOptional = userRepo.findByEmail(email);

        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        User user = userOptional.get();

        // Invalidate old tokens
        List<PasswordResetToken> oldTokens =
                passwordResetTokenRepo.findByUserAndUsedFalse(user);

        for (PasswordResetToken t : oldTokens) {
            t.setUsed(true);
            passwordResetTokenRepo.save(t);
        }

        String otp = String.format("%06d", random.nextInt(999999));
        String otpHash = passwordEncoder.encode(otp);
        Date expiryTime = new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(15));

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setOtpHash(otpHash);
        token.setExpiryTime(expiryTime);
        token.setUsed(false);

        passwordResetTokenRepo.save(token);

        String subject = "Librario Password Reset Code";
        String body =
                "<html><body>" +
                        "<p>Your password reset OTP is:</p>" +
                        "<h2 style='color:blue'>" + otp + "</h2>" +
                        "<p>This OTP is valid for 15 minutes.</p>" +
                        "</body></html>";

        emailService.sendSimpleMail(
                new EmailDetails(email, body, subject, true)
        );
    }
}


/*package com.librario.Service;

import com.librario.Entity.PasswordResetToken;
import com.librario.Entity.User;
import com.librario.Repo.PasswordResetTokenRepo;
import com.librario.Repo.UserRepo;
import com.librario.dto.EmailDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class PasswordService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepo passwordResetTokenRepo;
    private final Random random = new Random();

    @Autowired
    public PasswordService(UserRepo userRepo, PasswordEncoder passwordEncoder, EmailService emailService, PasswordResetTokenRepo passwordResetTokenRepo) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.passwordResetTokenRepo = passwordResetTokenRepo;
    }

    public void createAndSendResetToken(String email) {
        Optional<User> userOptional = userRepo.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Invalidate any existing, unused tokens for this user
            List<PasswordResetToken> existingTokens = passwordResetTokenRepo.findByUserAndUsedFalse(user);
            existingTokens.forEach(token -> {
                token.setUsed(true);
                passwordResetTokenRepo.save(token);
            });
            String otp = String.format("%06d", random.nextInt(999999));
            String otpHash = passwordEncoder.encode(otp);
            Date expiryTime = new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(15));

            PasswordResetToken token = new PasswordResetToken();
            token.setUser(user);
            token.setOtpHash(otpHash);
            token.setExpiryTime(expiryTime);
            token.setUsed(false);
            passwordResetTokenRepo.save(token);

            String messageBody = "Librario Password Reset Code";
            String subject = "<html><body>"
                    + "<p>Your one-time password reset code is:</p>"
                    + "<h2 style=\"color:blue; font-size:24px;\">" + otp + "</h2>"
                    + "<p>This code is valid for 15 minutes.</p>"
                    + "</body></html>";
            emailService.sendSimpleMail(new EmailDetails(email, messageBody, subject, true));
        }
    }

    public Optional<User> validateResetTokenAndGetUserId(String email, String token) {
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepo.findByUser_EmailAndOtpHashAndExpiryTimeAfterAndUsedFalse(email, token, new Date());
        if (tokenOptional.isPresent()) {
            return Optional.of(tokenOptional.get().getUser());
        }
        return Optional.empty();
    }

    public boolean resetPassword(String email, String otp, String newPassword) {
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepo.findByUser_EmailAndUsedFalseAndExpiryTimeAfter(email, new Date());

        if (tokenOptional.isPresent()) {
            PasswordResetToken token = tokenOptional.get();
            if (passwordEncoder.matches(otp, token.getOtpHash())) {
                token.setUsed(true);
                passwordResetTokenRepo.save(token);

                User user = token.getUser();
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepo.save(user);

                return true;
            }
        }
        return false;
    }
}*/
