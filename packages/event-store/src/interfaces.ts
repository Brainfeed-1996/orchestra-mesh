export interface WorkflowEvent {
  id?: string;
  workflowId: string;
  type: string;
  status: string;
  payload?: Record<string, unknown>;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface EventStore {
  append(event: Omit<WorkflowEvent, 'timestamp'>): WorkflowEvent;
  listByWorkflow(workflowId: string): WorkflowEvent[];
  getById(eventId: string): WorkflowEvent | undefined;
  all(): WorkflowEvent[];
  count(): number;
  clear(): void;
}

export interface EventStoreOptions {
  filePath?: string;
  autoFlush?: boolean;
  snapshotInterval?: number;
}

export interface Snapshot {
  workflowId: string;
  state: Record<string, unknown>;
  timestamp: string;
  eventCount: number;
}