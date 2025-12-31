export type TaskPriority = "low" | "medium" | "high";
export type TaskCategory = "work" | "personal" | "health" | "finance" | "learning" | "other";
export type RecurrencePattern = "none" | "daily" | "weekly" | "monthly" | "yearly";


export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  user_id: string;
  priority: TaskPriority;
  category: TaskCategory;
  created_at: string;
  updated_at: string;
  due_date?: string | null;
  reminder_time?: string | null;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number | null;
  recurrence_end_date?: string | null;
  max_occurrences?: number | null;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  due_date?: Date | null;
  reminder_time?: Date | null;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number | null;
  recurrence_end_date?: Date | null;
  max_occurrences?: number | null;
}

export interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
  due_date?: Date | null;
  reminder_time?: Date | null;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number | null;
  recurrence_end_date?: Date | null;
  max_occurrences?: number | null;
}
