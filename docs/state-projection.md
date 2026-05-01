# State Projection

## Principle

Workflow state is not stored as the primary truth. It is projected from workflow history.

## MVP rule

Use a simple deterministic reducer to derive the current workflow state from recorded events.
