import type { FC } from "react";
import { Task } from "../api/apiClient";

interface TaskListProps {
  tasks: Task[];
  selectedIds: Set<string>;
  onTaskSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  allSelected: boolean;
  loading: boolean;
}

export const TaskList: FC<TaskListProps> = ({
  tasks,
  selectedIds,
  onTaskSelect,
  onSelectAll,
  allSelected,
  loading,
}) => {
  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "ready":
        return "#6c757d";
      case "in_progress":
        return "#007bff";
      case "review":
        return "#ffc107";
      case "done":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty" style={{ padding: "20px", textAlign: "center" }}>
        No tasks available
      </div>
    );
  }

  return (
    <div className="task-list">
      {/* Table Header */}
      <div
        className="task-list-header"
        style={{
          display: "grid",
          gridTemplateColumns: "50px 80px 1fr 150px 120px",
          padding: "10px",
          backgroundColor: "#e9ecef",
          fontWeight: "bold",
          borderBottom: "2px solid #dee2e6",
        }}
      >
        <div>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            disabled={loading}
          />
        </div>
        <div>ID</div>
        <div>Title</div>
        <div>Status</div>
        <div>Created</div>
      </div>

      {/* Task Items */}
      {tasks.map((task) => (
        <div
          key={task.id}
          className="task-item"
          style={{
            display: "grid",
            gridTemplateColumns: "50px 80px 1fr 150px 120px",
            padding: "10px",
            borderBottom: "1px solid #dee2e6",
            backgroundColor: selectedIds.has(task.id) ? "#e7f3ff" : "white",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <div>
            <input
              type="checkbox"
              checked={selectedIds.has(task.id)}
              onChange={(e) => onTaskSelect(task.id, e.target.checked)}
              disabled={loading}
            />
          </div>
          <div>{task.id}</div>
          <div>
            <div style={{ fontWeight: 500 }}>{task.title}</div>
            {task.description && (
              <div style={{ fontSize: "12px", color: "#6c757d" }}>
                {task.description}
              </div>
            )}
          </div>
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 500,
                backgroundColor: getStatusColor(task.status),
                color: task.status === "review" ? "#000" : "#fff",
              }}
            >
              {task.status.replace("_", " ")}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#6c757d" }}>
            {new Date(task.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
