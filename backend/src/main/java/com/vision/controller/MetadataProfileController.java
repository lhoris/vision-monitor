package com.vision.controller;

import com.vision.dto.MetadataProfileSaveRequest;
import com.vision.service.MetadataProfileService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/metadata/profiles")
@RequiredArgsConstructor
public class MetadataProfileController {
    private final MetadataProfileService service;

    @GetMapping("/{sourceId}")
    public ApiResponse<Map<String, Object>> get(@PathVariable Long sourceId) {
        return ApiResponse.success(service.get(sourceId));
    }

    @PutMapping("/{sourceId}")
    public ApiResponse<Map<String, Object>> save(@PathVariable Long sourceId,
                                                  @RequestBody MetadataProfileSaveRequest request) {
        return ApiResponse.success(service.save(sourceId, request));
    }
}
