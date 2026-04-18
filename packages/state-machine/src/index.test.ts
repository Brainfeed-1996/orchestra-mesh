import {
  projectWorkflowState,
  canTransitionTo,
  getStatusColor,
  getStatusLabel,
  type WorkflowEvent,
} from '../src/index.js';

describe('projectWorkflowState', () => {
  test('should return initial state for empty events', () => {
    const state = projectWorkflowState([]);

    expect(state.status).toBe('created');
    expect(state.lastEventType).toBeNull();
    expect(state.startedAt).toBeNull();
    expect(state.completedAt).toBeNull();
    expect(state.metadata).toEqual({});
  });

  test('should project workflow.created event', () => {
    const events: WorkflowEvent[] = [
      {
        workflowId: 'wf-001',
        type: 'workflow.created',
        status: 'created',
        timestamp: '2024-01-15T10:00:00.000Z',
      },
    ];

    const state = projectWorkflowState(events);

    expect(state.status).toBe('created');
    expect(state.lastEventType).toBe('workflow.created');
    expect(state.startedAt).toBe('2024-01-15T10:00:00.000Z');
  });

  test('should project task.started event', () => {
    const events: WorkflowEvent[] = [
      {
        workflowId: 'wf-001',
        type: 'workflow.created',
        status: 'created',
        timestamp: '2024-01-15T10:00:00.000Z',
      },
      {
        workflowId: 'wf-001',
        type: 'task.started',
        status: 'running',
        payload: { stepName: 'validation' },
        timestamp: '2024-01-15T10:05:00.000Z',
      },
    ];

    const state = projectWorkflowState(events);

    expect(state.status).toBe('running');
    expect(state.currentStep).toBe('validation');
  });

  test('should project approval.requested event', () => {
    const events: WorkflowEvent[] = [
      {
        workflowId: 'wf-001',
        type: 'workflow.created',
        status: 'created',
        timestamp: '2024-01-15T10:00:00.000Z',
      },
      {
        workflowId: 'wf-001',
        type: 'approval.requested',
        status: 'waiting_approval',
        timestamp: '2024-01-15T10:05:00.000Z',
      },
    ];

    const state = projectWorkflowState(events);

    expect(state.status).toBe('waiting_approval');
  });

  test('should project approval.approved event', () => {
    const events: WorkflowEvent[] = [
      {
        workflowId: 'wf-001',
        type: 'approval.requested',
        status: 'waiting_approval',
        timestamp: '2024-01-15T10:05:00.000Z',
      },
      {
        workflowId: 'wf-001',
        type: 'approval.approved',
        status: 'approved',
        timestamp: '2024-01-15T10:10:00.000Z',
      },
    ];

    const state = projectWorkflowState(events);

    expect(state.status).toBe('approved');
  });

  test('should project approval.rejected event', () => {
    const events: WorkflowEvent[] = [
      {
        workflowId: 'wf-001',
        type: 'approval.requested',
        status: 'waiting_approval',
        timestamp: '2024-01-15T10:05:00.000Z',
      },
      {
        workflowId: 'wf-001',
        type: 'approval.rejected',
        status: 'rejected',
        payload: { reason: 'Incomplete data' },
        timestamp: '2024-01-15T10:10:00.000Z',
      },
    ];

    const state = projectWorkflowState(events);

    expect(state.status).toBe('rejected');
    expect(state.error).toBe('Incomplete data');
  });

  test('should project workflow.completed event', () => {
    const events: WorkflowEvent[] = [
      {
        workflowId: 'wf-001',
        type: 'workflow.created',
        status: 'created',
        timestamp: '2024-01-15T10:00:00.000Z',
      },
      {
        workflowId: 'wf-001',
        type: 'workflow.completed',
        status: 'completed',
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    ];

    const state = projectWorkflowState(events);

    expect(state.status).toBe('completed');
    expect(state.completedAt).toBe('2024-01-15T10:30:00.000Z');
  });

  test('should project workflow.failed event', () => {
    const events: WorkflowEvent[] = [
      {
        workflowId: 'wf-001',
        type: 'workflow.created',
        status: 'created',
        timestamp: '2024-01-15T10:00:00.000Z',
      },
      {
        workflowId: 'wf-001',
        type: 'workflow.failed',
        status: 'failed',
        payload: { error: 'Connection timeout' },
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    ];

    const state = projectWorkflowState(events);

    expect(state.status).toBe('failed');
    expect(state.error).toBe('Connection timeout');
    expect(state.completedAt).toBe('2024-01-15T10:30:00.000Z');
  });

  test('should project workflow.cancelled event', () => {
    const events: WorkflowEvent[] = [
      {
        workflowId: 'wf-001',
        type: 'workflow.created',
        status: 'created',
        timestamp: '2024-01-15T10:00:00.000Z',
      },
      {
        workflowId: 'wf-001',
        type: 'workflow.cancelled',
        status: 'cancelled',
        timestamp: '2024-01-15T10:15:00.000Z',
      },
    ];

    const state = projectWorkflowState(events);

    expect(state.status).toBe('cancelled');
  });

  test('should track steps', () => {
    const events: WorkflowEvent[] = [
      {
        workflowId: 'wf-001',
        type: 'workflow.created',
        status: 'created',
        timestamp: '2024-01-15T10:00:00.000Z',
      },
      {
        workflowId: 'wf-001',
        type: 'task.started',
        status: 'running',
        payload: { stepName: 'step1' },
        timestamp: '2024-01-15T10:05:00.000Z',
      },
      {
        workflowId: 'wf-001',
        type: 'task.completed',
        status: 'running',
        payload: { stepName: 'step1' },
        timestamp: '2024-01-15T10:10:00.000Z',
      },
    ];

    const state = projectWorkflowState(events);

    expect(state.steps).toHaveLength(1);
    expect(state.steps?.[0].name).toBe('step1');
    expect(state.steps?.[0].status).toBe('completed');
  });

  test('should track retry count', () => {
    const events: WorkflowEvent[] = [
      {
        workflowId: 'wf-001',
        type: 'retry.attempts',
        status: 'running',
        payload: { count: 3 },
        timestamp: '2024-01-15T10:00:00.000Z',
      },
    ];

    const state = projectWorkflowState(events);

    expect(state.retryCount).toBe(3);
  });

  test('should compute metrics when requested', () => {
    const events: WorkflowEvent[] = [
      {
        workflowId: 'wf-001',
        type: 'workflow.created',
        status: 'created',
        timestamp: '2024-01-15T10:00:00.000Z',
      },
      {
        workflowId: 'wf-001',
        type: 'task.started',
        status: 'running',
        timestamp: '2024-01-15T10:05:00.000Z',
      },
      {
        workflowId: 'wf-001',
        type: 'workflow.completed',
        status: 'completed',
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    ];

    const state = projectWorkflowState(events, { computeMetrics: true });

    expect(state.metadata._metrics).toBeDefined();
    expect(state.metadata._metrics?.totalEvents).toBe(3);
    expect(state.metadata._metrics?.duration).toBeGreaterThan(0);
  });
});

describe('canTransitionTo', () => {
  test('should allow valid transitions', () => {
    expect(canTransitionTo('created', 'running')).toBe(true);
    expect(canTransitionTo('created', 'cancelled')).toBe(true);
    expect(canTransitionTo('running', 'waiting_approval')).toBe(true);
    expect(canTransitionTo('waiting_approval', 'approved')).toBe(true);
    expect(canTransitionTo('waiting_approval', 'rejected')).toBe(true);
    expect(canTransitionTo('approved', 'running')).toBe(true);
    expect(canTransitionTo('failed', 'running')).toBe(true);
  });

  test('should reject invalid transitions', () => {
    expect(canTransitionTo('completed', 'running')).toBe(false);
    expect(canTransitionTo('cancelled', 'running')).toBe(false);
    expect(canTransitionTo('created', 'completed')).toBe(false);
    expect(canTransitionTo('rejected', 'completed')).toBe(false);
  });
});

describe('getStatusColor', () => {
  test('should return correct colors', () => {
    expect(getStatusColor('created')).toBe('#6b7280');
    expect(getStatusColor('running')).toBe('#3b82f6');
    expect(getStatusColor('waiting_approval')).toBe('#f59e0b');
    expect(getStatusColor('approved')).toBe('#10b981');
    expect(getStatusColor('rejected')).toBe('#ef4444');
    expect(getStatusColor('completed')).toBe('#10b981');
    expect(getStatusColor('failed')).toBe('#ef4444');
    expect(getStatusColor('cancelled')).toBe('#6b7280');
    expect(getStatusColor('paused')).toBe('#8b5cf6');
  });
});

describe('getStatusLabel', () => {
  test('should return correct labels', () => {
    expect(getStatusLabel('created')).toBe('Created');
    expect(getStatusLabel('running')).toBe('Running');
    expect(getStatusLabel('waiting_approval')).toBe('Pending Approval');
    expect(getStatusLabel('approved')).toBe('Approved');
    expect(getStatusLabel('rejected')).toBe('Rejected');
    expect(getStatusLabel('completed')).toBe('Completed');
    expect(getStatusLabel('failed')).toBe('Failed');
    expect(getStatusLabel('cancelled')).toBe('Cancelled');
    expect(getStatusLabel('paused')).toBe('Paused');
  });
});