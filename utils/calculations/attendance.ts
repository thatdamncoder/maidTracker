export type DayAttendance =
  | { day: number; marked: false }
  | { day: number; marked: true; status: "present" | "absent" };

export function decodeAttendanceBits(
  attendanceBits: string,
  markedBits: string
): {
  days: DayAttendance[];
  lastMarkedDay: number | null;
} {
  const days: DayAttendance[] = [];
  let lastMarkedDay: number | null = null;

  for (let i = 0; i < 31; i++) {
    const marked = markedBits[i] === "1";

    if (!marked) {
      days.push({ day: i + 1, marked: false });
      continue;
    }

    lastMarkedDay = i + 1;

    days.push({
      day: i + 1,
      marked: true,
      status: attendanceBits[i] === "1" ? "present" : "absent",
    });
  }

  return { days, lastMarkedDay };
}
