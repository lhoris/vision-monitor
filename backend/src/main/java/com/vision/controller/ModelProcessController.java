package com.vision.controller;

import com.vision.dto.ModelProcessCreateRequest;
import com.vision.dto.ModelProcessSettingsRequest;
import com.vision.service.ModelProcessService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/model-processes")
@RequiredArgsConstructor
public class ModelProcessController {
    private final ModelProcessService service;

    @GetMapping
    public ApiResponse<Map<String, Object>> list(@RequestParam(required = false) String processAreas) { return ApiResponse.success(service.list(processAreas)); }
    @PostMapping
    public ApiResponse<Map<String, Object>> create(@RequestBody ModelProcessCreateRequest request) { return ApiResponse.success(service.create(request)); }
    @PutMapping("/{id}/settings")
    public ApiResponse<Map<String, Object>> updateSettings(@PathVariable Long id, @RequestBody ModelProcessSettingsRequest request) { return ApiResponse.success(service.updateSettings(id, request)); }
    @PostMapping("/{id}/actions/{action}")
    public ApiResponse<Map<String, Object>> control(@PathVariable Long id, @PathVariable String action) { return ApiResponse.success(service.control(id, action)); }
    @GetMapping("/{id}/event-logs")
    public ApiResponse<List<Map<String, Object>>> logs(@PathVariable Long id) { return ApiResponse.success(service.logs(id)); }
}
