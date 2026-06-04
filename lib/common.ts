export function getTimeRange(rangeMs: number) {
  const now = new Date();
  return {
    start: new Date(now.getTime() - rangeMs),
    end: now,
  };
}