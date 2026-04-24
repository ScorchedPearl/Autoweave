package com.marcella.backend.contact;

import com.marcella.backend.services.GmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final GmailService gmailService;

    @PostMapping
    public ResponseEntity<String> sendContactMessage(
            @RequestHeader("X-Google-Token") String googleToken,
            @RequestBody ContactRequest request
    ) {
        String accessToken = googleToken;
        String subject = "Contact Form Submission from " + request.getName();
        String body =
                "Sender: " + request.getName() + "\n" +
                        "Email: " + request.getEmail() + "\n\n" +
                        "Subject: " + request.getSubject() + "\n" +
                        "Page Issue Occurred On: " + request.getPage() + "\n\n" +
                        "Message: " + request.getMessage();

        boolean sent = gmailService.sendEmail(
                accessToken,
                "marcellapearl0627@gmail.com",
                subject,
                body,
                "",
                ""
        );
        if (!sent) {
            return ResponseEntity.status(500).body("Failed to send email");
        }
        return ResponseEntity.ok("Message sent successfully!");
    }

    @PutMapping("/blog-confirmation")
    public ResponseEntity<String> sendBlogConfirmationEmail(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody BlogSubmissionRequest request
    ) {

        String accessToken = authHeader.replace("Bearer ", "");
        String subject = "AutoWeave Blog Submission Confirmation";
        String body =
                "Hi " + request.getName() + ",\n\n" +
                        "Thanks for sending your blog to AutoWeave. This mail confirms that this is your submission.\n\n" +
                        "Submitted details:\n" +
                        "Name: " + request.getName() + "\n" +
                        "Email: " + request.getEmail() + "\n" +
                        "Title: " + request.getTitle() + "\n\n" +
                        "Content:\n" + request.getContent() + "\n\n" +
                        "Our team will review it and get back to you soon.\n\n" +
                        "- AutoWeave Team";

        boolean sent = gmailService.sendEmail(
                accessToken,
                request.getEmail(),
                subject,
                body,
                "",
                ""
        );

        if (!sent) {
            return ResponseEntity.status(500).body("Failed to send email");
        }
        return ResponseEntity.ok("Blog confirmation email sent successfully!");
    }
}