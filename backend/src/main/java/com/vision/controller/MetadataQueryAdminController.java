package com.vision.controller;

import com.vision.config.AuthSessionInterceptor;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.dto.MetadataQueryAdminDto;
import com.vision.dto.MetadataQueryAdminRequest;
import com.vision.service.MetadataQueryAdminService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/metadata/queries")
@RequiredArgsConstructor
public class MetadataQueryAdminController {
    private final MetadataQueryAdminService service;

    @GetMapping
    public ApiResponse<List<MetadataQueryAdminDto>> list(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto actor,
            @RequestParam(required = false) String keyword, @RequestParam(required = false) String status) {
        return ApiResponse.success(service.list(actor, keyword, status));
    }

    @GetMapping("/{queryCode}")
    public ApiResponse<MetadataQueryAdminDto> get(@RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto actor,
                                                   @PathVariable String queryCode) {
        return ApiResponse.success(service.get(actor, queryCode));
    }

    @PostMapping
    public ApiResponse<MetadataQueryAdminDto> create(@RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto actor,
                                                      @RequestBody MetadataQueryAdminRequest request) {
        return ApiResponse.success(service.create(actor, request));
    }

    @PutMapping("/{queryCode}")
    public ApiResponse<MetadataQueryAdminDto> update(@RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto actor,
                                                      @PathVariable String queryCode, @RequestBody MetadataQueryAdminRequest request) {
        return ApiResponse.success(service.update(actor, queryCode, request));
    }

    @PostMapping("/{queryCode}/activate")
    public ApiResponse<MetadataQueryAdminDto> activate(@RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto actor,
                                                        @PathVariable String queryCode) {
        return ApiResponse.success(service.setStatus(actor, queryCode, true));
    }

    @PostMapping("/{queryCode}/deactivate")
    public ApiResponse<MetadataQueryAdminDto> deactivate(@RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto actor,
                                                          @PathVariable String queryCode) {
        return ApiResponse.success(service.setStatus(actor, queryCode, false));
    }

    @PostMapping("/{queryCode}/delete")
    public ApiResponse<Void> delete(@RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto actor,
                                     @PathVariable String queryCode) {
        service.delete(actor, queryCode);
        return ApiResponse.success(null);
    }
}
