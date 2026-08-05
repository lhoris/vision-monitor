package com.vision.controller;

import com.vision.dto.LayoutDto;
import com.vision.util.ApiResponse;
import org.springframework.web.bind.annotation.*;

/**
 * Layout Controller - 개인화 그리드 레이아웃
 */
@RestController
@RequestMapping("/api/layouts")
public class LayoutController {

    /**
     * GET /api/layouts/{userId} - 사용자 레이아웃 조회
     */
    @GetMapping("/{userId}")
    public ApiResponse<LayoutDto> getUserLayout(@PathVariable Long userId) {
        // TODO: Phase 3에서 구현
        return ApiResponse.success(null);
    }

    /**
     * POST /api/layouts - 레이아웃 저장
     */
    @PostMapping
    public ApiResponse<LayoutDto> saveLayout(@RequestBody LayoutDto layoutDto) {
        // TODO: Phase 3에서 구현
        return ApiResponse.success(layoutDto);
    }

    /**
     * PUT /api/layouts/{id} - 레이아웃 업데이트
     */
    @PutMapping("/{id}")
    public ApiResponse<LayoutDto> updateLayout(@PathVariable Long id, @RequestBody LayoutDto layoutDto) {
        // TODO: Phase 3에서 구현
        return ApiResponse.success(layoutDto);
    }

    /**
     * DELETE /api/layouts/{id} - 레이아웃 삭제
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteLayout(@PathVariable Long id) {
        // TODO: Phase 3에서 구현
        return ApiResponse.success(null);
    }

}
