package com.marcella.backend.contact;

import com.marcella.backend.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {
    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<String> sendContactMessage(
            @RequestBody ContactRequest request
    ){
        String subject="Contact Form Submission from " + request.getName();

        String body="Sender: " + request.getName() + "\n" +
                "Email: " + request.getEmail() + "\n\n" +
                "Subject: " + request.getSubject() + "\n" +
                "Page Issue Occurred On: " + request.getPage() + "\n\n" +
                "Message: " + request.getMessage();

        emailService.sendEmail("marcellapearl0627@gmail.com", subject, body);
        return ResponseEntity.ok("Message sent successfully!");
    }

    @PutMapping("/blog-confirmation")
    public ResponseEntity<String> sendBlogConfirmationEmail(
            @RequestBody BlogSubmissionRequest request
    ){
        String subject = "AutoWeave Blog Submission Confirmation";

        String body = "Hi " + request.getName() + ",\n\n" +
                "Thanks for sending your blog to AutoWeave. This mail confirms that this is your submission.\n\n" +
                "Submitted details:\n" +
                "Name: " + request.getName() + "\n" +
                "Email: " + request.getEmail() + "\n" +
                "Title: " + request.getTitle() + "\n\n" +
                "Content:\n" + request.getContent() + "\n\n" +
                "Our team will review it and get back to you soon.\n\n" +
                "- AutoWeave Team";

        emailService.sendEmail(request.getEmail(), subject, body);
        return ResponseEntity.ok("Blog confirmation email sent successfully!");
    }
}

