# Architecture

## Overview

Orchestra Mesh is designed for durable execution and audit-friendly workflow orchestration.

## Main components

- workflow definition API
- scheduler
- dispatcher
- worker runtime
- event store
- state projection layer
- approval subsystem
- observability stack

## Reliability principles

- append-only workflow history
- idempotent task handling
- explicit retries and compensation
- deterministic replay where possible
- separation between command intent and state transitions
