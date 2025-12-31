'use client';

import { Task } from "@/features/tasks/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2Icon,
  Edit3Icon,
  CalendarIcon,
  ClockIcon,
  FlagIcon,
  MoreVerticalIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils/shadcn";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { useTasks } from "@/features/tasks/hooks";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useState } from "react";
import { EditTaskDialog } from "./edit-task-dialog";
import { priorityConfig, categoryConfig } from "@/features/tasks/config";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { updateTask, deleteTask, toggleTaskCompletion } = useTasks();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const category = categoryConfig[task.category as keyof typeof categoryConfig] || categoryConfig.other;

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const isOverdue = task.due_date && !task.completed && isPast(new Date(task.due_date));

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    deleteTask.mutateAsync({ id: task.id });
  };

  const handleToggleCompletion = (checked: CheckedState) => {
    toggleTaskCompletion.mutateAsync({ id: task.id, completed: Boolean(checked) });
  };

  return (<>
    <div
      className={cn(
        "group flex items-start gap-4 p-4 rounded-xl bg-card border transition-all duration-200",
        "hover:shadow-card hover:border-accent/20",
        task.completed && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <div className="pt-0.5">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleCompletion}
          className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-medium text-foreground font-body leading-tight",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>

          {/* Actions - visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit3Icon className="h-4 w-4 mr-2 text-accent-foreground" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2Icon className="h-4 w-4 mr-2 text-destructive" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <span className="text-sm">
            {category.emoji} {category.label}
          </span>

          {/* Priority */}
          <Badge variant="outline" className={cn("text-xs border", priority.className)}>
            <FlagIcon className="h-3 w-3 mr-1" />
            {priority.label}
          </Badge>

          {/* Due Date */}
          {task.due_date && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                isOverdue && "border-destructive/20 bg-destructive/10 text-destructive"
              )}
            >
              <CalendarIcon className="h-3 w-3 mr-1" />
              {formatDueDate(task.due_date)}
            </Badge>
          )}

          {/* Recurrence */}
          {task.is_recurring && (
            <Badge variant="outline" className="text-xs">
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
