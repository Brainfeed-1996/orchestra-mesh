# API Reference

## Base URL

```
http://localhost:8090
```

## Authentication

Currently, no authentication is required. For production deployment, consider adding JWT or API key authentication.

---

## Health Check

### GET /health

Check the health status of the control plane.

**Response:**
```json
{
  "status": "ok",
  "service": "orchestra-mesh-control-plane",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Workflows

### GET /api/v1/workflows

List all workflows with their current state and events.

**Response:**
```json
{
  "data": [
    {
      "id": "wf-001",
      "state": {
        "status": "running",
        "lastEventType": "task.started",
        "lastEventTimestamp": "2024-01-15T10:25:00.000Z",
        "startedAt": "2024-01-15T10:20:00.000Z",
        "completedAt": null,
        "metadata": {},
        "steps": [],
        "retryCount": 0
      },
      "events": [
        {
          "id": "uuid-1",
          "workflowId": "wf-001",
          "type": "workflow.created",
          "status": "created",
          "timestamp": "2024-01-15T10:20:00.000Z"
        }
      ],
      "metadata": {
        "canApprove": false,
        "canReject": false,
        "canCancel": true,
        "canRetry": false
      }
    }
  ],
  "total": 1,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### GET /api/v1/workflows/:id

Get detailed information about a specific workflow.

**Parameters:**
- `id` (path) - Workflow ID

**Response:**
```json
{
  "id": "wf-001",
  "state": { ... },
  "events": [ ... ],
  "metadata": { ... }
}
```

---

### POST /api/v1/workflows

Create a new workflow.

**Request Body:**
```json
{
  "id": "workflow-001",        // optional, auto-generated if not provided
  "type": "workflow.created",  // optional, default: "workflow.created"
  "status": "created",        // optional, default: "created"
  "payload": { }               // optional, custom data
}
```

**Response:**
```json
{
  "id": "workflow-001",
  "state": { ... },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### POST /api/v1/workflows/:id/events

Append an event to a workflow's history.

**Parameters:**
- `id` (path) - Workflow ID

**Request Body:**
```json
{
  "type": "task.completed",
  "status": "running",
  "payload": {
    "stepName": "validation",
    "result": { ... }
  },
  "metadata": { }  // optional
}
```

**Response:**
```json
{
  "id": "wf-001",
  "event": { ... },
  "state": { ... }
}
```

---

### POST /api/v1/workflows/:id/approve

Approve a workflow waiting for approval.

**Parameters:**
- `id` (path) - Workflow ID

**Request Body:**
```json
{
  "approvedBy": "user@example.com",
  "reason": "Approved for processing"
}
```

---

### POST /api/v1/workflows/:id/reject

Reject a workflow waiting for approval.

**Parameters:**
- `id` (path) - Workflow ID

**Request Body:**
```json
{
  "rejectedBy": "user@example.com",
  "reason": "Missing required documentation"
}
```

---

### POST /api/v1/workflows/:id/cancel

Cancel a running or pending workflow.

**Parameters:**
- `id` (path) - Workflow ID

**Request Body:**
```json
{
  "reason": "Cancelled by operator"
}
```

---

### POST /api/v1/workflows/:id/retry

Retry a failed workflow.

**Parameters:**
- `id` (path) - Workflow ID

**Request Body:**
```json
{
  "count": 1
}
```

---

## Status Colors

### GET /api/v1/status-colors

Get all status colors and labels for UI rendering.

**Response:**
```json
{
  "data": [
    { "status": "created", "color": "#6b7280", "label": "Created" },
    { "status": "running", "color": "#3b82f6", "label": "Running" },
    { "status": "waiting_approval", "color": "#f59e0b", "label": "Pending Approval" },
    { "status": "approved", "color": "#10b981", "label": "Approved" },
    { "status": "rejected", "color": "#ef4444", "label": "Rejected" },
    { "status": "completed", "color": "#10b981", "label": "Completed" },
    { "status": "failed", "color": "#ef4444", "label": "Failed" },
    { "status": "cancelled", "color": "#6b7280", "label": "Cancelled" },
    { "status": "paused", "color": "#8b5cf6", "label": "Paused" }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "invalid_transition",
  "message": "Cannot approve workflow in current state"
}
```

### 404 Not Found
```json
{
  "error": "workflow_not_found",
  "message": "Workflow wf-001 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred"
}
```