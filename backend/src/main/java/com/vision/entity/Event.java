package com.vision.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event Entity
 */
@Entity
@Table(name = "events", indexes = {
    @Index(name = "idx_camera_id", columnList = "camera_id"),
    @Index(name = "idx_severity", columnList = "severity"),
    @Index(name = "idx_timestamp", columnList = "event_time")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "camera_id", nullable = false)
    private Long cameraId;

    @Column(nullable = false, length = 100)
    private String type;

    @Column(nullable = false, length = 20)
    private String severity; // low, medium, high, critical

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;

    @Column(nullable = false)
    @Builder.Default
    private Boolean acknowledged = false;

    @Column(columnDefinition = "JSON")
    private String metadata; // JSON format for additional data

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

}
