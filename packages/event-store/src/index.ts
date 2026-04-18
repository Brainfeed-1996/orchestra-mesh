import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import type {
  WorkflowEvent,
  EventStore,
  EventStoreOptions,
  Snapshot,
} from './interfaces.js';

export { type WorkflowEvent, type EventStore, type EventStoreOptions, type Snapshot };

export class InMemoryEventStore implements EventStore {
  private events: WorkflowEvent[] = [];

  constructor(initialEvents: WorkflowEvent[] = []) {
    this.events = [...initialEvents];
  }

  append(event: Omit<WorkflowEvent, 'timestamp'>): WorkflowEvent {
    const workflowEvent: WorkflowEvent = {
      ...event,
      id: event.id || uuidv4(),
      timestamp: new Date().toISOString(),
    };
    this.events.push(workflowEvent);
    return workflowEvent;
  }

  listByWorkflow(workflowId: string): WorkflowEvent[] {
    return this.events.filter((event) => event.workflowId === workflowId);
  }

  getById(eventId: string): WorkflowEvent | undefined {
    return this.events.find((event) => event.id === eventId);
  }

  all(): WorkflowEvent[] {
    return [...this.events];
  }

  count(): number {
    return this.events.length;
  }

  clear(): void {
    this.events = [];
  }

  getEvents(): WorkflowEvent[] {
    return this.events;
  }
}

export class FileBackedEventStore extends InMemoryEventStore {
  private readonly filePath: string;
  private readonly autoFlush: boolean;

  constructor(filePath: string, options: EventStoreOptions = {}) {
    const initialEvents = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : [];
    super(initialEvents);
    this.filePath = filePath;
    this.autoFlush = options.autoFlush ?? true;
  }

  append(event: Omit<WorkflowEvent, 'timestamp'>): WorkflowEvent {
    const workflowEvent = super.append(event);
    if (this.autoFlush) {
      this.flush();
    }
    return workflowEvent;
  }

  flush(): void {
    const events = this.getEvents();
    const dir = this.filePath.substring(0, this.filePath.lastIndexOf('/'));
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(events, null, 2), 'utf8');
  }

  getFilePath(): string {
    return this.filePath;
  }
}

export class PartitionedEventStore extends FileBackedEventStore {
  private readonly partitionSize: number;
  private currentPartition: number = 0;

  constructor(filePath: string, partitionSize: number = 1000) {
    super(filePath);
    this.partitionSize = partitionSize;
  }

  getCurrentPartition(): number {
    return this.currentPartition;
  }

  getPartitionFilePath(partition: number): string {
    const basePath = this.getFilePath().replace('.json', '');
    return `${basePath}-partition-${partition}.json`;
  }
}

export class SnapshotStore {
  private snapshots: Map<string, Snapshot> = new Map();

  save(snapshot: Snapshot): void {
    this.snapshots.set(snapshot.workflowId, snapshot);
  }

  load(workflowId: string): Snapshot | undefined {
    return this.snapshots.get(workflowId);
  }

  delete(workflowId: string): void {
    this.snapshots.delete(workflowId);
  }

  list(): Snapshot[] {
    return Array.from(this.snapshots.values());
  }
}

export class CachedEventStore implements EventStore {
  private cache: Map<string, WorkflowEvent[]> = new Map();
  private underlying: EventStore;

  constructor(underlying: EventStore) {
    this.underlying = underlying;
  }

  append(event: Omit<WorkflowEvent, 'timestamp'>): WorkflowEvent {
    const result = this.underlying.append(event);
    this.invalidateCache(event.workflowId);
    return result;
  }

  listByWorkflow(workflowId: string): WorkflowEvent[] {
    if (!this.cache.has(workflowId)) {
      this.cache.set(workflowId, this.underlying.listByWorkflow(workflowId));
    }
    return this.cache.get(workflowId) || [];
  }

  getById(eventId: string): WorkflowEvent | undefined {
    return this.underlying.getById(eventId);
  }

  all(): WorkflowEvent[] {
    return this.underlying.all();
  }

  count(): number {
    return this.underlying.count();
  }

  clear(): void {
    this.underlying.clear();
    this.cache.clear();
  }

  private invalidateCache(workflowId: string): void {
    this.cache.delete(workflowId);
  }
}