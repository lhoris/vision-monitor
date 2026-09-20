# Model Management Tasks

- [x] Define model process and event-log data model with audit columns and logical references only.
- [x] Move process-area values to the existing `PROCESS_AREA` common code.
- [x] Add Flyway tables for model processes and event logs.
- [x] Seed default process areas, model processes, and event logs.
- [x] Add API controller, DTOs, and JDBC service.
- [x] Replace frontend model-management Mock service with API calls.
- [x] Keep `ALL` as a UI-only filter option.
- [x] Keep process-area creation through the common-code API.
- [x] Update model-management tests to mock the API boundary instead of application state.
- [x] Run frontend tests and production build.
- [x] Restart backend and verify Flyway reaches version 017.

## Follow-up

- Add VM Agent heartbeat ingestion API and persistence updates.
- Add control-integration result ingestion API and event creation.
- Add authorization checks for administrator-only model operations if not already enforced by the application security layer.
