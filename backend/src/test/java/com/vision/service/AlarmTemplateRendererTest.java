package com.vision.service;

import com.vision.entity.AlarmRequest;
import com.vision.entity.AlarmRule;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AlarmTemplateRendererTest {
    @Test
    void rendersTemplateVariablesAndUsesFallbackWhenTemplateIsBlank() {
        AlarmRule rule = new AlarmRule();
        rule.setCode("MODEL_WARNING");
        rule.setName("모델 경고");
        rule.setAppMessageTemplate("{{alarmCode}} / {{cameraId}} / {{message}}");
        rule.setEmailSubjectTemplate("[{{severity}}] {{alarmCode}}");

        AlarmRequest request = new AlarmRequest();
        request.setAlarmCode("MODEL_WARNING");
        request.setSeverity("warning");
        request.setMessage("이상 징후");
        request.setOccurredTimestamp(LocalDateTime.now());
        request.setContext("{\"cameraId\":1,\"sourceType\":\"MODEL\",\"modelProcessId\":12}");

        AlarmTemplateRenderer.Rendered rendered = new AlarmTemplateRenderer().render(rule, request);

        assertEquals("MODEL_WARNING / 1 / 이상 징후", rendered.getAppMessage());
        assertEquals("[warning] MODEL_WARNING", rendered.getEmailSubject());
        assertEquals("이상 징후", rendered.getEmailBody());
        assertEquals("이상 징후", rendered.getTeamsMessage());
    }
}
