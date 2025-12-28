package com.librario.Service;

import com.librario.dto.EmailDetails;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;

    public String sendSimpleMail(EmailDetails details) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(sender);
            helper.setTo(details.getRecipient());
            helper.setSubject(details.getSubject());
            helper.setText(details.getMessageBody(), details.isHtml());

            javaMailSender.send(mimeMessage);
            return "Mail Sent Successfully...";
        } catch (MessagingException e) {
            return "Error while Sending Mail";
        }
    }
}

