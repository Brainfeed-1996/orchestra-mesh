export class SnapshotStore {
  constructor() {
    this.snapshots = new Map();
  }

  save(snapshot) {
    this.snapshots.set(snapshot.workflowId, snapshot);
  }

  load(workflowId) {
    return this.snapshots.get(workflowId);
  }

  delete(workflowId) {
    this.snapshots.delete(workflowId);
  }

  list() {
    return Array.from(this.snapshots.values());
  }
}