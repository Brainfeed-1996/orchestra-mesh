# Execution Model

## Concept

A workflow is a durable state machine backed by an event history.

## Lifecycle

1. workflow submitted
2. steps scheduled
3. tasks dispatched
4. results recorded
5. retries or compensation triggered when needed
6. approval gates pause and resume execution
7. workflow completes or fails terminally

## Design goals

- survive crashes and restarts
- preserve operator visibility
- support long-running tasks
- avoid hidden side effects
