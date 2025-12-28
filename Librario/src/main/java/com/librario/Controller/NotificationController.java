package com.librario.Controller;

import com.librario.Entity.Notification;
import com.librario.Repo.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/librarian")
    public ResponseEntity<List<Notification>> getLibrarianNotifications(@RequestParam Long librarianId) {
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(librarianId);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllNotificationsAsRead(@RequestParam Long librarianId) {
        notificationRepository.markAllAsReadByRecipientId(librarianId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/member")
    public ResponseEntity<List<Notification>> getMemberNotifications(@RequestParam Long userId) {
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/mark-all-read/member")
    public ResponseEntity<Void> markAllMemberNotificationsAsRead(@RequestParam Long userId) {
        notificationRepository.markAllAsReadByRecipientId(userId);
        return ResponseEntity.ok().build();
    }
}