package com.vision.repository;

import com.vision.entity.ModelCommand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface ModelCommandRepository extends JpaRepository<ModelCommand, String> {
    long countByAgentIdAndModelProcessIdAndDataEndStatusAndCommandStatusIn(
            String agentId,
            String modelProcessId,
            String dataEndStatus,
            Collection<String> commandStatuses);
}
