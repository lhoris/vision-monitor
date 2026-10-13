package com.vision.repository;

import java.util.List;
import java.util.Map;

public interface ModelProcessQueryRepository {
    List<Map<String, Object>> findProcessAreas();
    List<Map<String, Object>> findProcesses(List<String> areas);
    List<Map<String, Object>> findEventLogs(Long id);
    Map<String, Object> findProcess(Long id);
    Map<String, Object> findLatestProcess(String area, String name);
    List<Map<String, Object>> findAgents();
    Map<String, Object> findAgent(String agentId);
}
