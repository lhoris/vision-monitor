package com.vision.controller;

import com.vision.dto.RuntimeCommonCodeDto;
import com.vision.service.CommonCodeService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/common-codes")
@RequiredArgsConstructor
public class CommonCodeController {
    private final CommonCodeService service;

    @GetMapping("/bootstrap")
    public ApiResponse<RuntimeCommonCodeDto> bootstrap() { return ApiResponse.success(service.bootstrap()); }

    @GetMapping
    public ApiResponse<RuntimeCommonCodeDto> find(@RequestParam(required = false) String names) { return ApiResponse.success(service.findRuntime(names)); }

    @GetMapping("/{codeName}")
    public ApiResponse<RuntimeCommonCodeDto> findOne(@PathVariable String codeName) { return ApiResponse.success(service.findRuntimeByName(codeName)); }
}
