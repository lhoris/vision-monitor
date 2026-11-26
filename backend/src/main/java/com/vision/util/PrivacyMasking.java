package com.vision.util;

import java.util.regex.Pattern;

/** 개인정보를 표시용으로 변환하는 공통 규칙. 저장값은 변경하지 않는다. */
public final class PrivacyMasking {
    private static final Pattern NON_DIGIT = Pattern.compile("\\D");
    private static final Pattern NAME_LABEL = Pattern.compile("((?:신청자|이름|성명)\\s*:\\s*)([^\\r\\n,;]+)");
    private static final Pattern PHONE_LABEL = Pattern.compile("((?:전화번호|연락처)\\s*:\\s*)([^\\r\\n,;]+)");
    private static final Pattern EMAIL_LABEL = Pattern.compile("((?:이메일|이메일주소)\\s*:\\s*)([^\\r\\n,;]+)");
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

    public static String alarmMessage(String value) {
        if (value == null || value.isBlank()) return value;
        String masked = NAME_LABEL.matcher(value).replaceAll(match -> match.group(1) + name(match.group(2).trim()));
        masked = PHONE_LABEL.matcher(masked).replaceAll(match -> match.group(1) + phone(match.group(2).trim()));
        return EMAIL_LABEL.matcher(masked).replaceAll(match -> match.group(1) + email(match.group(2).trim()));
    }

    public static Object alarmVariable(String key, Object value) {
        if (value == null || key == null) return value;
        String normalized = key.replaceAll("[^A-Za-z]", "").toLowerCase();
        String text = String.valueOf(value);
        if (normalized.contains("email")) return email(text);
        if (normalized.contains("phone") || normalized.contains("mobile") || normalized.contains("tel")) return phone(text);
        if (normalized.equals("name") || normalized.contains("applicantname") || normalized.contains("username")) return name(text);
        return value;
    }
}
