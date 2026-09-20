# Model Management Implementation Plan

## Scope

Model Management is a database-backed administrator screen. It reads model processes, monitoring status, control-integration status, settings, and event logs through Spring Boot APIs. Process areas are maintained in the existing `PROCESS_AREA` common code.

## Architecture

- Frontend: `ModelManagement` page, standard process grid, multi-select process-area filter, settings/event-log dialogs.
- Frontend service: `modelManagementService.ts` calls the API only. No runtime mock or fallback fixture is used.
- Backend: `ModelProcessController` and `ModelProcessService` use `NamedParameterJdbcTemplate`.
- Database: Flyway V015 creates model-process and event-log tables; V016 seeds initial data; V017 corrects the seed text encoding.
- Referential integrity: process-area and model-process relationships are logical references only. Physical FK constraints are intentionally omitted.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/model-processes` | Return process areas and model processes; optional `processAreas` filter |
| POST | `/api/model-processes` | Create a model process |
| PUT | `/api/model-processes/{id}/settings` | Update server IP and Python project path |
| POST | `/api/model-processes/{id}/actions/{action}` | Start, stop, or restart state request |
| GET | `/api/model-processes/{id}/event-logs` | Read event logs for a model process |

## Verification

- Backend: `mvn test -q`
- Frontend: `npm test -- --run`
- Frontend build: `npm run build`
- Runtime: authenticate as `tester` and verify `GET /api/model-processes` returns common-code areas and seeded DB rows.
