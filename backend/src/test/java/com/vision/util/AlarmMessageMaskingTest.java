package com.vision.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AlarmMessageMaskingTest {
    @Test
    void masksLabeledPersonalValuesInAlarmMessages() {
        String message = "신규 사용자 가입신청이 접수되었습니다.\n신청자: 이성훈\n연락처: 010-1234-5897\n이메일: lah***@posco.com";
        assertEquals("신규 사용자 가입신청이 접수되었습니다.\n신청자: 이*훈\n연락처: 010-****-5897\n이메일: la****@posco.com", PrivacyMasking.alarmMessage(message));
    }

    @Test
    void masksTemplateVariablesByKey() {
        assertEquals("이*훈", PrivacyMasking.alarmVariable("applicantName", "이성훈"));
        assertEquals("la*****@posco.com", PrivacyMasking.alarmVariable("email", "lahoris@posco.com"));
        assertEquals("010-****-5897", PrivacyMasking.alarmVariable("phone", "010-1234-5897"));
    }
}
