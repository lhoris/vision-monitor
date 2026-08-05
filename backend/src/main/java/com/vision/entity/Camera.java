package com.vision.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Camera Entity
 */
@Entity
@Table(name = "cameras", indexes = {
    @Index(name = "idx_zone", columnList = "zone"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Camera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 255)
    private String location;

    @Column(nullable = false, length = 50)
    private String zone;

    @Column(nullable = false, length = 500)
    private String streamUrl;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "offline"; // online, offline, error

    @Column(length = 50)
    private String resolution;

    @Column
    private Integer fps;

    @Column(name = "recording_enabled")
    @Builder.Default
    private Boolean recordingEnabled = false;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

}
