package com.vision.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class EmailPrivacyMaskingTest {
    @Test
    void masksPersonalDataInEmailSubjectAndBody() {
        assertEquals("가입 신청자: 이*훈", PrivacyMasking.alarmMessage("가입 신청자: 이성훈"));
        assertEquals("신청자: 이*훈\n이메일: la*****@posco.com", PrivacyMasking.alarmMessage("신청자: 이성훈\n이메일: lahoris@posco.com"));
    }
}
