package com.vision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import com.vision.entity.audit.BaseAudit;

@Entity
@Table(name = "TB_M26_VIDEO_SOURCE")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class VideoSource extends BaseAudit {
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
}
