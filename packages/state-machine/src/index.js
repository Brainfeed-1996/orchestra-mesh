export function projectWorkflowState(events, options = {}) {
  if (events.length === 0) {
    return createInitialState();
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let state = createInitialState();

  for (const event of sortedEvents) {
    state = applyEvent(state, event);
  }

  if (options.computeMetrics) {
    state.metadata._metrics = computeMetrics(sortedEvents, state);
  }

  return state;
}

function createInitialState() {
  return {
    status: 'created',
    lastEventType: null,
    lastEventTimestamp: null,
    startedAt: null,
    completedAt: null,
    metadata: {},
    steps: [],
    retryCount: 0,
  };
}

function applyEvent(state, event) {
  const newState = {
    ...state,
    lastEventType: event.type,
    lastEventTimestamp: event.timestamp,
    metadata: {
      ...state.metadata,
      ...event.metadata,
    },
  };

  if (event.status) {
    newState.status = event.status;
  }

  switch (event.type) {
    case 'workflow.created':
      newState.startedAt = event.timestamp;
      break;
    case 'task.started':
      newState.status = 'running';
      newState.currentStep = event.payload?.stepName;
      break;
    case 'task.completed':
      addOrUpdateStep(newState, event.payload?.stepName, 'completed', event.timestamp);
      break;
    case 'task.failed':
      addOrUpdateStep(newState, event.payload?.stepName, 'failed', event.timestamp, event.payload?.error);
      newState.status = 'failed';
      newState.error = event.payload?.error;
      break;
    case 'approval.requested':
      newState.status = 'waiting_approval';
      break;
    case 'approval.approved':
      newState.status = 'approved';
      break;
    case 'approval.rejected':
      newState.status = 'rejected';
      newState.error = event.payload?.reason;
      break;
    case 'workflow.completed':
      newState.status = 'completed';
      newState.completedAt = event.timestamp;
      break;
    case 'workflow.failed':
      newState.status = 'failed';
      newState.completedAt = event.timestamp;
      newState.error = event.payload?.error;
      break;
    case 'workflow.cancelled':
      newState.status = 'cancelled';
      newState.completedAt = event.timestamp;
      break;
    case 'workflow.paused':
      newState.status = 'paused';
      break;
    case 'workflow.resumed':
      newState.status = 'running';
      break;
    case 'retry.attempts':
      newState.retryCount = event.payload?.count || state.retryCount + 1;
      break;
  }

  return newState;
}

function addOrUpdateStep(state, stepName, status, timestamp, error) {
  if (!state.steps) {
    state.steps = [];
  }

  const existingStep = state.steps.find((s) => s.name === stepName);

  if (existingStep) {
    existingStep.status = status;
    existingStep.completedAt = timestamp;
    if (error) {
      existingStep.error = error;
    }
  } else {
    state.steps.push({
      name: stepName,
      status,
      startedAt: timestamp,
      completedAt: timestamp,
      error,
    });
  }
}

function computeMetrics(events, state) {
  const startTime = events.length > 0 ? new Date(events[0].timestamp).getTime() : 0;
  const endTime = state.completedAt ? new Date(state.completedAt).getTime() : Date.now();

  return {
    totalEvents: events.length,
    duration: endTime - startTime,
    stepCount: state.steps?.length || 0,
    retryCount: state.retryCount || 0,
    statusTransitions: countStatusTransitions(events),
  };
}

function countStatusTransitions(events) {
  let transitions = 0;
  let previousStatus = null;

  for (const event of events) {
    if (event.status && event.status !== previousStatus) {
      transitions++;
      previousStatus = event.status;
    }
  }

  return transitions;
}

export function canTransitionTo(currentStatus, targetStatus) {
  const allowedTransitions = {
    created: ['running', 'cancelled'],
    running: ['waiting_approval', 'completed', 'failed', 'paused', 'cancelled'],
    waiting_approval: ['approved', 'rejected', 'cancelled'],
    approved: ['running', 'completed', 'cancelled'],
    rejected: ['running', 'cancelled'],
    completed: [],
    failed: ['running', 'cancelled'],
    cancelled: [],
    paused: ['running', 'cancelled'],
    suspended: ['running', 'cancelled'],
  };

  return allowedTransitions[currentStatus]?.includes(targetStatus) ?? false;
}

export function getStatusColor(status) {
  const colors = {
    created: '#6b7280',
    running: '#3b82f6',
    waiting_approval: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    completed: '#10b981',
    failed: '#ef4444',
    cancelled: '#6b7280',
    paused: '#8b5cf6',
    suspended: '#6b7280',
  };

  return colors[status] || '#6b7280';
}

export function getStatusLabel(status) {
  const labels = {
    created: 'Created',
    running: 'Running',
    waiting_approval: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    paused: 'Paused',
    suspended: 'Suspended',
  };

  return labels[status] || status;
}