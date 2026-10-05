package com.vision.service;

import com.vision.dto.CameraDto;
import com.vision.entity.VideoSource;
import com.vision.exception.ApiException;
import com.vision.repository.VideoSourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Read-only camera projection backed by the managed video-source catalog. */
@Service
@RequiredArgsConstructor
public class CameraQueryService {
    private final VideoSourceRepository videoSourceRepository;

    @Transactional(readOnly = true)
    public List<CameraDto> list() {
        return videoSourceRepository.findAll().stream()
                .filter(source -> !"Y".equalsIgnoreCase(source.getDataEndStatus()))
                .map(this::toCamera)
                .toList();
    }

    @Transactional(readOnly = true)
    public CameraDto get(Long id) {
        VideoSource source = videoSourceRepository.findById(id)
                .filter(item -> !"Y".equalsIgnoreCase(item.getDataEndStatus()))
                .orElseThrow(() -> new ApiException("CAMERA_NOT_FOUND", "Camera was not found"));
        return toCamera(source);
    }

    private CameraDto toCamera(VideoSource source) {
        return CameraDto.builder()
                .id(source.getId())
                .name(source.getName())
                .location(source.getLocation())
                .zone(source.getZone())
                .streamUrl(source.getUrl())
                .status("ACTIVE".equalsIgnoreCase(source.getStatus()) ? "online" : "offline")
                .recordingEnabled(false)
                .createdAt(source.getCreatedAt())
                .updatedAt(source.getUpdatedAt())
                .build();
    }
}
