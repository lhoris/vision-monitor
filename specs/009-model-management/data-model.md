# Model Management Data Model

## Design Decisions

- Process areas are managed by the existing common-code tables. No dedicated process-area table is created.
- `ALL` is a UI-only filter option and is never stored as a process-area detail.
- Foreign keys are logical references only. This project does not add physical FK constraints.
- All tables use the project's standard audit columns (`CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY`, `DELETED_AT`, `DELETED_BY`, `USE_YN`).

## Common Code

The `PROCESS_AREA` common code group stores selectable process areas. Its details use the existing Korean and English name columns. A model process references a detail through `PROCESS_AREA_CODE`.

## TB_M26_MODEL_PROCESS

Stores the model process configuration and the latest statuses reported by the VM Agent and control integration.

| Column | Description |
|---|---|
| `MODEL_PROCESS_ID` | Primary identifier |
| `PROCESS_AREA_CODE` | Logical reference to `TB_M26_CODE_DETAIL.CODE_VALUE` under `PROCESS_AREA` |
| `MODEL_NAME` | Model display name |
| `AUTOMATION_NAME` | Operation automation technology name |
| `SERVER_IP` | VM/server IPv4 address |
| `PYTHON_PROJECT_PATH` | Python project path on the VM |
| `PROCESS_STATUS` | `RUNNING`, `STOPPED`, `ERROR`, `RESTARTING`, `UNKNOWN` |
| `MONITORING_STATUS` | Agent/alive status: `NORMAL`, `FAILED`, `CHECKING`, `UNKNOWN` |
| `CONTROL_STATUS` | Control integration status: `NORMAL`, `FAILED`, `CHECKING`, `UNKNOWN` |
| `LAST_STATUS_AT` | Last status update timestamp |
| `DESCRIPTION` | Optional description |

Indexes cover `PROCESS_AREA_CODE`, `PROCESS_STATUS`, `MONITORING_STATUS`, and `CONTROL_STATUS`.

## TB_M26_MODEL_EVENT_LOG

Stores monitoring and model-management events for read-only log dialogs.

| Column | Description |
|---|---|
| `MODEL_EVENT_LOG_ID` | Primary identifier |
| `MODEL_PROCESS_ID` | Logical reference to `TB_M26_MODEL_PROCESS.MODEL_PROCESS_ID` |
| `OCCURRED_AT` | Event timestamp |
| `SEVERITY` | `INFO`, `WARNING`, or `ERROR` |
| `EVENT_TYPE` | Event category |
| `MESSAGE` | Human-readable event message |
| `DETECTION_SUMMARY` | Optional detection result summary |

An index covers `(MODEL_PROCESS_ID, OCCURRED_AT)` for the event-log popup.

## API Mapping

- `GET /api/model-processes`: process areas from common code plus model process rows; accepts comma-separated `processAreas` filters.
- `POST /api/model-processes`: creates a model process with initial `UNKNOWN`/`CHECKING` statuses.
- `PUT /api/model-processes/{id}/settings`: updates server IP and Python project path.
- `POST /api/model-processes/{id}/actions/{start|stop|restart}`: records the requested process control state.
- `GET /api/model-processes/{id}/event-logs`: returns read-only event logs.
