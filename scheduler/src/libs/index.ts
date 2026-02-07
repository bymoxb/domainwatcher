export function calcDaysLeft(limit: Date): string {
  const now = new Date();
  const diff = limit.getTime() - now.getTime();
  return String(Math.round(diff / (1000 * 60 * 60 * 24)))
}
