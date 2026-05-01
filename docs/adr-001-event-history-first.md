# ADR-001: Treat workflow history as the source of truth

## Status
Accepted

## Context

Workflow systems that update mutable state directly often make debugging, replay, and auditability much harder.

## Decision

Use append-oriented workflow history as the authoritative substrate, with derived state views built from that history.

## Consequences

### Positive

- better auditability
- cleaner replay and debugging
- improved failure analysis

### Negative

- requires projection logic
- can increase implementation complexity in the beginning
