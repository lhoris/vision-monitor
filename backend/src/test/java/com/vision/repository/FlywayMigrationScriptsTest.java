package com.vision.repository;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;

class FlywayMigrationScriptsTest {

    private static final Path MIGRATION_DIR = Path.of("src/main/resources/db/migration");

    private static final Pattern LEGACY_TABLE_DEPENDENCY = Pattern.compile(
            "\\b(from|join|like|into|update)\\s+(cameras|streams|events|recordings|alert_settings|users|layouts|org_units|audit_logs)\\b"
                    + "|\\bdelete\\s+from\\s+(cameras|streams|events|recordings|alert_settings|users|layouts|org_units|audit_logs)\\b",
            Pattern.CASE_INSENSITIVE
    );

    @Test
    void migrationsDoNotDependOnLegacyLowercaseTables() throws IOException {
        try (Stream<Path> paths = Files.list(MIGRATION_DIR)) {
            String violations = paths
                    .filter(path -> path.getFileName().toString().toLowerCase(Locale.ROOT).endsWith(".sql"))
                    .flatMap(path -> legacyViolations(path).stream())
                    .reduce("", (left, right) -> left + right + System.lineSeparator());

            assertFalse(violations.contains(".sql:"), "Legacy table dependency remains in Flyway migrations:" + System.lineSeparator() + violations);
        }
    }

    @Test
    void removedLegacyMigrationIsNotPresent() throws IOException {
        assertFalse(Files.exists(MIGRATION_DIR.resolve("V012__move_legacy_tables_to_tb_m26.sql")), "Removed legacy migration V012 must not be present");
    }

    private java.util.List<String> legacyViolations(Path path) {
        try {
            return findViolations(path, LEGACY_TABLE_DEPENDENCY);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read " + path, exception);
        }
    }

    private java.util.List<String> findViolations(Path path, Pattern pattern) throws IOException {
        java.util.List<String> lines = Files.readAllLines(path);
        java.util.List<String> violations = new java.util.ArrayList<>();
        for (int index = 0; index < lines.size(); index++) {
            String line = lines.get(index);
            if (!line.stripLeading().startsWith("--") && pattern.matcher(line).find()) {
                violations.add(path.getFileName() + ":" + (index + 1) + ": " + line.trim());
            }
        }
        return violations;
    }
}
