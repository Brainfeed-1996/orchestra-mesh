import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { FileBackedEventStore } from '../../../packages/event-store/src/index.js';
import { projectWorkflowState } from '../../../packages/state-machine/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
const eventStorePath = path.join(dataDir, 'events.json');

fs.mkdirSync(dataDir, { recursive: true });

const port = process.env.PORT || 8090;
const eventStore = new FileBackedEventStore(eventStorePath);
let workflowIds = Array.from(new Set(eventStore.all().map((event) => event.workflowId)));

if (workflowIds.length === 0) {
  workflowIds = ['wf-001', 'wf-002'];
  eventStore.append({ workflowId: 'wf-001', type: 'workflow.created', status: 'created' });
  eventStore.append({ workflowId: 'wf-001', type: 'approval.requested', status: 'waiting_approval' });
  eventStore.append({ workflowId: 'wf-002', type: 'workflow.created', status: 'created' });
  eventStore.append({ workflowId: 'wf-002', type: 'task.started', status: 'running' });
}

function snapshotWorkflows() {
  return workflowIds.map((workflowId) => {
    const events = eventStore.listByWorkflow(workflowId);
    return {
      id: workflowId,
      state: projectWorkflowState(events),
      events
    };
  });
}

function json(res, code, payload) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return json(res, 200, { status: 'ok', service: 'orchestra-mesh-control-plane' });
  }

  if (req.method === 'GET' && req.url === '/api/v1/workflows') {
    return json(res, 200, { data: snapshotWorkflows(), total: workflowIds.length });
  }

  if (req.method === 'POST' && req.url === '/api/v1/workflows') {
    const rawBody = await collectBody(req);
    const input = rawBody ? JSON.parse(rawBody) : {};
    const workflowId = input.id || `wf-${String(workflowIds.length + 1).padStart(3, '0')}`;
    if (!workflowIds.includes(workflowId)) {
      workflowIds = [...workflowIds, workflowId];
    }
    eventStore.append({ workflowId, type: 'workflow.created', status: 'created' });
    return json(res, 201, { id: workflowId, state: projectWorkflowState(eventStore.listByWorkflow(workflowId)) });
  }

  if (req.method === 'POST' && req.url?.startsWith('/api/v1/workflows/') && req.url.endsWith('/events')) {
    const [, , , , workflowId] = req.url.split('/');
    const rawBody = await collectBody(req);
    const input = rawBody ? JSON.parse(rawBody) : {};
    if (!workflowIds.includes(workflowId)) {
      workflowIds = [...workflowIds, workflowId];
    }
    eventStore.append({ workflowId, type: input.type || 'event.appended', status: input.status || 'running' });
    return json(res, 201, { id: workflowId, state: projectWorkflowState(eventStore.listByWorkflow(workflowId)) });
  }

  return json(res, 404, { error: 'not_found' });
});

server.listen(port, () => {
  console.log(`orchestra-mesh control plane listening on :${port}`);
});
