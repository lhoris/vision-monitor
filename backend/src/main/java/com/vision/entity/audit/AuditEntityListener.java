package com.vision.entity.audit;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import java.sql.Timestamp;

/** Populates M26 audit columns for JPA entity lifecycle events. */
public class AuditEntityListener {

    @PrePersist
    public void beforePersist(BaseAudit entity) {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        String actor = AuditContext.currentActor();

        if (isBlank(entity.getCreatedObjectType())) entity.setCreatedObjectType("U");
        if (isBlank(entity.getCreatedObjectId())) entity.setCreatedObjectId(actor);
        if (isBlank(entity.getCreatedProgramId())) entity.setCreatedProgramId(programId(entity));
        if (entity.getCreatedTimestamp() == null) entity.setCreatedTimestamp(now);
        if (isBlank(entity.getDataEndStatus())) entity.setDataEndStatus("N");

        entity.setLastUpdatedObjectType("U");
        entity.setLastUpdatedObjectId(actor);
        entity.setLastUpdatedProgramId(programId(entity));
        entity.setLastUpdatedTimestamp(now);
    }

    @PreUpdate
    public void beforeUpdate(BaseAudit entity) {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        String actor = AuditContext.currentActor();

        if (isBlank(entity.getLastUpdatedObjectType())) entity.setLastUpdatedObjectType("U");
        entity.setLastUpdatedObjectId(actor);
        if (isBlank(entity.getLastUpdatedProgramId())) entity.setLastUpdatedProgramId(programId(entity));
        entity.setLastUpdatedTimestamp(now);

        if ("Y".equalsIgnoreCase(entity.getDataEndStatus()) && entity.getDataEndTimestamp() == null) {
            entity.setDataEndObjectType("U");
            entity.setDataEndObjectId(actor);
            entity.setDataEndProgramId(programId(entity));
            entity.setDataEndTimestamp(now);
        }
    }

    private String programId(BaseAudit entity) {
        return entity.getClass().getSimpleName().toUpperCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
