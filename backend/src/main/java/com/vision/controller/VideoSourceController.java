package com.vision.controller;

import com.vision.dto.VideoSourceDto;
import com.vision.service.VideoSourceService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/video-sources")
@RequiredArgsConstructor
public class VideoSourceController {
    private final VideoSourceService service;

    @GetMapping
    public ApiResponse<List<VideoSourceDto>> list(@RequestParam(required = false) String status) {
        return ApiResponse.success(service.list(status));
    }

    @PostMapping
    public ApiResponse<VideoSourceDto> create(@RequestBody VideoSourceDto request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<VideoSourceDto> update(@PathVariable Long id, @RequestBody VideoSourceDto request) {
        return ApiResponse.success(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success(null);
    }
}
