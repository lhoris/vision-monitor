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
    private String protocol;
    private String location;
    private String zone;
    private String status;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VideoSource toEntity() {
        return VideoSource.builder()
                .id(id).name(name).url(url).protocol(protocol)
                .location(location).zone(zone).status(status).remarks(remarks)
                .createdAt(createdAt).updatedAt(updatedAt).build();
    }

    public static VideoSourceDto from(VideoSource source) {
        return VideoSourceDto.builder()
                .id(source.getId()).name(source.getName()).url(source.getUrl())
                .protocol(source.getProtocol()).location(source.getLocation())
                .zone(source.getZone()).status(source.getStatus()).remarks(source.getRemarks())
                .createdAt(source.getCreatedAt()).updatedAt(source.getUpdatedAt()).build();
    }
}
