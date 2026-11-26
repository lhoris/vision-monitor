package com.vision.util;

import java.util.regex.Pattern;

/** 개인정보를 표시용으로 변환하는 공통 규칙. 저장값은 변경하지 않는다. */
public final class PrivacyMasking {
    private static final Pattern NON_DIGIT = Pattern.compile("\\D");
    private PrivacyMasking() { }

    public static String name(String value) {
        if (value == null || value.isBlank()) return value;
        String text = value.trim();
        if (text.length() <= 1) return "*";
        if (text.length() == 2) return text.charAt(0) + "*";
        return text.charAt(0) + "*".repeat(text.length() - 2) + text.charAt(text.length() - 1);
    }

    public static String phone(String value) {
        if (value == null || value.isBlank()) return value;
        String digits = NON_DIGIT.matcher(value).replaceAll("");
        if (digits.length() < 8) return "*".repeat(digits.length());
        String masked = digits.substring(0, 3) + "****" + digits.substring(digits.length() - 4);
        return value.contains("-") ? masked.substring(0, 3) + "-" + masked.substring(3, 7) + "-" + masked.substring(7) : masked;
    }

    public static String email(String value) {
        if (value == null || value.isBlank()) return value;
        int at = value.indexOf('@');
        if (at <= 0 || at == value.length() - 1) return value;
        String local = value.substring(0, at);
        return local.substring(0, Math.min(2, local.length())) + "*".repeat(Math.max(local.length() - 2, 1)) + value.substring(at);
    }
}
