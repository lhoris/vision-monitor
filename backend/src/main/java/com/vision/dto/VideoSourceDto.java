package com.vision.dto;

import com.vision.entity.VideoSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoSourceDto {
    private Long id;
    private String name;
    private String url;
    private String playbackBaseUrl;
    private String playbackProtocol;
    private String protocol;
    private String status;
    private String remarks;
    private Long modelProcessId;
    private String classCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VideoSource toEntity() {
        return VideoSource.builder()
                .id(id).name(name).url(url).playbackBaseUrl(playbackBaseUrl).playbackProtocol(playbackProtocol).protocol(protocol)
                .status(status).remarks(remarks)
                .modelProcessId(modelProcessId)
                .classCode(classCode)
                .build();
    }

    public static VideoSourceDto from(VideoSource source) {
        return VideoSourceDto.builder()
                .id(source.getId()).name(source.getName()).url(source.getUrl()).playbackBaseUrl(source.getPlaybackBaseUrl()).playbackProtocol(source.getPlaybackProtocol())
                .protocol(source.getProtocol()).status(source.getStatus()).remarks(source.getRemarks())
                .modelProcessId(source.getModelProcessId())
                .classCode(source.getClassCode())
                .createdAt(source.getCreatedAt()).updatedAt(source.getUpdatedAt()).build();
    }
}
