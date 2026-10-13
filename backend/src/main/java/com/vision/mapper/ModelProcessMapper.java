package com.vision.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ModelProcessMapper {
    List<Map<String, Object>> findProcessAreas();
    List<Map<String, Object>> findProcesses(@Param("areas") List<String> areas);
    List<Map<String, Object>> findEventLogs(@Param("id") Long id);
    Map<String, Object> findProcess(@Param("id") Long id);
    Map<String, Object> findLatestProcess(@Param("area") String area, @Param("name") String name);
}
