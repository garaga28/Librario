package com.librario;

import com.librario.Entity.Role;
import com.librario.Entity.User;
import com.librario.Repo.RoleRepo;
import com.librario.Repo.UserRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
public class AdminInitializer implements CommandLineRunner {
    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepo roleRepository;

    public AdminInitializer(UserRepo userRepository, PasswordEncoder passwordEncoder, RoleRepo roleRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        Role adminRole = roleRepository.findByRoleName("ADMIN")
                .orElseGet(() -> roleRepository.save(createRole("ADMIN")));

        Role librarianRole = roleRepository.findByRoleName("LIBRARIAN")
                .orElseGet(() -> roleRepository.save(createRole("LIBRARIAN")));

        Role memberRole = roleRepository.findByRoleName("MEMBER")
                .orElseGet(() -> roleRepository.save(createRole("MEMBER")));

        if (userRepository.findByEmail("admin@librario.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@librario.com");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole(adminRole);
            admin.setName("Admin");
            userRepository.save(admin);
            System.out.println("Admin user created successfully!");
        }

        System.out.println("Roles initialized. ADMIN ID: " + adminRole.getId() + ", LIBRARIAN ID: " + librarianRole.getId() + ", MEMBER ID: " + memberRole.getId());
    }

    private Role createRole(String roleName) {
        Role role = new Role();
        role.setRoleName(roleName);
        return role;
    }
}
