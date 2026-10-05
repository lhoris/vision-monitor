package com.vision.controller;

import com.vision.exception.ApiException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Recording API boundary for alarm clip playback and download. */
@RestController
@RequestMapping("/api/recordings")
public class RecordingController {

    /**
     * Returns a contract-level error until media storage integration is configured.
     * This prevents the frontend from receiving an unstructured 404 response.
     */
    @GetMapping("/events/{eventId}/clip")
    public void getAlarmClip(
            @PathVariable Long eventId,
            @RequestParam Long cameraId,
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam int beforeSeconds,
            @RequestParam int afterSeconds
    ) {
        if (eventId == null || eventId <= 0 || cameraId == null || cameraId <= 0
                || beforeSeconds < 0 || afterSeconds < 0 || from.isBlank() || to.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Recording clip request is invalid");
        }
        throw new ApiException("RECORDING_UNAVAILABLE", "Alarm recording clip service is not configured");
    }
}
