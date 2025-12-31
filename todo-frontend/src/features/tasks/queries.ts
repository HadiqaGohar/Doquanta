"use client";

import { Task, CreateTaskData, UpdateTaskData } from "./types";

// Define filter parameters type
export interface GetTasksFilters {
  keyword?: string;
  completed?: boolean;
  priority?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

// Fetch all tasks for the specified user with optional filters
export const getTasks = async (userId: string, filters?: GetTasksFilters): Promise<{tasks: Task[], count: number}> => {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.completed !== undefined) params.append('completed', String(filters.completed));
    if (filters.priority && filters.priority !== "all") params.append('priority', filters.priority);
    if (filters.category && filters.category !== "all") params.append('category', filters.category);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.skip !== undefined) params.append('skip', String(filters.skip));
    if (filters.limit !== undefined) params.append('limit', String(filters.limit));
  }

  const queryString = params.toString();
  const url = `/api/tasks` + (queryString ? `?${queryString}` : '');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

// Fetch a single task by ID for the specified user
export const getTask = async (userId: string, id: string): Promise<Task> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch task: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Create a new task for the specified user
export const createTask = async (userId: string, taskData: CreateTaskData): Promise<Task> => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Update an existing task for the specified user
export const updateTask = async (userId: string, id: string, taskData: Partial<UpdateTaskData>): Promise<Task> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Delete a task for the specified user
export const deleteTask = async (userId: string, id: string): Promise<void> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.status} ${response.statusText}`);
  }
};

// Delete all completed tasks for the specified user
export const deleteCompletedTasks = async (userId: string): Promise<{message: string, count: number}> => {
  const response = await fetch('/api/tasks/completed/clear', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    throw new Error(`Failed to delete completed tasks: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Toggle task completion status for the specified user
export const toggleTaskCompletion = async (userId: string, id: string, completed: boolean): Promise<Task> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed }),
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    throw new Error(`Failed to toggle task completion: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};
