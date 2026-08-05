package com.vision.dto;

import com.vision.entity.Camera;
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

    public static CameraDto fromEntity(Camera camera) {
        return CameraDto.builder()
                .id(camera.getId())
                .name(camera.getName())
                .location(camera.getLocation())
                .zone(camera.getZone())
                .streamUrl(camera.getStreamUrl())
                .status(camera.getStatus())
                .resolution(camera.getResolution())
                .fps(camera.getFps())
                .recordingEnabled(camera.getRecordingEnabled())
                .lastSeen(camera.getLastSeen())
                .createdAt(camera.getCreatedAt())
                .updatedAt(camera.getUpdatedAt())
                .build();
    }

    public Camera toEntity() {
        return Camera.builder()
                .id(this.id)
                .name(this.name)
                .location(this.location)
                .zone(this.zone)
                .streamUrl(this.streamUrl)
                .status(this.status)
                .resolution(this.resolution)
                .fps(this.fps)
                .recordingEnabled(this.recordingEnabled)
                .lastSeen(this.lastSeen)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }

}
