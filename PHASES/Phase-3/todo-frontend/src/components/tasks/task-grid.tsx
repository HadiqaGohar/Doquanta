import { TaskItem } from "./task-item";
import { CheckCircle2, ListTodo, Trash2 } from "lucide-react";
import { useTasks } from "@/features/tasks/hooks";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/shared/loading-error-states";
import { Task } from "@/features/tasks/types";

interface TaskGridProps {
  tasks?: Task[];
}

export function TaskGrid({ tasks: filteredTasks }: TaskGridProps) {
  const { tasks, isLoading: loading, isError, error, deleteCompletedTasks } = useTasks();

  // Use filtered tasks if provided, otherwise use all tasks
  const tasksToShow = filteredTasks || tasks || [];

  if (loading) {
    return <LoadingState message="Loading your tasks..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.message || "Failed to load tasks. Please try again."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (tasksToShow.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <ListTodo className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold font-display text-foreground mb-2">
          No tasks found
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm font-body">
          Try adjusting your filters or add a new task.
        </p>
      </div>
    );
  }

  const activeTasks = tasksToShow.filter(t => !t.completed);
  const completedTasks = tasksToShow.filter(t => t.completed);

  const handleClearCompleted = () => {
    if (confirm("Are you sure you want to delete all completed tasks?")) {
      deleteCompletedTasks.mutate();
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Tasks Grid */}
      {activeTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-600" />
            Active Tasks ({activeTasks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <TaskItem task={task} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks Grid */}
      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Completed ({completedTasks.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive h-8 px-3"
              onClick={handleClearCompleted}
              disabled={deleteCompletedTasks.isPending}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear all
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks.map((task) => (
              <div key={task.id} className="opacity-75">
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-md">
                  <TaskItem task={task} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}