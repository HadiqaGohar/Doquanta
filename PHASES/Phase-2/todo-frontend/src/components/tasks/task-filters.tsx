import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { TaskPriority, TaskCategory } from "@/features/tasks/types";
import { statusOptions, priorityOptions, categoryOptions, sortOptions } from "@/features/tasks/config";
import { useTasks } from "@/features/tasks/hooks";

export function TaskFilters() {
  const { filters, updateFilters, resetFilters } = useTasks();

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all" ||
    filters.search;

  const clearFilters = () => {
    resetFilters();
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => updateFilters({ search: "" })}
          >
            <XIcon className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <SlidersHorizontalIcon className="h-4 w-4" />
          <span className="font-body">Filters:</span>
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => updateFilters({ status: value as typeof filters.status })}
        >
          <SelectTrigger className="w-auto h-8 text-xs gap-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority}
          onValueChange={(value) => updateFilters({ priority: value as TaskPriority | "all" })}
        >
          <SelectTrigger className="w-auto h-8 text-xs gap-1">
            <SelectValue>Priority</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.category}
          onValueChange={(value) => updateFilters({ category: value as TaskCategory | "all" })}
        >
          <SelectTrigger className="w-auto h-8 text-xs gap-1">
            <SelectValue>Category</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilters({ sortBy: value as typeof filters.sortBy })}
        >
          <SelectTrigger className="w-auto h-8 text-xs gap-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                Sort by: {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Order Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => updateFilters({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })}
        >
          {filters.sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={clearFilters}
          >
            <XIcon className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
