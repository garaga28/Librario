package com.librario.Service;

import com.librario.Entity.Notification;
import com.librario.Entity.User;
import com.librario.Repo.NotificationRepository;
import com.librario.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepo;
    private final UserRepo userRepo;

    @Autowired
    public NotificationService(SimpMessagingTemplate messagingTemplate, NotificationRepository notificationRepo, UserRepo userRepo) {
        this.messagingTemplate = messagingTemplate;
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
    }

    public void createNotification(String message, String notificationType) {
        // Find all users with the role of Librarian.
        List<User> librarians = userRepo.findByRole_Id(2L);

        if (librarians.isEmpty()) {
            System.err.println("No librarians found to send notifications to.");
            return;
        }

        // Save a notification for each librarian.
        librarians.forEach(librarian -> {
            Notification notification = new Notification(message, notificationType, librarian);
            notificationRepo.save(notification);
        });

        // Send a single message to the generic topic for all librarians to consume in real-time.
        if (message != null && !message.isEmpty()) {
            messagingTemplate.convertAndSend("/topic/notifications", message);
        }
    }

    public void createNotificationForUser(User user, String message, String notificationType) {
        Notification notification = new Notification(message, notificationType, user);
        notificationRepo.save(notification);
        messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/notifications", message);
    }
}