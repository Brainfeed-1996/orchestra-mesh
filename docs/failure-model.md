# Failure Model

## Expected failure classes

- worker crash
- duplicate task delivery
- partial side effects
- approval timeout
- projection lag
- event persistence failure

## Reliability posture

The system should prefer explicit visibility over silent recovery and should preserve enough history to explain what happened.