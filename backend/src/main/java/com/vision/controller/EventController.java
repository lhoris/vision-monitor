package com.vision.controller;

import com.vision.dto.EventPageResponse;
import com.vision.util.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Event Controller
 * Phase 3에서 구현
 */
@RestController
@RequestMapping("/api/events")
public class EventController {

    @GetMapping
    public ApiResponse<EventPageResponse> getEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        int safePage = Math.max(page, 0);
        int safePageSize = Math.min(Math.max(pageSize, 1), 100);
        return ApiResponse.success(new EventPageResponse(List.of(), 0, 0, safePage, safePageSize));
    }

    // TODO: Phase 3에서 구현

}
