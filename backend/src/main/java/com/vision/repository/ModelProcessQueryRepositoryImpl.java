package com.vision.repository;

import com.vision.mapper.ModelProcessMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class ModelProcessQueryRepositoryImpl implements ModelProcessQueryRepository {
    private final ModelProcessMapper mapper;

    @Override public List<Map<String, Object>> findProcessAreas() { return mapper.findProcessAreas(); }
    @Override public List<Map<String, Object>> findProcesses(List<String> areas) { return mapper.findProcesses(areas); }
    @Override public List<Map<String, Object>> findEventLogs(Long id) { return mapper.findEventLogs(id); }
    @Override public Map<String, Object> findProcess(Long id) { return mapper.findProcess(id); }
    @Override public Map<String, Object> findLatestProcess(String area, String name) { return mapper.findLatestProcess(area, name); }
    @Override public List<Map<String, Object>> findAgents() { return mapper.findAgents(); }
    @Override public Map<String, Object> findAgent(String agentId) { return mapper.findAgent(agentId); }
}
