"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CalendarIcon, 
  FlagIcon, 
  ClockIcon, 
  Edit3Icon, 
  SaveIcon, 
  XIcon,
  ArrowLeftIcon,
  Trash2Icon
} from "lucide-react";
import { useTask, useTasks } from "@/features/tasks/hooks";
import { priorityConfig, categoryConfig } from "@/features/tasks/config";
import { format } from "date-fns";

export default function TaskDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const taskId = (Array.isArray(id) ? id[0] : id) || "";

  const { data: task, isLoading, error } = useTask(taskId);
  const { updateTask, deleteTask, toggleTaskCompletion } = useTasks();
  
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [completed, setCompleted] = useState(task?.completed || false);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading task...</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Loading task details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Task Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The requested task could not be found.</p>
              <Button 
                onClick={() => router.push('/dashboard/tasks')}
                className="mt-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const category = categoryConfig[task.category as keyof typeof categoryConfig] || categoryConfig.other;

  const handleSave = async () => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        title,
        description,
        completed
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form values to original task values
    setTitle(task.title);
    setDescription(task.description || "");
    setCompleted(task.completed);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask.mutateAsync({ id: task.id });
        router.push('/dashboard/tasks');
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleToggleCompletion = async (checked: boolean) => {
    const newCompleted = Boolean(checked);
    setCompleted(newCompleted);
    
    try {
      await toggleTaskCompletion.mutateAsync({
        id: task.id,
        completed: newCompleted
      });
    } catch (error) {
      console.error("Error updating task completion:", error);
      setCompleted(!newCompleted); // Revert on error
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/tasks')}
            className="mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <XIcon className="h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <SaveIcon className="h-4 w-4" />
                  Save
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit3Icon className="h-4 w-4" />
                Edit Task
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="completed"
                    checked={completed}
                    onCheckedChange={handleToggleCompletion}
                  />
                  <Label htmlFor="completed">Mark as completed</Label>
                </div>
              </div>
            ) : (
              <>
                <CardTitle className="flex items-start justify-between">
                  <span className={completed ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={priority.className}>
                      <FlagIcon className="h-3 w-3 mr-1" />
                      {priority.label}
                    </Badge>
                    <Badge variant="outline">
                      {category.emoji} {category.label}
                    </Badge>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="completed"
                    checked={completed}
                    onCheckedChange={handleToggleCompletion}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="completed">Mark as completed</Label>
                </div>
              </>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              task.description && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )
            )}

            {/* Task Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Created</h4>
                <p className="text-sm">
                  {format(new Date(task.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              
              {task.due_date && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Due Date</h4>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(task.due_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              )}
              
              {task.is_recurring && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Recurrence</h4>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{task.recurrence_pattern}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons when not editing */}
            {!isEditing && (
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2Icon className="h-4 w-4" />
                  Delete Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}