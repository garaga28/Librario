package com.librario.Controller;

import com.librario.Service.PasswordService;
import com.librario.dto.ForgotPasswordRequest;
import com.librario.dto.ResetPasswordRequest;
import com.librario.dto.VerifyOtpRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordService passwordService;

    @Autowired
    public PasswordResetController(PasswordService passwordService) {
        this.passwordService = passwordService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> requestPasswordReset(@RequestBody ForgotPasswordRequest request) {
        try {
            passwordService.sendOtp(request.getEmail());
            return ResponseEntity.ok("OTP sent successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequest request) {
        boolean isVerified = passwordService.verifyOtp(request.getEmail(), request.getOtp());
        if (isVerified) {
            return ResponseEntity.ok("OTP verified successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired OTP.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        boolean isReset = passwordService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        if (isReset) {
            return ResponseEntity.ok("Password reset successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to reset password. Invalid OTP or user not found.");
        }
    }
}
