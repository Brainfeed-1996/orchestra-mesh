import {
  InMemoryEventStore,
  FileBackedEventStore,
  CachedEventStore,
  type WorkflowEvent,
} from '../src/index.js';

describe('InMemoryEventStore', () => {
  let store: InMemoryEventStore;

  beforeEach(() => {
    store = new InMemoryEventStore();
  });

  test('should append events with generated timestamp', () => {
    const event = store.append({
      workflowId: 'wf-001',
      type: 'workflow.created',
      status: 'created',
    });

    expect(event.workflowId).toBe('wf-001');
    expect(event.type).toBe('workflow.created');
    expect(event.status).toBe('created');
    expect(event.timestamp).toBeDefined();
    expect(event.id).toBeDefined();
  });

  test('should append events with custom id', () => {
    const event = store.append({
      id: 'custom-id',
      workflowId: 'wf-001',
      type: 'workflow.created',
      status: 'created',
    });

    expect(event.id).toBe('custom-id');
  });

  test('should list events by workflow id', () => {
    store.append({ workflowId: 'wf-001', type: 'event1', status: 'created' });
    store.append({ workflowId: 'wf-001', type: 'event2', status: 'running' });
    store.append({ workflowId: 'wf-002', type: 'event3', status: 'created' });

    const events = store.listByWorkflow('wf-001');

    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('event1');
    expect(events[1].type).toBe('event2');
  });

  test('should return all events', () => {
    store.append({ workflowId: 'wf-001', type: 'event1', status: 'created' });
    store.append({ workflowId: 'wf-002', type: 'event2', status: 'created' });

    const all = store.all();

    expect(all).toHaveLength(2);
  });

  test('should count events', () => {
    store.append({ workflowId: 'wf-001', type: 'event1', status: 'created' });
    store.append({ workflowId: 'wf-002', type: 'event2', status: 'created' });

    expect(store.count()).toBe(2);
  });

  test('should clear all events', () => {
    store.append({ workflowId: 'wf-001', type: 'event1', status: 'created' });
    store.clear();

    expect(store.count()).toBe(0);
  });

  test('should get event by id', () => {
    const event = store.append({
      id: 'test-id',
      workflowId: 'wf-001',
      type: 'event1',
      status: 'created',
    });

    const found = store.getById('test-id');

    expect(found).toBeDefined();
    expect(found?.id).toBe(event.id);
  });

  test('should return undefined for non-existent event id', () => {
    const found = store.getById('non-existent');

    expect(found).toBeUndefined();
  });
});

describe('CachedEventStore', () => {
  let store: CachedEventStore;
  let underlying: InMemoryEventStore;

  beforeEach(() => {
    underlying = new InMemoryEventStore();
    store = new CachedEventStore(underlying);
  });

  test('should cache events after first retrieval', () => {
    store.append({ workflowId: 'wf-001', type: 'event1', status: 'created' });

    store.listByWorkflow('wf-001');
    store.listByWorkflow('wf-001');

    const events = store.listByWorkflow('wf-001');

    expect(events).toHaveLength(1);
  });

  test('should invalidate cache on append', () => {
    store.append({ workflowId: 'wf-001', type: 'event1', status: 'created' });

    store.listByWorkflow('wf-001');
    store.append({ workflowId: 'wf-001', type: 'event2', status: 'running' });

    const events = store.listByWorkflow('wf-001');

    expect(events).toHaveLength(2);
  });
});