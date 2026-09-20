# Model Management Specification

## Overview

The administrator's Model Management screen monitors AI model Python processes and the control integration used to send AI inference results to equipment. The screen reads persisted status values from the database. VM Agents update process-alive status, and the control integration records communication success or failure.

## Functional Requirements

- FR-001: Administrators can access Model Management. Non-administrators cannot use the administrator menu.
- FR-002: The process selector is a multi-select filter, not a tab navigation.
- FR-003: `ALL` is shown as the first synthetic option and displays every model process.
- FR-004: Selecting one or more process areas displays only matching model processes. Selecting an individual area while `ALL` is selected keeps the `ALL` view.
- FR-005: Process areas are user-maintainable through the `PROCESS_AREA` common code. No process-area table is required.
- FR-006: The grid displays process, automation name, model name, monitoring status, control-integration status, server IP, Python project path, and last status update.
- FR-007: Monitoring status represents the Python process alive state persisted by a VM Agent.
- FR-008: Control-integration status represents the latest persisted success/failure state of the equipment-control communication.
- FR-009: Administrators can open a model's read-only monitoring event log in a popup.
- FR-010: Administrators can edit the model server IP and Python project path.
- FR-011: Administrators can request start, stop, and restart actions for a model process. The current implementation persists the requested process state; actual VM process execution is a follow-up integration.
- FR-012: Administrators can add a model process with a process area, model name, automation name, server IP, and Python project path.
- FR-013: Empty or invalid IP/path values are rejected with a visible validation error.
- FR-014: Empty process results show an explicit empty state.

## Data and API

- `TB_M26_MODEL_PROCESS` stores configuration and latest process, monitoring, and control statuses.
- `TB_M26_MODEL_EVENT_LOG` stores read-only monitoring/control events.
- `PROCESS_AREA_CODE` logically references the `PROCESS_AREA` common-code detail.
- `MODEL_PROCESS_ID` in the event log is a logical reference only.
- No physical foreign-key constraints are created.
- All tables contain the standard audit columns used by this project.
- The frontend uses the API service only; there is no runtime Mock fallback.

### Endpoints

- `GET /api/model-processes?processAreas=...`
- `POST /api/model-processes`
- `PUT /api/model-processes/{id}/settings`
- `POST /api/model-processes/{id}/actions/{start|stop|restart}`
- `GET /api/model-processes/{id}/event-logs`

## UI Rules

- The process selector must remain visually distinct from tabs.
- Status badges include both text and color; color alone is insufficient.
- Actions are grouped under the row action menu.
- Settings and event logs open as dialogs without losing the current filter.
- Event logs are read-only in this scope.

## Out of Scope

- VM Agent implementation and heartbeat ingestion endpoint.
- Actual remote Python process execution.
- Actual equipment-control protocol implementation.
- Event-log download, acknowledgement, analytics, and dashboards.

## Acceptance Criteria

- A logged-in administrator can load database-backed process rows and common-code process areas.
- Filtering with `ALL` and multiple individual areas follows the rules above.
- Updating settings, requesting a process action, adding a process, and opening logs use the corresponding API endpoint.
- No physical FK constraint is present for the logical relationships.
- Frontend tests, backend tests, and the frontend production build pass.
