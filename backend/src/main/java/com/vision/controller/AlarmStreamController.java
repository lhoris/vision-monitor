package com.vision.controller;

import com.vision.config.AuthSessionInterceptor;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.sse.AlarmSseBroker;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/alarms")
@RequiredArgsConstructor
public class AlarmStreamController {
    private final AlarmSseBroker broker;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user
    ) {
        return broker.subscribe(user.username());
    }
}
