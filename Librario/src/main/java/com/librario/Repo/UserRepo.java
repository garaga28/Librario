package com.librario.Repo;

import com.librario.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole_Id(Long roleId);

    List<User> findByRole_RoleName(String roleName);

}