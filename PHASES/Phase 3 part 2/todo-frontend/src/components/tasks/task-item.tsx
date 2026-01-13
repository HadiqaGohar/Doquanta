'use client';

import { Task } from "@/features/tasks/types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2Icon,
  Edit3Icon,
  CalendarIcon,
  ClockIcon,
  FlagIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/shadcn";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { useTasks } from "@/features/tasks/hooks";
import { useState, useEffect } from "react";
import { EditTaskDialog } from "./edit-task-dialog";
import { priorityConfig, categoryConfig } from "@/features/tasks/config";
import toast from "react-hot-toast";

interface TaskItemProps {
  task: Task;
  onToggle?: (taskId: string, completed: boolean) => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const { deleteTask, toggleTaskCompletion } = useTasks();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const category = categoryConfig[task.category as keyof typeof categoryConfig] || categoryConfig.other;
  const CategoryIcon = category.icon;

  const formatDueDate = (dateString: string) => {
    if (!mounted) return ""; // Prevent SSR mismatch
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const formatReminderTime = (dateString: string) => {
    if (!mounted) return "";
    return format(new Date(dateString), "h:mm a");
  };

  const isOverdue = task.due_date && !task.completed && isPast(new Date(task.due_date));

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask.mutateAsync({ id: task.id });
        toast.success("Task deleted successfully");
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const handleToggleCompletion = async (checked: boolean) => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      const isCompleted = checked;
      console.log(`DEBUG: Toggling task ${task.id} to ${isCompleted}`);
      
      await toggleTaskCompletion.mutateAsync({ id: task.id, completed: isCompleted });
      
      if (onToggle) onToggle(task.id, isCompleted);
      
      if (isCompleted) {
        toast.success("Task marked as completed! 🎉");
      } else {
        toast.success("Task marked as pending");
      }
    } catch (error: any) {
      console.error("Toggle Error:", error);
      toast.error(`Error: ${error.message || "Failed to update task status"}`);
    } finally {
      setIsToggling(false);
    }
  };

  return (<>
    <div
      className={cn(
        "group flex items-start gap-4 p-4 rounded-xl bg-card border transition-all duration-200",
        "hover:shadow-card hover:border-accent/20",
        task.completed && "opacity-60 bg-gray-50"
      )}
    >
      {/* Switch / Loading Spinner */}
      <div className="pt-1 flex items-center justify-center relative">
        {isToggling ? (
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        ) : (
          <Switch
            checked={task.completed}
            onCheckedChange={handleToggleCompletion}
            className="data-[state=checked]:bg-accent"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-medium text-foreground font-body leading-tight transition-all duration-200",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>

          {/* Actions - visible on hover or mobile */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="h-8 w-8 text-muted-foreground hover:text-accent-foreground hover:bg-accent/10"
              onClick={handleEdit}
              title="Edit Task"
            >
              <Edit3Icon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              title="Delete Task"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 font-body">
            {task.description}
          </p>
        )}

        {/* Tags & Meta */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Category */}
          <span className="flex items-center text-sm text-muted-foreground gap-1">
            <CategoryIcon className="h-4 w-4" />
            {category.label}
          </span>

          {/* Priority */}
          <Badge variant="outline" className={cn("text-xs border px-2 py-0.5", priority.className)}>
            <FlagIcon className="h-3 w-3 mr-1" />
            {priority.label}
          </Badge>

          {/* Due Date */}
          {task.due_date && mounted && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-2 py-0.5",
                isOverdue 
                  ? "border-destructive/20 bg-destructive/10 text-destructive" 
                  : "border-gray-200 bg-gray-50 text-gray-600"
              )}
            >
              <CalendarIcon className="h-3 w-3 mr-1" />
              {formatDueDate(task.due_date)}
            </Badge>
          )}

          {/* Reminder Time (Alarm) */}
          {task.reminder_time && mounted && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-blue-200 bg-blue-50 text-blue-600">
              <ClockIcon className="h-3 w-3 mr-1" />
              {formatReminderTime(task.reminder_time)}
            </Badge>
          )}

          {/* Recurrence */}
          {task.is_recurring && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              <ClockIcon className="h-3 w-3 mr-1" />
              {task.recurrence_pattern}
            </Badge>
          )}
        </div>
      </div>
    </div>

    {/* Edit Task Dialog */}
    <EditTaskDialog
      task={task}
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
    />
  </>);
}
