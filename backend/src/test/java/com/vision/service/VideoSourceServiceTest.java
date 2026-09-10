package com.vision.service;

import com.vision.dto.VideoSourceDto;
import com.vision.entity.VideoSource;
import com.vision.exception.ApiException;
import com.vision.repository.VideoSourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VideoSourceServiceTest {
    @Mock
    private VideoSourceRepository repository;

    private VideoSourceService service;

    @BeforeEach
    void setUp() {
        service = new VideoSourceService(repository);
    }

    @Test
    void createsVideoSourceWithNormalizedValues() {
        when(repository.existsByUrlIgnoreCase("rtsp://example.test/live")).thenReturn(false);
        when(repository.save(any(VideoSource.class))).thenAnswer(invocation -> {
            VideoSource source = invocation.getArgument(0);
            source.setId(1L);
            return source;
        });

        VideoSourceDto result = service.create(VideoSourceDto.builder()
                .name(" Line A ")
                .url(" rtsp://example.test/live ")
                .protocol("rtsp")
                .status("active")
                .build());

        assertEquals(1L, result.getId());
        assertEquals("Line A", result.getName());
        assertEquals("RTSP", result.getProtocol());
        assertEquals("ACTIVE", result.getStatus());
    }

    @Test
    void rejectsDuplicateUrlInApplicationService() {
        when(repository.existsByUrlIgnoreCase("https://example.test/live.m3u8")).thenReturn(true);

        ApiException error = assertThrows(ApiException.class, () -> service.create(VideoSourceDto.builder()
                .name("Line A")
                .url("https://example.test/live.m3u8")
                .protocol("HLS")
                .build()));

        assertEquals("DUPLICATE_VIDEO_URL", error.getCode());
    }

    @Test
    void rejectsUnsupportedProtocol() {
        ApiException error = assertThrows(ApiException.class, () -> service.create(VideoSourceDto.builder()
                .name("Line A")
                .url("https://example.test/live")
                .protocol("HTTP")
                .build()));

        assertEquals("VALIDATION_ERROR", error.getCode());
    }
}
