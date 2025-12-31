import z from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]).optional().or(z.literal("medium")),
  category: z.enum(["work", "personal", "health", "finance", "learning", "other"]).optional().or(z.literal("personal")),
  due_date: z.date().optional().nullable(),
  reminder_time: z.date().optional().nullable(),
  is_recurring: z.boolean(),
  recurrence_pattern: z.enum(["none", "daily", "weekly", "monthly", "yearly"]).optional().nullable(),
  recurrence_interval: z.number().min(1).optional().nullable(),
  recurrence_end_date: z.date().optional().nullable(),
  max_occurrences: z.number().min(1).optional().nullable(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
