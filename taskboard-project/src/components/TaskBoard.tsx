import { useState, useEffect } from "react";
import { TaskList } from "./TaskList";
import { apiClient, Task } from "../api/apiClient";

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getTasks();
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Handle checkbox toggle for a single task
  const handleTaskSelect = (id: string, selected: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (selected) {
      newSelectedIds.add(id);
    } else {
      newSelectedIds.delete(id);
    }
    setSelectedIds(newSelectedIds);
  };

  // Handle select all toggle
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(tasks.map((t) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Handle batch delete
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.size} selected task(s)?`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);
      await apiClient.batchDeleteTasks(Array.from(selectedIds));
      setSelectedIds(new Set()); // Clear selection
      await loadTasks(); // Refresh task list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tasks");
    } finally {
      setLoading(false);
    }
  };

  const hasSelectedTasks = selectedIds.size > 0;
  const allSelected = tasks.length > 0 && selectedIds.size === tasks.length;

  return (
    <div className="task-board">
      <h1>Task Board</h1>

      {error && (
        <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
          Error: {error}
        </div>
      )}

      {/* Batch Operations Toolbar */}
      {hasSelectedTasks && (
        <div
          className="batch-toolbar"
          style={{
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <span style={{ fontWeight: "bold" }}>
            {selectedIds.size} task(s) selected
          </span>
          <button
            onClick={handleBatchDelete}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Deleting..." : "Batch Delete"}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Task List */}
      <TaskList
        tasks={tasks}
        selectedIds={selectedIds}
        onTaskSelect={handleTaskSelect}
        onSelectAll={handleSelectAll}
        allSelected={allSelected}
        loading={loading}
      />
    </div>
  );
};

export default TaskBoard;
