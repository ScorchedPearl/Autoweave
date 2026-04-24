package com.marcella.backend.services;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.marcella.backend.configurations.GmailConfig;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Properties;

@Service
@Slf4j
public class GmailService {

    public boolean sendEmail(String accessToken, String to, String subject, String body,
                             String cc, String bcc) {
        try {
            Gmail service = GmailConfig.getGmailService(accessToken);

            MimeMessage email = createEmail(to, cc, bcc, subject, body);
            Message message = createMessageWithEmail(email);

            Message sent = service.users().messages().send("me", message).execute();

            log.info("Gmail sent successfully: {}", sent.getId());
            return true;

        } catch (Exception e) {
            log.error("Failed to send Gmail", e);
            return false;
        }
    }

    private MimeMessage createEmail(String to, String cc, String bcc,
                                    String subject, String bodyText) throws Exception {

        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);

        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress("me"));
        email.addRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(to));

        if (cc != null && !cc.isBlank()) {
            for (String c : cc.split(",")) {
                email.addRecipient(jakarta.mail.Message.RecipientType.CC, new InternetAddress(c.trim()));
            }
        }

        if (bcc != null && !bcc.isBlank()) {
            for (String b : bcc.split(",")) {
                email.addRecipient(jakarta.mail.Message.RecipientType.BCC, new InternetAddress(b.trim()));
            }
        }

        email.setSubject(subject);
        email.setText(bodyText);

        return email;
    }

    private Message createMessageWithEmail(MimeMessage emailContent) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        emailContent.writeTo(buffer);
        String encodedEmail = Base64.getUrlEncoder().encodeToString(buffer.toByteArray());
        Message message = new Message();
        message.setRaw(encodedEmail);
        return message;
    }
}
