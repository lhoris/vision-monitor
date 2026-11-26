package com.vision.integration;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.nio.charset.StandardCharsets;
import java.util.Properties;

import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * Manual SMTP connectivity test.
 *
 * This test is skipped unless -Dsmtp.test.enabled=true is supplied.
 */
class SmtpEmailDeliveryTest {
    private static final String SMTP_HOST = "1.209.183.51";
    private static final int SMTP_PORT = 25;
    private static final String DEFAULT_RECIPIENT = "pd0a5661@posco.com";

    @Test
    void sendsTestEmailThroughConfiguredSmtpServer() throws Exception {
        assumeTrue(Boolean.getBoolean("smtp.test.enabled"),
                "SMTP test skipped. Use -Dsmtp.test.enabled=true to send a real email.");

        String recipient = System.getProperty("smtp.to", DEFAULT_RECIPIENT);
        String from = System.getProperty("smtp.from", recipient);
        String username = System.getProperty("smtp.username", "");
        String password = System.getProperty("smtp.password", "");

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(System.getProperty("smtp.host", SMTP_HOST));
        sender.setPort(Integer.getInteger("smtp.port", SMTP_PORT));
        sender.setUsername(username);
        sender.setPassword(password);

        Properties properties = sender.getJavaMailProperties();
        properties.put("mail.transport.protocol", "smtp");
        properties.put("mail.smtp.auth", Boolean.toString(!username.isBlank()));
        properties.put("mail.smtp.starttls.enable", System.getProperty("smtp.starttls", "false"));
        properties.put("mail.smtp.connectiontimeout", System.getProperty("smtp.connection-timeout-ms", "10000"));
        properties.put("mail.smtp.timeout", System.getProperty("smtp.timeout-ms", "10000"));
        properties.put("mail.smtp.writetimeout", System.getProperty("smtp.write-timeout-ms", "10000"));

        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
        helper.setFrom(from);
        helper.setTo(recipient);
        helper.setSubject("Vision Monitor SMTP 테스트 메일");
        helper.setText("SMTP 서버 연결 테스트가 정상적으로 발송되었습니다.\n서버: "
                + sender.getHost() + ":" + sender.getPort(), false);

        sender.send(message);
    }
}
