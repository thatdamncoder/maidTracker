import { z } from "zod";

export const createMaidSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  salary: z.number().positive().optional(),
  max_leaves: z.number().int().min(0).max(31).optional(),
  joined_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional(),
});

export type CreateMaidInput = z.infer<typeof createMaidSchema>;


export const updateMaidSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  salary: z.number().positive().optional(),
  max_leaves: z.number().int().min(0).max(31).optional(),
  is_active: z.boolean().optional(),
  joined_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type UpdateMaidInput = z.infer<typeof updateMaidSchema>;
