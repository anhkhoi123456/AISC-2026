// Local mock services do not need a simulated network round trip.
// Keep explicit delays for flows that intentionally demonstrate processing.
export const delay = (ms = 0): Promise<void> =>
  ms > 0
    ? new Promise<void>((resolve) => setTimeout(resolve, ms))
    : Promise.resolve();
