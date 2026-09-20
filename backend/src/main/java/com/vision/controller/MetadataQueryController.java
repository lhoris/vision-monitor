package com.vision.controller;

import com.vision.dto.MetadataQueryExecuteRequest;
import com.vision.dto.MetadataQueryResultDto;
import com.vision.dto.MetadataQuerySummaryDto;
import com.vision.service.MetadataQueryService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metadata/queries")
@RequiredArgsConstructor
public class MetadataQueryController {
    private final MetadataQueryService service;

    @GetMapping
    public ApiResponse<List<MetadataQuerySummaryDto>> list() {
        return ApiResponse.success(service.list());
    }

    @PostMapping("/{queryCode}/execute")
    public ApiResponse<MetadataQueryResultDto> execute(
            @PathVariable String queryCode,
            @RequestBody(required = false) MetadataQueryExecuteRequest request
    ) {
        return ApiResponse.success(service.execute(queryCode, request));
    }
}
