package com.vision.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Alert Setting Entity
 */
@Entity
@Table(name = "alert_settings", indexes = {
    @Index(name = "idx_camera_id", columnList = "camera_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "camera_id", nullable = false)
    private Long cameraId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "notification_method", nullable = false, length = 20)
    private String notificationMethod; // email, sms, in-app

    @Column
    private Long threshold;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

}
