package com.vision.service;

import com.vision.entity.VideoSource;
import com.vision.exception.ApiException;
import com.vision.repository.VideoSourceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CameraQueryServiceTest {
    @Mock
    private VideoSourceRepository repository;

    @Test
    void projectsActiveVideoSourcesAsOnlineCameras() {
        VideoSource source = VideoSource.builder()
                .id(10L).name("Line A").url("http://example.test/whep")
                .location("Line A").zone("Heating").protocol("WEBRTC")
                .status("ACTIVE").dataEndStatus("N").build();
        when(repository.findAll()).thenReturn(List.of(source));

        var result = new CameraQueryService(repository).list();

        assertThat(result).singleElement().satisfies(camera -> {
            assertThat(camera.getId()).isEqualTo(10L);
            assertThat(camera.getStreamUrl()).isEqualTo("http://example.test/whep");
            assertThat(camera.getStatus()).isEqualTo("online");
        });
    }

    @Test
    void excludesLogicallyEndedVideoSources() {
        VideoSource source = VideoSource.builder().id(10L).status("ACTIVE").dataEndStatus("Y").build();
        when(repository.findAll()).thenReturn(List.of(source));

        assertThat(new CameraQueryService(repository).list()).isEmpty();
    }

    @Test
    void rejectsMissingCamera() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> new CameraQueryService(repository).get(99L))
                .isInstanceOf(ApiException.class)
                .hasMessage("Camera was not found");
    }
}
