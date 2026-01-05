import { TaskPriority, TaskCategory, RecurrencePattern } from "./types";

// Priority configuration
export const priorityConfig = {
  low: { label: "Low", className: "bg-priority-low/10 text-priority-low border-priority-low/20" },
  medium: { label: "Medium", className: "bg-priority-medium/10 text-priority-medium border-priority-medium/20" },
  high: { label: "High", className: "bg-priority-high/10 text-priority-high border-priority-high/20" },
};

export type PriorityConfig = typeof priorityConfig;


// Category configuration
export const categoryConfig = {
  work: { label: "Work", emoji: "💼" },
  personal: { label: "Personal", emoji: "🏠" },
  health: { label: "Health", emoji: "💪" },
  finance: { label: "Finance", emoji: "💰" },
  learning: { label: "Learning", emoji: "📚" },
  other: { label: "Other", emoji: "📌" },
};

export type CategoryConfig = typeof categoryConfig;

// Priority options for selects/dropdowns
export const priorityOptions = [
  { value: "low" as TaskPriority, label: "Low Priority", color: "text-priority-low" },
  { value: "medium" as TaskPriority, label: "Medium Priority", color: "text-priority-medium" },
  { value: "high" as TaskPriority, label: "High Priority", color: "text-priority-high" },
];

// Category options for selects/dropdowns
export const categoryOptions = [
  { value: "work" as TaskCategory, label: "Work", emoji: "💼" },
  { value: "personal" as TaskCategory, label: "Personal", emoji: "🏠" },
  { value: "health" as TaskCategory, label: "Health", emoji: "💪" },
  { value: "finance" as TaskCategory, label: "Finance", emoji: "💰" },
  { value: "learning" as TaskCategory, label: "Learning", emoji: "📚" },
  { value: "other" as TaskCategory, label: "Other", emoji: "📌" },
];

// Status options for filters
export const statusOptions = [
  { value: "all", label: "All Tasks" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

// Sort options for filters
export const sortOptions = [
  { value: "created_at", label: "Date Created" },
  { value: "due_date", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title" },
];

// Recurrence options for task creation/editing
export const recurrenceOptions: { value: RecurrencePattern; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];
