package com.vision.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Recording Entity
 */
@Entity
@Table(name = "TB_M26_RECORDINGS", indexes = {
    @Index(name = "idx_tb_m26_recording_camera_id", columnList = "camera_id"),
    @Index(name = "idx_tb_m26_recording_start_time", columnList = "start_time"),
    @Index(name = "idx_tb_m26_recording_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recording {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "camera_id", nullable = false)
    private Long cameraId;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column
    private Long duration; // in seconds

    @Column(name = "file_size")
    private Long fileSize; // in bytes

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "recording"; // recording, completed, archived

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

}
