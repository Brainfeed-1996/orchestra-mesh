export function projectWorkflowState(events) {
  return events.reduce(
    (state, event) => ({
      ...state,
      lastEventType: event.type,
      status: event.status || state.status
    }),
    { status: 'created', lastEventType: null }
  );
}
