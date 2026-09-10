package com.vision.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Camera DTO
 * Phase 3에서 구현
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CameraDto {

    private Long id;
    private String name;
    private String location;
    private String zone;
    private String streamUrl;
    private String status;
    private String resolution;
    private Integer fps;
    private Boolean recordingEnabled;
    private LocalDateTime lastSeen;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
