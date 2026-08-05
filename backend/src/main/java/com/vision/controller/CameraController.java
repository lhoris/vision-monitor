package com.vision.controller;

import com.vision.dto.CameraDto;
import com.vision.util.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Camera Controller
 * Phase 3에서 구현
 */
@RestController
@RequestMapping("/api/cameras")
public class CameraController {

    /**
     * GET /api/cameras - 모든 카메라 조회
     * Phase 3에서 구현
     */
    @GetMapping
    public ApiResponse<List<CameraDto>> getAllCameras() {
        // TODO: Phase 3에서 구현
        return ApiResponse.success(List.of());
    }

    /**
     * GET /api/cameras/{id} - 카메라 상세 조회
     * Phase 3에서 구현
     */
    @GetMapping("/{id}")
    public ApiResponse<CameraDto> getCamera(@PathVariable Long id) {
        // TODO: Phase 3에서 구현
        return ApiResponse.success(null);
    }

    /**
     * POST /api/cameras - 카메라 등록
     * Phase 3에서 구현
     */
    @PostMapping
    public ApiResponse<CameraDto> createCamera(@RequestBody CameraDto cameraDto) {
        // TODO: Phase 3에서 구현
        return ApiResponse.success(cameraDto);
    }

    /**
     * PUT /api/cameras/{id} - 카메라 업데이트
     * Phase 3에서 구현
     */
    @PutMapping("/{id}")
    public ApiResponse<CameraDto> updateCamera(@PathVariable Long id, @RequestBody CameraDto cameraDto) {
        // TODO: Phase 3에서 구현
        return ApiResponse.success(cameraDto);
    }

    /**
     * DELETE /api/cameras/{id} - 카메라 삭제
     * Phase 3에서 구현
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCamera(@PathVariable Long id) {
        // TODO: Phase 3에서 구현
        return ApiResponse.success(null);
    }

}
