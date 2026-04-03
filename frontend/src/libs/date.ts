export function calcDaysLeft(limit: Date | string | null | undefined): number {
  if (!limit) return 0;
  try {
    if (typeof limit == "string") {
      limit = new Date(limit);
    }
    const now = new Date();
    const diff = limit.getTime() - now.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
}

export function safeDateString(
  date: undefined | Date | string | null | number
): string {
  if (!date) return "";

  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    return "";
  }
}
