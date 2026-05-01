import fs from 'node:fs';

export class InMemoryEventStore {
  constructor(initialEvents = []) {
    this.events = [...initialEvents];
  }

  append(event) {
    this.events.push({
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    });
  }

  listByWorkflow(workflowId) {
    return this.events.filter((event) => event.workflowId === workflowId);
  }

  all() {
    return [...this.events];
  }
}

export class FileBackedEventStore extends InMemoryEventStore {
  constructor(filePath) {
    const initialEvents = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : [];
    super(initialEvents);
    this.filePath = filePath;
  }

  append(event) {
    super.append(event);
    fs.writeFileSync(this.filePath, JSON.stringify(this.events, null, 2));
  }
}
