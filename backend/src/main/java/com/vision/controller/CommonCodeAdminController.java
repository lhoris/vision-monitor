package com.vision.controller;

import com.vision.dto.CommonCodeDetailDto;
import com.vision.dto.CommonCodeDto;
import com.vision.service.CommonCodeService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/common-codes")
@RequiredArgsConstructor
public class CommonCodeAdminController {
    private final CommonCodeService service;

    @GetMapping
    public ApiResponse<List<CommonCodeDto>> list(@RequestHeader(value = "X-Actor-Username", required = false) String actor) { return ApiResponse.success(service.listAdmin(actor)); }
    @PostMapping
    public ApiResponse<CommonCodeDto> create(@RequestHeader(value = "X-Actor-Username", required = false) String actor, @RequestBody CommonCodeDto request) { return ApiResponse.success(service.createCode(actor, request)); }
    @PutMapping("/{codeId}")
    public ApiResponse<CommonCodeDto> update(@RequestHeader(value = "X-Actor-Username", required = false) String actor, @PathVariable Long codeId, @RequestBody CommonCodeDto request) { return ApiResponse.success(service.updateCode(actor, codeId, request)); }
    @PostMapping("/{codeId}/deactivate")
    public ApiResponse<Void> deactivate(@RequestHeader(value = "X-Actor-Username", required = false) String actor, @PathVariable Long codeId) { service.deactivateCode(actor, codeId); return ApiResponse.success(null); }
    @GetMapping("/{codeId}/details")
    public ApiResponse<List<CommonCodeDetailDto>> details(@RequestHeader(value = "X-Actor-Username", required = false) String actor, @PathVariable Long codeId) { return ApiResponse.success(service.listDetails(actor, codeId)); }
    @PostMapping("/{codeId}/details")
    public ApiResponse<CommonCodeDetailDto> createDetail(@RequestHeader(value = "X-Actor-Username", required = false) String actor, @PathVariable Long codeId, @RequestBody CommonCodeDetailDto request) { return ApiResponse.success(service.createDetail(actor, codeId, request)); }
    @PutMapping("/{codeId}/details/{detailId}")
    public ApiResponse<CommonCodeDetailDto> updateDetail(@RequestHeader(value = "X-Actor-Username", required = false) String actor, @PathVariable Long codeId, @PathVariable Long detailId, @RequestBody CommonCodeDetailDto request) { return ApiResponse.success(service.updateDetail(actor, codeId, detailId, request)); }
    @PostMapping("/{codeId}/details/{detailId}/deactivate")
    public ApiResponse<Void> deactivateDetail(@RequestHeader(value = "X-Actor-Username", required = false) String actor, @PathVariable Long codeId, @PathVariable Long detailId) { service.deactivateDetail(actor, codeId, detailId); return ApiResponse.success(null); }
}
