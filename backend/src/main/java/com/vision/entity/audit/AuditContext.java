package com.vision.entity.audit;

/** Request-local actor information used by the audit lifecycle listener. */
public final class AuditContext {
    private static final String SYSTEM_ACTOR = "SYSTEM";
    private static final ThreadLocal<String> ACTOR = new ThreadLocal<>();

    private AuditContext() {
    }

    public static void setActor(String actor) {
        if (actor == null || actor.isBlank()) {
            ACTOR.remove();
        } else {
            ACTOR.set(actor.trim());
        }
    }

    public static String currentActor() {
        String actor = ACTOR.get();
        return actor == null || actor.isBlank() ? SYSTEM_ACTOR : actor;
    }

    public static void clear() {
        ACTOR.remove();
    }
}
