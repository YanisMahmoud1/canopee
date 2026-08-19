import { startOfWeek, format, parseISO, getDay } from "date-fns";

export const ISO_FORMAT = "yyyy-MM-dd";

export function todayStr(): string {
  return format(new Date(), ISO_FORMAT);
}

export function toDateStr(d: Date): string {
  return format(d, ISO_FORMAT);
}

export function parseDateStr(s: string): Date {
  return parseISO(s);
}

/** 0=Sunday..6=Saturday, matching HabitItem.specificDays convention */
export function weekdayOf(dateStr: string): number {
  return getDay(parseDateStr(dateStr));
}

/** Monday-start ISO week bucket key for a given date string */
export function weekStartStr(dateStr: string): string {
  return toDateStr(startOfWeek(parseDateStr(dateStr), { weekStartsOn: 1 }));
}
