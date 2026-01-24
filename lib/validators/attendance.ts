import { z } from "zod";

export const markAttendanceSchema = z.object({
  day: z.number().min(1).max(31),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
  status: z.enum(["present", "absent", "unmark"]),
  note: z.string().max(255).optional() || null,
});


export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
