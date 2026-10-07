package com.vision.controller;

import com.vision.dto.EventPageResponse;
import com.vision.service.EventQueryService;
import com.vision.util.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;


/**
 * Event Controller
 * Phase 3에서 구현
 */
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventQueryService eventQueryService;

    @GetMapping
    public ApiResponse<EventPageResponse> getEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(eventQueryService.list(page, pageSize));
    }

    // TODO: Phase 3에서 구현

}
