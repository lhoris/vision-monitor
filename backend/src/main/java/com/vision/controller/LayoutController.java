package com.vision.controller;

import com.vision.dto.LayoutDto;
import com.vision.service.LayoutService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * Layout Controller - 개인화 그리드 레이아웃
 */
@RestController
@RequestMapping("/api/layouts")
@RequiredArgsConstructor
public class LayoutController {

    private final LayoutService layoutService;

    /**
     * GET /api/layouts/me - 현재 사용자 레이아웃 조회
     */
    @GetMapping("/me")
    public ApiResponse<LayoutDto> getMyLayout(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername
    ) {
        return ApiResponse.success(layoutService.getMyLayout(actorUsername));
    }

    /**
     * GET /api/layouts/{userId} - 사용자 레이아웃 조회
     */
    @GetMapping("/{userId}")
    public ApiResponse<LayoutDto> getUserLayout(@PathVariable Long userId) {
        return ApiResponse.success(layoutService.getUserLayout(userId));
    }

    /**
     * POST /api/layouts - 레이아웃 저장
     */
    @PostMapping
    public ApiResponse<LayoutDto> saveLayout(@RequestBody LayoutDto layoutDto) {
        return ApiResponse.success(layoutService.saveLayout(layoutDto));
    }

    /**
     * PUT /api/layouts/me - 현재 사용자 레이아웃 저장
     */
    @PutMapping("/me")
    public ApiResponse<LayoutDto> saveMyLayout(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername,
            @RequestBody LayoutDto layoutDto
    ) {
        return ApiResponse.success(layoutService.saveMyLayout(actorUsername, layoutDto));
    }

    /**
     * PUT /api/layouts/{id} - 레이아웃 업데이트
     */
    @PutMapping("/{id}")
    public ApiResponse<LayoutDto> updateLayout(@PathVariable Long id, @RequestBody LayoutDto layoutDto) {
        return ApiResponse.success(layoutService.updateLayout(id, layoutDto));
    }

    /**
     * DELETE /api/layouts/{id} - 레이아웃 삭제
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteLayout(@PathVariable Long id) {
        layoutService.deleteLayout(id);
        return ApiResponse.success(null);
    }

}
