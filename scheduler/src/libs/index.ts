export function calcDaysLeft(limit: Date): number {
  const now = new Date();
  const diff = limit.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
