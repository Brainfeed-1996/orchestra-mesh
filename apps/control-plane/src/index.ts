import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FileBackedEventStore,
  CachedEventStore,
  type WorkflowEvent,
} from '../../packages/event-store/src/index.js';
import {
  projectWorkflowState,
  canTransitionTo,
  getStatusColor,
  getStatusLabel,
} from '../../packages/state-machine/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8090;
const DATA_DIR = path.resolve(__dirname, '../../data');
const EVENT_STORE_PATH = path.join(DATA_DIR, 'events.json');

const eventStore = new CachedEventStore(new FileBackedEventStore(EVENT_STORE_PATH));

let workflowIds: string[] = Array.from(
  new Set(eventStore.all().map((event) => event.workflowId))
);

if (workflowIds.length === 0) {
  workflowIds = ['wf-001', 'wf-002'];
  eventStore.append({ workflowId: 'wf-001', type: 'workflow.created', status: 'created' });
  eventStore.append({ workflowId: 'wf-001', type: 'approval.requested', status: 'waiting_approval' });
  eventStore.append({ workflowId: 'wf-002', type: 'workflow.created', status: 'created' });
  eventStore.append({ workflowId: 'wf-002', type: 'task.started', status: 'running' });
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

interface WorkflowResponse {
  id: string;
  state: ReturnType<typeof projectWorkflowState>;
  events: WorkflowEvent[];
  metadata?: {
    canApprove?: boolean;
    canReject?: boolean;
    canCancel?: boolean;
    canRetry?: boolean;
  };
}

function snapshotWorkflows(): WorkflowResponse[] {
  return workflowIds.map((workflowId) => {
    const events = eventStore.listByWorkflow(workflowId);
    const state = projectWorkflowState(events);
    return {
      id: workflowId,
      state,
      events,
      metadata: computeWorkflowActions(workflowId, state),
    };
  });
}

function computeWorkflowActions(workflowId: string, state: ReturnType<typeof projectWorkflowState>) {
  return {
    canApprove: state.status === 'waiting_approval',
    canReject: state.status === 'waiting_approval',
    canCancel: ['created', 'running', 'waiting_approval', 'paused'].includes(state.status),
    canRetry: state.status === 'failed',
  };
}

function json(res: express.Response, code: number, payload: unknown) {
  res.status(code).json(payload);
}

app.get('/health', (_req, res) => {
  json(res, 200, {
    status: 'ok',
    service: 'orchestra-mesh-control-plane',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/workflows', (_req, res) => {
  const workflows = snapshotWorkflows();
  json(res, 200, {
    data: workflows,
    total: workflows.length,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/workflows/:id', (req, res) => {
  const { id } = req.params;
  if (!workflowIds.includes(id)) {
    return json(res, 404, { error: 'workflow_not_found', message: `Workflow ${id} not found` });
  }
  const events = eventStore.listByWorkflow(id);
  const state = projectWorkflowState(events);
  json(res, 200, { id, state, events, metadata: computeWorkflowActions(id, state) });
});

app.post('/api/v1/workflows', (req, res) => {
  const { id: requestedId, type, status } = req.body;
  const workflowId = requestedId || `wf-${String(workflowIds.length + 1).padStart(3, '0')}`;

  if (!workflowIds.includes(workflowId)) {
    workflowIds = [...workflowIds, workflowId];
  }

  eventStore.append({
    workflowId,
    type: type || 'workflow.created',
    status: status || 'created',
    payload: req.body.payload,
  });

  const events = eventStore.listByWorkflow(workflowId);
  const state = projectWorkflowState(events);

  json(res, 201, {
    id: workflowId,
    state,
    createdAt: events[0]?.timestamp,
  });
});

app.post('/api/v1/workflows/:id/events', (req, res) => {
  const { id: workflowId } = req.params;
  const { type, status, payload } = req.body;

  if (!workflowIds.includes(workflowId)) {
    workflowIds = [...workflowIds, workflowId];
  }

  const event = eventStore.append({
    workflowId,
    type: type || 'event.appended',
    status: status || 'running',
    payload,
    metadata: req.body.metadata,
  });

  const events = eventStore.listByWorkflow(workflowId);
  const state = projectWorkflowState(events);

  json(res, 201, {
    id: workflowId,
    event,
    state,
  });
});

app.post('/api/v1/workflows/:id/approve', (req, res) => {
  const { id: workflowId } = req.params;
  if (!workflowIds.includes(workflowId)) {
    return json(res, 404, { error: 'workflow_not_found' });
  }

  const events = eventStore.listByWorkflow(workflowId);
  const state = projectWorkflowState(events);

  if (!canTransitionTo(state.status, 'approved')) {
    return json(res, 400, { error: 'invalid_transition', message: 'Cannot approve workflow in current state' });
  }

  eventStore.append({
    workflowId,
    type: 'approval.approved',
    status: 'approved',
    payload: { approvedBy: req.body.approvedBy || 'system', reason: req.body.reason },
  });

  const newEvents = eventStore.listByWorkflow(workflowId);
  json(res, 200, { id: workflowId, state: projectWorkflowState(newEvents) });
});

app.post('/api/v1/workflows/:id/reject', (req, res) => {
  const { id: workflowId } = req.params;
  if (!workflowIds.includes(workflowId)) {
    return json(res, 404, { error: 'workflow_not_found' });
  }

  const events = eventStore.listByWorkflow(workflowId);
  const state = projectWorkflowState(events);

  if (!canTransitionTo(state.status, 'rejected')) {
    return json(res, 400, { error: 'invalid_transition', message: 'Cannot reject workflow in current state' });
  }

  eventStore.append({
    workflowId,
    type: 'approval.rejected',
    status: 'rejected',
    payload: { rejectedBy: req.body.rejectedBy || 'system', reason: req.body.reason },
  });

  const newEvents = eventStore.listByWorkflow(workflowId);
  json(res, 200, { id: workflowId, state: projectWorkflowState(newEvents) });
});

app.post('/api/v1/workflows/:id/cancel', (req, res) => {
  const { id: workflowId } = req.params;
  if (!workflowIds.includes(workflowId)) {
    return json(res, 404, { error: 'workflow_not_found' });
  }

  eventStore.append({
    workflowId,
    type: 'workflow.cancelled',
    status: 'cancelled',
    payload: { reason: req.body.reason || 'Cancelled by user' },
  });

  const newEvents = eventStore.listByWorkflow(workflowId);
  json(res, 200, { id: workflowId, state: projectWorkflowState(newEvents) });
});

app.post('/api/v1/workflows/:id/retry', (req, res) => {
  const { id: workflowId } = req.params;
  if (!workflowIds.includes(workflowId)) {
    return json(res, 404, { error: 'workflow_not_found' });
  }

  eventStore.append({
    workflowId,
    type: 'retry.attempts',
    status: 'running',
    payload: { count: (req.body.count || 1) },
  });

  const newEvents = eventStore.listByWorkflow(workflowId);
  json(res, 200, { id: workflowId, state: projectWorkflowState(newEvents) });
});

app.get('/api/v1/status-colors', (_req, res) => {
  const colors = [
    { status: 'created', color: getStatusColor('created'), label: getStatusLabel('created') },
    { status: 'running', color: getStatusColor('running'), label: getStatusLabel('running') },
    { status: 'waiting_approval', color: getStatusColor('waiting_approval'), label: getStatusLabel('waiting_approval') },
    { status: 'approved', color: getStatusColor('approved'), label: getStatusLabel('approved') },
    { status: 'rejected', color: getStatusColor('rejected'), label: getStatusLabel('rejected') },
    { status: 'completed', color: getStatusColor('completed'), label: getStatusLabel('completed') },
    { status: 'failed', color: getStatusColor('failed'), label: getStatusLabel('failed') },
    { status: 'cancelled', color: getStatusColor('cancelled'), label: getStatusLabel('cancelled') },
    { status: 'paused', color: getStatusColor('paused'), label: getStatusLabel('paused') },
  ];
  json(res, 200, { data: colors });
});

app.use((_req, res) => {
  json(res, 404, { error: 'not_found', message: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🎵 Orchestra Mesh Control Plane listening on :${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/v1`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

export default app;