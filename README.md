# Orchestra Mesh

![CI](https://github.com/Brainfeed-1996/orchestra-mesh/actions/workflows/ci.yml/badge.svg)

Durable distributed workflow engine for event-driven automation, long-running processes, retries, compensation, and human-in-the-loop approvals.

Orchestra Mesh is a reliability-first workflow platform for building automations that keep their state, survive failures, remain inspectable, and tolerate real-world messiness. It is intentionally designed around event history, replayable transitions, and operator visibility so workflows can be trusted even when execution spans hours, days, or multiple systems.

---

## Table of contents

- [Why this exists](#why-this-exists)
- [What this repository demonstrates](#what-this-repository-demonstrates)
- [Problem statement](#problem-statement)
- [Design goals](#design-goals)
- [Non-goals](#non-goals)
- [Architecture](#architecture)
- [Execution model](#execution-model)
- [State and persistence model](#state-and-persistence-model)
- [Failure model](#failure-model)
- [Human approval model](#human-approval-model)
- [Core capabilities](#core-capabilities)
- [API concepts](#api-concepts)
- [Repository structure](#repository-structure)
- [Key technical decisions](#key-technical-decisions)
- [Use cases](#use-cases)
- [Observability and auditability](#observability-and-auditability)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Why this is a high-signal portfolio project](#why-this-is-a-high-signal-portfolio-project)
- [License](#license)

---

## Why this exists

Most automations look simple until they leave the happy path.

A script works fine when:

- every dependency is up
- every API call succeeds
- nothing needs retrying
- no human needs to approve a step
- no state must survive a restart
- nothing needs to be audited later

Real workflows are not like that.

They involve:

- partial failures
- retries and backoff
- duplicate events
- long waits
- operator interventions
- approvals and exceptions
- consistency trade-offs
- forensic questions after something goes wrong

Orchestra Mesh exists to treat workflow orchestration as a distributed systems problem, not as a glorified cron script.

## What this repository demonstrates

This project is shaped to showcase capability in:

- distributed systems design
- workflow engines and execution semantics
- event sourcing and state projection
- reliability and failure handling
- API design for mutation and inspection
- observability and operator tooling
- architectural documentation through ADRs

It is the kind of project that creates strong interview signal for platform, infrastructure, and backend roles.

## Problem statement

Teams building business-critical automation need infrastructure that can answer:

- what is the exact state of this workflow?
- how did it get here?
- what should happen next?
- what happens if the process crashes in the middle?
- how do retries avoid corrupting downstream systems?
- how can an operator approve, reject, or resume work safely?

A durable workflow engine is fundamentally about preserving correctness under imperfect conditions.

## Design goals

### 1. Event history first
The source of truth should be the workflow history, not an opaque mutable blob.

### 2. Replayable state
Current state should be derivable from history so bugs can be investigated and projections can evolve.

### 3. Explicit failure semantics
Retries, backoff, timeout handling, and compensation should be modeled, not improvised.

### 4. Human interaction as a first-class concern
Approvals and manual interventions are part of real automation and should fit the engine naturally.

### 5. Operator visibility
A workflow system without good inspection surfaces becomes impossible to trust in production.

## Non-goals

Orchestra Mesh is not trying to be:

- a full BPMN enterprise suite
- a lightweight task queue only
- an ETL-specific scheduler
- a thin wrapper around cron jobs
- an opaque black-box automation service

It focuses on durable orchestration with strong execution semantics.

## Architecture

```text
client command / API mutation
             |
             v
      workflow command layer
             |
             v
         event append
             |
             v
         event store
             |
    +--------+---------+
    |                  |
    v                  v
state projection   worker dispatch / timers
    |                  |
    v                  v
query surfaces     side-effect execution
    |                  |
    +--------+---------+
             |
             v
    operator actions and approvals
```

### Main components

#### Control plane
Accepts workflow mutations, exposes query endpoints, and provides the operator-facing API surface.

#### Event store
Persists the immutable history of workflow events.

#### State projection
Builds current workflow state from the event stream for fast reads and operational clarity.

#### Worker runtime
Executes side effects, handles asynchronous work, and emits result events back into the history.

#### Approval and intervention layer
Allows humans to inject decisions safely without bypassing the event model.

## Execution model

Orchestra Mesh follows a deliberate loop:

1. a client submits a command
2. the command is validated against the current workflow state
3. one or more events are appended to history
4. the workflow state is projected from those events
5. workers or timers react to runnable work
6. results, failures, or approval decisions generate more events
7. the workflow advances until completion, suspension, or cancellation

This model helps separate intent, history, and side effects.

## State and persistence model

The platform is built around a distinction between:

- **commands**: requested state transitions
- **events**: immutable facts that happened
- **projections**: read-optimized views derived from event history
- **side effects**: external work triggered by state changes

That separation supports:

- reproducible debugging
- safer replay
- versioned projection logic
- richer audit trails
- easier reasoning about concurrency and idempotency

See `docs/persistence.md` and `docs/state-projection.md`.

## Failure model

Failures are not edge cases here. They are part of the design.

The engine is meant to model and eventually support:

- retryable task failures
- terminal task failures
- timeout expiration
- duplicate delivery
- worker crashes
- network partitions
- compensation events
- workflow suspension for manual recovery

The value of the platform is not just that workflows run. It is that they remain understandable when they do not.

## Human approval model

Many workflow systems treat humans as something external glued onto the side.

Orchestra Mesh treats human input as a proper workflow event source. That enables:

- approval gates
- rejection branches
- escalation and reassignment
- audit trails of who approved what and when
- pause/resume semantics without losing determinism

This is important for domains like finance, operations, infrastructure changes, security actions, and customer-facing exception handling.

## Core capabilities

- durable workflow execution
- event-driven orchestration
- replayable state transitions
- retries, backoff, timeout modeling, and compensation hooks
- human approval gates and operator interventions
- pluggable persistence backends
- queryable workflow history and current state
- audit trails and observability-oriented architecture

## API concepts

The API is intended to revolve around a few clear concepts:

- create workflow instance
- append business or system events
- query workflow by id, status, or metadata
- fetch workflow history
- submit approval or rejection decisions
- suspend, resume, or cancel workflows
- inspect runnable tasks and failures

See `docs/api.md` and `docs/mutation-api.md`.

## Repository structure

```text
orchestra-mesh/
  apps/
    control-plane/         # API and operator-facing control surface
    worker-runtime/        # execution worker and task runtime
    data/                  # local development persistence artifacts
  packages/
    event-store/           # append and read primitives for history
    state-machine/         # workflow state transition logic
  docs/
```

## Key technical decisions

### Event-history-first architecture
This improves auditability, debugging, and replay at the cost of more design discipline.

### Mutation API separated from projections
Writers and readers have different concerns. Separating them helps keep the model clean.

### File-backed local store in early phases
A simple store keeps the engine understandable while validating semantics before introducing more complex infrastructure.

### Approval steps modeled as events
This avoids hidden side channels and preserves causality.

## Use cases

### 1. Infrastructure change approvals
Run multi-step rollout workflows with explicit approval gates, retries, and rollback branches.

### 2. Payment or compliance exception handling
Coordinate machine decisions with manual review while keeping a complete audit trail.

### 3. Internal developer platform automation
Provision resources, wait on external systems, and recover cleanly when downstream dependencies fail.

### 4. Security response orchestration
Drive repeatable containment or remediation sequences with stateful checkpoints.

## Observability and auditability

A workflow system should make it easy to answer:

- what happened?
- why did this retry?
- who approved this step?
- what external action was triggered?
- what state did the workflow have before and after the event?

The architecture and docs are written to support those operational questions from the start.

## Documentation

- `docs/architecture.md`
- `docs/execution-model.md`
- `docs/api.md`
- `docs/mutation-api.md`
- `docs/persistence.md`
- `docs/adr-001-event-history-first.md`
- `docs/failure-model.md`
- `docs/state-projection.md`

Subpackage and app docs:

- `apps/control-plane/README.md`
- `apps/worker-runtime/README.md`
- `packages/event-store/README.md`
- `packages/state-machine/README.md`

## Roadmap

### Near term

- workflow query filters and richer inspection views
- approval lifecycle modeling and manual action endpoints
- worker execution simulation and timer primitives
- replay helpers for deterministic debugging
- better failure categorization and operator hints

### Mid term

- storage backend abstraction
- deterministic task scheduling contracts
- richer workflow definition model
- metrics and tracing primitives
- concurrency controls for large workflow fleets

### Long term

- multi-tenant execution partitions
- policy-aware routing and admission control
- visual workflow topology explorer
- formalized compensation strategies for side effects

## Why this is a high-signal portfolio project

Orchestra Mesh is valuable in a portfolio because it shows more than CRUD competence. It demonstrates:

- serious backend architecture thinking
- understanding of distributed systems failure modes
- ability to model state rigorously
- product intuition for operator-facing reliability tools
- the discipline to document difficult trade-offs clearly

That combination plays well for selective employers hiring for platform, infra, SRE-adjacent backend, and systems-heavy engineering roles.

## License

Apache-2.0
