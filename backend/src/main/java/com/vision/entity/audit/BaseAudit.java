package com.vision.entity.audit;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.sql.Timestamp;
import java.time.LocalDateTime;

/** Common audit columns shared by all M26 entities. */
@MappedSuperclass
@EntityListeners(AuditEntityListener.class)
@SuperBuilder
@NoArgsConstructor
public abstract class BaseAudit {

    @Column(name = "CREATED_OBJECT_TYPE", length = 1)
    private String createdObjectType;

    @Column(name = "CREATED_OBJECT_ID", length = 22)
    private String createdObjectId;

    @Column(name = "CREATED_PROGRAM_ID", length = 22)
    private String createdProgramId;

    @Column(name = "CREATED_TIMESTAMP")
    private Timestamp createdTimestamp;

    @Column(name = "LAST_UPDATED_OBJECT_TYPE", length = 1)
    private String lastUpdatedObjectType;

    @Column(name = "LAST_UPDATED_OBJECT_ID", length = 22)
    private String lastUpdatedObjectId;

    @Column(name = "LAST_UPDATED_PROGRAM_ID", length = 22)
    private String lastUpdatedProgramId;

    @Column(name = "LAST_UPDATED_TIMESTAMP")
    private Timestamp lastUpdatedTimestamp;

    @Column(name = "DATA_END_STATUS", length = 1)
    @Builder.Default
    private String dataEndStatus = "N";

    @Column(name = "DATA_END_OBJECT_TYPE", length = 1)
    private String dataEndObjectType;

    @Column(name = "DATA_END_OBJECT_ID", length = 22)
    private String dataEndObjectId;

    @Column(name = "DATA_END_PROGRAM_ID", length = 22)
    private String dataEndProgramId;

    @Column(name = "DATA_END_TIMESTAMP")
    private Timestamp dataEndTimestamp;

    public String getCreatedObjectType() { return createdObjectType; }
    public void setCreatedObjectType(String value) { this.createdObjectType = value; }
    public String getCreatedObjectId() { return createdObjectId; }
    public void setCreatedObjectId(String value) { this.createdObjectId = value; }
    public String getCreatedProgramId() { return createdProgramId; }
    public void setCreatedProgramId(String value) { this.createdProgramId = value; }
    public Timestamp getCreatedTimestamp() { return createdTimestamp; }
    public void setCreatedTimestamp(Timestamp value) { this.createdTimestamp = value; }
    public void setCreatedTimestamp(LocalDateTime value) { this.createdTimestamp = toTimestamp(value); }

    public String getLastUpdatedObjectType() { return lastUpdatedObjectType; }
    public void setLastUpdatedObjectType(String value) { this.lastUpdatedObjectType = value; }
    public String getLastUpdatedObjectId() { return lastUpdatedObjectId; }
    public void setLastUpdatedObjectId(String value) { this.lastUpdatedObjectId = value; }
    public String getLastUpdatedProgramId() { return lastUpdatedProgramId; }
    public void setLastUpdatedProgramId(String value) { this.lastUpdatedProgramId = value; }
    public Timestamp getLastUpdatedTimestamp() { return lastUpdatedTimestamp; }
    public void setLastUpdatedTimestamp(Timestamp value) { this.lastUpdatedTimestamp = value; }
    public void setLastUpdatedTimestamp(LocalDateTime value) { this.lastUpdatedTimestamp = toTimestamp(value); }

    public String getDataEndStatus() { return dataEndStatus; }
    public void setDataEndStatus(String value) { this.dataEndStatus = value; }
    public String getDataEndObjectType() { return dataEndObjectType; }
    public void setDataEndObjectType(String value) { this.dataEndObjectType = value; }
    public String getDataEndObjectId() { return dataEndObjectId; }
    public void setDataEndObjectId(String value) { this.dataEndObjectId = value; }
    public String getDataEndProgramId() { return dataEndProgramId; }
    public void setDataEndProgramId(String value) { this.dataEndProgramId = value; }
    public Timestamp getDataEndTimestamp() { return dataEndTimestamp; }
    public void setDataEndTimestamp(Timestamp value) { this.dataEndTimestamp = value; }
    public void setDataEndTimestamp(LocalDateTime value) { this.dataEndTimestamp = toTimestamp(value); }

    // Compatibility aliases for existing DTO/service contracts.
    public String getCreatedBy() { return createdObjectId; }
    public void setCreatedBy(String value) { this.createdObjectId = value; }
    public String getUpdatedBy() { return lastUpdatedObjectId; }
    public void setUpdatedBy(String value) { this.lastUpdatedObjectId = value; }
    public String getUpdatedObjectId() { return lastUpdatedObjectId; }
    public void setUpdatedObjectId(String value) { this.lastUpdatedObjectId = value; }
    public LocalDateTime getCreatedAt() { return toLocalDateTime(createdTimestamp); }
    public void setCreatedAt(LocalDateTime value) { this.createdTimestamp = toTimestamp(value); }
    public LocalDateTime getUpdatedAt() { return toLocalDateTime(lastUpdatedTimestamp); }
    public void setUpdatedAt(LocalDateTime value) { this.lastUpdatedTimestamp = toTimestamp(value); }
    public void setUpdatedTimestamp(LocalDateTime value) { this.lastUpdatedTimestamp = toTimestamp(value); }

    private static Timestamp toTimestamp(LocalDateTime value) {
        return value == null ? null : Timestamp.valueOf(value);
    }

    private static LocalDateTime toLocalDateTime(Timestamp value) {
        return value == null ? null : value.toLocalDateTime();
    }
}
