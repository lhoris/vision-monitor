package com.vision.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Stream Entity
 */
@Entity
@Table(name = "streams", indexes = {
    @Index(name = "idx_camera_id", columnList = "camera_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stream {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "camera_id", nullable = false)
    private Long cameraId;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false, length = 20)
    private String type; // rtsp, http, ws

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "inactive"; // active, inactive, error

    @Column
    private Long bandwidth;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

}
