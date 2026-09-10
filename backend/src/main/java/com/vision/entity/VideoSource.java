package com.vision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_M26_VIDEO_SOURCE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoSource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VIDEO_SOURCE_ID")
    private Long id;

    @Column(name = "VIDEO_NAME", length = 100)
    private String name;

    @Column(name = "VIDEO_URL", length = 2000)
    private String url;

    @Column(name = "VIDEO_PROTOCOL", length = 10)
    private String protocol;

    @Column(name = "LOCATION", length = 200)
    private String location;

    @Column(name = "ZONE_NAME", length = 100)
    private String zone;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "REMARKS", length = 4000)
    private String remarks;

    @Column(name = "CREATED_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "LAST_UPDATED_TIMESTAMP")
    private LocalDateTime updatedAt;
}
