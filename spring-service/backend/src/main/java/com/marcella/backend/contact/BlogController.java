package com.marcella.backend.contact;

import com.marcella.backend.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/blog")
@RequiredArgsConstructor
public class BlogController {
    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<String> submitBlog(@RequestBody BlogSubmissionRequest request) {
        String adminSubject = "New Blog Submission from " + request.getName();
        String adminBody = "New blog submission received:\n\n" +
                "Name: " + request.getName() + "\n" +
                "Email: " + request.getEmail() + "\n" +
                "Title: " + request.getTitle() + "\n\n" +
                "Content:\n" + request.getContent();
        emailService.sendEmail("marcellapearl0627@gmail.com", adminSubject, adminBody);

        String userSubject = "AutoWeave Blog Submission Received";
        String userBody = "Hi " + request.getName() + ",\n\n" +
                "Thank you for submitting your blog to AutoWeave! Here is a copy of your submission:\n\n" +
                "Title: " + request.getTitle() + "\n\n" +
                "Content:\n" + request.getContent() + "\n\n" +
                "Our team will review your submission and get back to you shortly.\n\n" +
                "- AutoWeave Team";
        emailService.sendEmail(request.getEmail(), userSubject, userBody);

        return ResponseEntity.ok("Blog submitted successfully!");
    }
}
