package com.vision.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PrivacyMaskingTest {
    @Test
    void masksKoreanName() {
        assertEquals("김*수", PrivacyMasking.name("김민수"));
        assertEquals("김*", PrivacyMasking.name("김수"));
    }

    @Test
    void masksPhoneMiddleAndPreservesFormat() {
        assertEquals("010-****-5897", PrivacyMasking.phone("010-1234-5897"));
        assertEquals("010****5897", PrivacyMasking.phone("01012345897"));
    }

    @Test
    void masksEmailLocalPart() {
        assertEquals("la*****@posco.com", PrivacyMasking.email("lahoris@posco.com"));
    }
}
