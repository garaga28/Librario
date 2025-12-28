package com.librario.Controller;

import com.librario.Entity.User;
import com.librario.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;


    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestParam Long userId) {
        Optional<User> userOptional = userService.findUserById(userId);

        if (userOptional.isEmpty()) {
            return new ResponseEntity<>("User not found.", HttpStatus.NOT_FOUND);
        }

        User user = userOptional.get();
        Map<String, String> userProfile = new HashMap<>();
        userProfile.put("name", user.getName());
        userProfile.put("email", user.getEmail());

        return ResponseEntity.ok(userProfile);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUserProfile(@RequestParam Long userId, @RequestBody User updatedUser) {
        try {
            User user = userService.updateUser(userId, updatedUser.getName(), updatedUser.getPassword());
            if (user == null) {
                return new ResponseEntity<>("User not found or update failed.", HttpStatus.NOT_FOUND);
            }
            Map<String, String> userProfile = new HashMap<>();
            userProfile.put("name", user.getName());
            userProfile.put("email", user.getEmail());
            return ResponseEntity.ok(userProfile);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/members")
    public ResponseEntity<List<User>> getAllMembers() {
        List<User> members = userService.getMembers();
        return ResponseEntity.ok(members);
    }

    @GetMapping("/librarian")
    public ResponseEntity<?> getLibrarian() {
        Optional<User> librarianOptional = userService.getLibrarian();
        if (librarianOptional.isEmpty()) {
            return new ResponseEntity<>("Librarian not found.", HttpStatus.NOT_FOUND);
        }
        User librarian = librarianOptional.get();
        Map<String, Long> response = new HashMap<>();
        response.put("librarianId", librarian.getId());
        return ResponseEntity.ok(response);
    }

    // Inside com.librario.Controller.UserController
// ...

    @GetMapping("/librarians")

    public ResponseEntity<List<User>> getAllLibrarians() {
        List<User> librarians = userService.getLibrarians();
        return ResponseEntity.ok(librarians);
    }

    @DeleteMapping("/librarians/{id}")

    public ResponseEntity<String> deleteLibrarian(@PathVariable Long id) {
        try {
            userService.deleteLibrarian(id);
            return ResponseEntity.ok("Librarian deleted successfully.");
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete librarian.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
