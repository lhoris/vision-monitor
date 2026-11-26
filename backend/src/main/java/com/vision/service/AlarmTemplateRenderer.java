package com.vision.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.entity.AlarmRequest;
import com.vision.entity.AlarmRule;
import lombok.Getter;

import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Renders channel templates without making notification adapters depend on request details. */
public class AlarmTemplateRenderer {
    private static final Pattern VARIABLE = Pattern.compile("\\{\\{\\s*([\\w.-]+)\\s*}}" );
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Rendered render(AlarmRule rule, AlarmRequest request) {
        Map<String, Object> context = context(request);
        String fallback = value(request.getMessage());
        String app = render(rule.getAppMessageTemplate(), context, fallback);
        String subject = render(rule.getEmailSubjectTemplate(), context, value(rule.getName(), rule.getCode()));
        String body = render(rule.getEmailBodyTemplate(), context, fallback);
        String teams = render(rule.getTeamsMessageTemplate(), context, fallback);
        return new Rendered(app, subject, body, teams);
    }

    private Map<String, Object> context(AlarmRequest request) {
        Map<String, Object> values = new LinkedHashMap<>();
        values.put("message", request.getMessage());
        values.put("alarmCode", request.getAlarmCode());
        values.put("severity", request.getSeverity());
        values.put("sourceType", request.getSourceType());
        values.put("sourceId", request.getSourceId());
        values.put("modelProcessId", request.getSourceType() != null && request.getSourceType().toUpperCase().contains("MODEL")
                ? request.getSourceId() : null);
        values.put("occurredAt", request.getOccurredTimestamp() == null ? null : request.getOccurredTimestamp().toInstant(ZoneOffset.UTC).toString());
        if (request.getContext() != null && !request.getContext().isBlank()) {
            try {
                values.putAll(objectMapper.readValue(request.getContext(), new TypeReference<Map<String, Object>>() { }));
            } catch (Exception ignored) {
                for (String entry : request.getContext().split(";")) {
                    String[] pair = entry.split("=", 2);
                    if (pair.length == 2) values.put(pair[0], pair[1]);
                }
            }
        }
        return values;
    }

    private String render(String template, Map<String, Object> context, String fallback) {
        String source = template == null || template.isBlank() ? fallback : template;
        Matcher matcher = VARIABLE.matcher(source == null ? "" : source);
        StringBuffer result = new StringBuffer();
        while (matcher.find()) {
            Object value = context.get(matcher.group(1));
            matcher.appendReplacement(result, Matcher.quoteReplacement(value == null ? "" : String.valueOf(value)));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    private String value(String value) { return value == null ? "" : value; }
    private String value(String value, String fallback) { return value == null || value.isBlank() ? fallback : value; }

    @Getter
    public static class Rendered {
        private final String appMessage;
        private final String emailSubject;
        private final String emailBody;
        private final String teamsMessage;

        public Rendered(String appMessage, String emailSubject, String emailBody, String teamsMessage) {
            this.appMessage = appMessage;
            this.emailSubject = emailSubject;
            this.emailBody = emailBody;
            this.teamsMessage = teamsMessage;
        }
    }
}
