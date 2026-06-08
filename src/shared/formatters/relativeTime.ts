const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

export const formatRelativeTime = (
  value: string | number | Date,
  now: number | Date = Date.now(),
) => {
  const date = new Date(value);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const nowTimestamp = typeof now === "number" ? now : now.getTime();
  const diffMs = Math.max(0, nowTimestamp - timestamp);

  if (diffMs < HOUR_MS) {
    return `${Math.max(1, Math.round(diffMs / MINUTE_MS))}m ago`;
  }

  if (diffMs < DAY_MS) {
    return `${Math.round(diffMs / HOUR_MS)}h ago`;
  }

  if (diffMs < WEEK_MS) {
    return `${Math.round(diffMs / DAY_MS)}d ago`;
  }

  if (diffMs < MONTH_MS) {
    return `${Math.round(diffMs / WEEK_MS)}w ago`;
  }

  if (diffMs < YEAR_MS) {
    return `${Math.round(diffMs / MONTH_MS)}mo ago`;
  }

  return `${Math.round(diffMs / YEAR_MS)}y ago`;
};
