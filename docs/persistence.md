# Persistence

## Current model

The MVP now supports file-backed event persistence using a JSON event log on disk.

## Goal

Preserve workflow history across restarts while keeping the implementation simple enough for rapid prototyping.

## Next steps

- storage abstraction for alternate backends
- snapshots for large histories
- append safety and concurrency controls
