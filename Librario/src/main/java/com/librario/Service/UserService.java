package com.librario.Service;

import com.librario.Entity.Member;
import com.librario.Entity.User;
import com.librario.Repo.MemberRepo;
import com.librario.Repo.UserRepo;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.BadCredentialsException;
import com.librario.Repo.NotificationRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final MemberRepo memberRepo;
    private final PasswordEncoder passwordEncoder;
    private final NotificationRepository notificationRepository;
    private final Long MEMBER_ROLE_ID = 3L;
    private final Long LIBRARIAN_ROLE_ID = 2L;

    public UserService(UserRepo userRepo, MemberRepo memberRepo, PasswordEncoder passwordEncoder, NotificationRepository notificationRepository) {
        this.userRepo = userRepo;
        this.memberRepo = memberRepo;
        this.passwordEncoder = passwordEncoder;
        this.notificationRepository = notificationRepository;
    }

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save the user first to ensure it gets an ID
        User savedUser = userRepo.save(user);

        // Create a new member and associate it with the new user
        Member newMember = new Member();
        newMember.setUser(savedUser);

        return savedUser;
    }

    public User findUserByEmail(String email) {
        return userRepo.findByEmail(email).orElse(null);
    }

    public Optional<User> findUserById(Long userId) {
        return userRepo.findById(userId);
    }

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public User updateUser(Long userId, String newName, String newPassword) {
        Optional<User> userOptional = userRepo.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (newName != null && !newName.isBlank()) {
                user.setName(newName);
            }
            if (newPassword != null && !newPassword.isBlank()) {
                user.setPassword(passwordEncoder.encode(newPassword));
            }
            return userRepo.save(user);
        }
        return null;
    }

    public List<User> getMembers() {
        return userRepo.findByRole_Id(MEMBER_ROLE_ID);
    }

    public Optional<User> getLibrarian() {
        List<User> librarians = userRepo.findByRole_Id(LIBRARIAN_ROLE_ID);
        return librarians.stream().findFirst();
    }

    private String getMemberStatus(Member member) {
        if (member.getStartDate() == null || member.getEndDate() == null) {
            return "INACTIVE";
        }
        Instant now = Instant.now();
        Instant inclusiveEndDate = member.getEndDate().plus(Duration.ofDays(1));

        return "ACTIVE";
    }

    public List<User> getLibrarians() {
        return userRepo.findByRole_Id(LIBRARIAN_ROLE_ID);
    }

    @Transactional
    public void deleteLibrarian(Long id) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Librarian not found with ID: " + id));

        // Optional: Add a check to prevent deleting an admin if the role ID is for an admin
        if (user.getRole().getId().equals(LIBRARIAN_ROLE_ID)) {
            notificationRepository.deleteAllByRecipientId(id);
            userRepo.deleteById(id);
        } else {
            throw new RuntimeException("User is not a librarian and cannot be deleted from this endpoint.");
        }
    }
}
