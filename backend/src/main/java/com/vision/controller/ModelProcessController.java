package com.vision.controller;

import com.vision.dto.ModelProcessCreateRequest;
import com.vision.dto.ModelProcessSettingsRequest;
import com.vision.config.AuthSessionInterceptor;
import com.vision.dto.AuthenticatedUserDto;
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
    @GetMapping("/agents")
    public ApiResponse<List<Map<String, Object>>> agents() { return ApiResponse.success(service.listAgents()); }
    @PostMapping
    public ApiResponse<Map<String, Object>> create(@RequestBody ModelProcessCreateRequest request, @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto actor) { return ApiResponse.success(service.create(request, actor.username())); }
    @PutMapping("/{id}/settings")
    public ApiResponse<Map<String, Object>> updateSettings(@PathVariable Long id, @RequestBody ModelProcessSettingsRequest request, @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto actor) { return ApiResponse.success(service.updateSettings(id, request, actor.username())); }
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto actor) { service.delete(id, actor.username()); return ApiResponse.success(null); }
    @PostMapping("/{id}/actions/{action}")
    public ApiResponse<Map<String, Object>> control(@PathVariable Long id, @PathVariable String action, @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto actor) { return ApiResponse.success(service.control(id, action, actor.username())); }
    @GetMapping("/{id}/event-logs")
    public ApiResponse<List<Map<String, Object>>> logs(@PathVariable Long id) { return ApiResponse.success(service.logs(id)); }
}
