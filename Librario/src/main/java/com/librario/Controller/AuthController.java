package com.librario.Controller;

import com.librario.Service.EmailService;
import com.librario.Service.UserService;
import com.librario.dto.LoginDto;
import com.librario.dto.RegisterDto;
import com.librario.Entity.Role;
import com.librario.Entity.User;
import com.librario.Repo.RoleRepo;
import com.librario.Repo.UserRepo;
import com.librario.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmailService emailService;

    // =============================
    // REGISTER (fixed response JSON)
    // =============================
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody RegisterDto registerDto) {

        Map<String, Object> res = new HashMap<>();

        if (userRepo.existsByEmail(registerDto.getEmail())) {
            res.put("success", false);
            res.put("message", "Email already taken");
            return new ResponseEntity<>(res, HttpStatus.BAD_REQUEST);
        }
        if (!registerDto.getPassword()
                .matches("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$")) {

            res.put("success", false);
            res.put("message", "Weak password! Must contain 8+ chars, 1 uppercase, 1 number, 1 special char.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }


        User user = new User();
        user.setName(registerDto.getName());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));

        Optional<Role> role = roleRepo.findById(registerDto.getRoleId());
        if (role.isEmpty()) {
            res.put("success", false);
            res.put("message", "Role not found");
            return new ResponseEntity<>(res, HttpStatus.NOT_FOUND);
        }

        user.setRole(role.get());
        userRepo.save(user);

        // Optional Email send
        try {
            emailService.sendSimpleMail(
                    new com.librario.dto.EmailDetails(
                            registerDto.getEmail(),
                            "Welcome to Librario",
                            "<p>Welcome to Librario!</p>",
                            true
                    )
            );
        } catch (Exception ignored) {}

        res.put("success", true);
        res.put("message", "User registered successfully");
        res.put("userId", user.getId());

        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }


    // =============================
    // LOGIN
    // =============================
    @PostMapping("/login/{role}")
    public ResponseEntity<?> login(@PathVariable String role, @RequestBody LoginDto loginDto) {

        try {
            User user = userService.findUserByEmail(loginDto.getEmail());
            if (user == null)
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);

            if (!user.getRole().getName().equalsIgnoreCase(role))
                return new ResponseEntity<>("Invalid role", HttpStatus.UNAUTHORIZED);

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
            );

            String token = jwtUtil.generateToken(loginDto.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("message", role + " login successful");
            response.put("token", token);
            response.put("userId", user.getId());
            response.put("role", user.getRole().getName());

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (BadCredentialsException e) {
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return new ResponseEntity<>("Logged out successfully", HttpStatus.OK);
    }

}
