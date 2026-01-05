"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useUser } from '../auth/hooks';
import { CreateTaskData, UpdateTaskData, Task } from './types';
import {
  getTasks as getTasksAPI,
  getTask as getTaskAPI,
  createTask as createTaskAPI,
  updateTask as updateTaskAPI,
  deleteTask as deleteTaskAPI,
  deleteCompletedTasks as deleteCompletedTasksAPI,
  toggleTaskCompletion as toggleTaskCompletionAPI,
  GetTasksFilters
} from './queries';

// Define filter options type
interface FilterOptions {
  status: string;
  priority: string;
  category: string;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const useTasks = (initialBackendFilters?: GetTasksFilters) => {
  const queryClient = useQueryClient();
  const { user, isLoading: isUserLoading } = useUser();

  // Local filtering state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: "all",
    priority: "all",
    category: "all",
    search: "",
    sortBy: "created_at",
    sortOrder: "desc"
  });

  // Combine initial backend filters with local filter options for API calls
  const combinedFilters = {
    ...initialBackendFilters,
    keyword: filterOptions.search || initialBackendFilters?.keyword,
    completed: filterOptions.status === "all" ? initialBackendFilters?.completed :
               filterOptions.status === "active" ? false :
               filterOptions.status === "completed" ? true : initialBackendFilters?.completed,
    priority: filterOptions.priority === "all" ? initialBackendFilters?.priority : filterOptions.priority,
    category: filterOptions.category === "all" ? initialBackendFilters?.category : filterOptions.category,
  };

  // Fetch all tasks
  const fetchTasks = useQuery({
    queryKey: ['tasks', combinedFilters], // Include combined filters in the query key so it refetches when filters change
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return await getTasksAPI(user.id, combinedFilters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user?.id, // Only enabled when user is authenticated
  });

  // Create a new task
  const addTask = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return await createTaskAPI(user.id, taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Update an existing task
  const updateTask = useMutation({
    mutationFn: async ({ id, ...taskData }: { id: string } & Partial<UpdateTaskData>) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return await updateTaskAPI(user.id, id, taskData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    },
  });

  // Delete a task
  const deleteTask = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return await deleteTaskAPI(user.id, id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables] });
    },
  });

  // Delete all completed tasks
  const deleteCompletedTasksMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return await deleteCompletedTasksAPI(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Toggle task completion
  const toggleTaskCompletion = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return await toggleTaskCompletionAPI(user.id, id, completed);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    },
  });

  // Apply local filtering and sorting to tasks
  const allTasks = fetchTasks.data || [];

  // Since the backend handles filtering via combinedFilters, we don't need additional local filtering
  // The allTasks from the backend should already be filtered according to our parameters
  const filteredTasks = allTasks;

  // Sort tasks based on filter options
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue, bValue;

    switch (filterOptions.sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
        break;
      case 'due_date':
        aValue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        bValue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        break;
      case 'priority':
        // Define priority order: high > medium > low
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
        break;
      default:
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
    }

    if (filterOptions.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Update filters function
  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Reset filters to default
  const resetFilters = () => {
    setFilterOptions({
      status: "all",
      priority: "all",
      category: "all",
      search: "",
      sortBy: "created_at",
      sortOrder: "desc"
    });
  };

  // Calculate stats based on the tasks returned from backend (which are already filtered)
  // Note: These stats reflect the backend-filtered results, not the full dataset
  const stats = {
    total: sortedTasks.length,
    active: sortedTasks.filter(t => !t.completed).length,
    completed: sortedTasks.filter(t => t.completed).length,
    overdue: sortedTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && !t.completed).length
  };

  return {
    tasks: sortedTasks,
    allTasks: allTasks,
    stats,
    isLoading: fetchTasks.isLoading || isUserLoading,
    isError: fetchTasks.isError,
    error: fetchTasks.error,
    refetch: fetchTasks.refetch,
    addTask,
    updateTask,
    deleteTask,
    deleteCompletedTasks: deleteCompletedTasksMutation,
    toggleTaskCompletion,
    filters: filterOptions,
    updateFilters,
    resetFilters
  };
};

export const useTask = (id: string) => {
  const { user } = useUser();

  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return await getTaskAPI(user.id, id);
    },
    enabled: !!id && !!user?.id, // Only enabled when ID is provided and user is authenticated
  });
};