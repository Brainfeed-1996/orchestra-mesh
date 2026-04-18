import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';

export class InMemoryEventStore {
  constructor(initialEvents = []) {
    this.events = [...initialEvents];
  }

  append(event) {
    const workflowEvent = {
      ...event,
      id: event.id || uuidv4(),
      timestamp: new Date().toISOString(),
    };
    this.events.push(workflowEvent);
    return workflowEvent;
  }

  listByWorkflow(workflowId) {
    return this.events.filter((e) => e.workflowId === workflowId);
  }

  getById(eventId) {
    return this.events.find((e) => e.id === eventId);
  }

  all() {
    return [...this.events];
  }

  count() {
    return this.events.length;
  }

  clear() {
    this.events = [];
  }

  getEvents() {
    return this.events;
  }
}

export class FileBackedEventStore extends InMemoryEventStore {
  constructor(filePath, options = {}) {
    const initialEvents = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : [];
    super(initialEvents);
    this.filePath = filePath;
    this.autoFlush = options.autoFlush ?? true;
  }

  append(event) {
    const workflowEvent = super.append(event);
    if (this.autoFlush) {
      this.flush();
    }
    return workflowEvent;
  }

  flush() {
    const events = this.getEvents();
    const dir = this.filePath.substring(0, this.filePath.lastIndexOf('/'));
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(events, null, 2), 'utf8');
  }

  getFilePath() {
    return this.filePath;
  }
}

export class CachedEventStore {
  constructor(underlying) {
    this.cache = new Map();
    this.underlying = underlying;
  }

  append(event) {
    const result = this.underlying.append(event);
    this.invalidateCache(event.workflowId);
    return result;
  }

  listByWorkflow(workflowId) {
    if (!this.cache.has(workflowId)) {
      this.cache.set(workflowId, this.underlying.listByWorkflow(workflowId));
    }
    return this.cache.get(workflowId) || [];
  }

  getById(eventId) {
    return this.underlying.getById(eventId);
  }

  all() {
    return this.underlying.all();
  }

  count() {
    return this.underlying.count();
  }

  clear() {
    this.underlying.clear();
    this.cache.clear();
  }

  invalidateCache(workflowId) {
    this.cache.delete(workflowId);
  }
}