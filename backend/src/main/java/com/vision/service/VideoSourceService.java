package com.vision.service;

import com.vision.dto.VideoSourceDto;
import com.vision.entity.VideoSource;
import com.vision.exception.ApiException;
import com.vision.repository.VideoSourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class VideoSourceService {
    private static final List<String> PROTOCOLS = List.of("WEBRTC", "RTSP", "HLS");
    private final VideoSourceRepository repository;

    @Transactional(readOnly = true)
    public List<VideoSourceDto> list(String status) {
        return repository.findAll().stream()
                .filter(source -> status == null || status.isBlank() || source.getStatus().equalsIgnoreCase(status))
                .map(VideoSourceDto::from).toList();
    }

    @Transactional
    public VideoSourceDto create(VideoSourceDto request) {
        validate(request);
        String url = request.getUrl().trim();
        if (repository.existsByUrlIgnoreCase(url)) throw new ApiException("DUPLICATE_VIDEO_URL", "이미 등록된 영상 주소입니다.");
        VideoSource source = request.toEntity();
        source.setId(null);
        source.setName(request.getName().trim());
        source.setUrl(url);
        source.setProtocol(normalizeProtocol(request.getProtocol()));
        source.setStatus(normalizeStatus(request.getStatus()));
        source.setLocation(trimOrNull(request.getLocation()));
        source.setZone(trimOrNull(request.getZone()));
        source.setRemarks(trimOrNull(request.getRemarks()));
        return VideoSourceDto.from(repository.save(source));
    }

    @Transactional
    public VideoSourceDto update(Long id, VideoSourceDto request) {
        validate(request);
        VideoSource source = repository.findById(id).orElseThrow(() -> new ApiException("VIDEO_SOURCE_NOT_FOUND", "영상 주소를 찾을 수 없습니다."));
        String url = request.getUrl().trim();
        repository.findByUrlIgnoreCase(url).filter(found -> !found.getId().equals(id))
                .ifPresent(found -> { throw new ApiException("DUPLICATE_VIDEO_URL", "이미 등록된 영상 주소입니다."); });
        source.setName(request.getName().trim());
        source.setUrl(url);
        source.setProtocol(normalizeProtocol(request.getProtocol()));
        source.setLocation(trimOrNull(request.getLocation()));
        source.setZone(trimOrNull(request.getZone()));
        source.setStatus(normalizeStatus(request.getStatus()));
        source.setRemarks(trimOrNull(request.getRemarks()));
        return VideoSourceDto.from(repository.save(source));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) throw new ApiException("VIDEO_SOURCE_NOT_FOUND", "영상 주소를 찾을 수 없습니다.");
        repository.deleteById(id);
    }

    private void validate(VideoSourceDto request) {
        if (request == null || request.getName() == null || request.getName().isBlank()) throw new ApiException("VALIDATION_ERROR", "영상 이름은 필수입니다.");
        if (request.getUrl() == null || request.getUrl().isBlank()) throw new ApiException("VALIDATION_ERROR", "영상 주소는 필수입니다.");
        try { URI.create(request.getUrl().trim()); } catch (IllegalArgumentException error) { throw new ApiException("VALIDATION_ERROR", "올바른 영상 주소를 입력하세요."); }
        normalizeProtocol(request.getProtocol());
        normalizeStatus(request.getStatus());
    }

    private String normalizeProtocol(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (!PROTOCOLS.contains(normalized)) throw new ApiException("VALIDATION_ERROR", "지원하지 않는 영상 프로토콜입니다.");
        return normalized;
    }

    private String normalizeStatus(String value) {
        String normalized = value == null || value.isBlank() ? "ACTIVE" : value.trim().toUpperCase(Locale.ROOT);
        if (!List.of("ACTIVE", "INACTIVE").contains(normalized)) throw new ApiException("VALIDATION_ERROR", "지원하지 않는 영상 상태입니다.");
        return normalized;
    }

    private String trimOrNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
