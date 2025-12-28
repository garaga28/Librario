package com.librario.Repo;

import com.librario.Entity.Notification;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :recipientId ORDER BY n.createdAt DESC")
    @QueryHints({
            @QueryHint(name = "org.hibernate.cacheable", value = "false")
    })
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(@Param("recipientId") Long recipientId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :recipientId")
    void markAllAsReadByRecipientId(Long recipientId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :userId")
    void deleteAllByRecipientId(@Param("userId") Long userId);
}