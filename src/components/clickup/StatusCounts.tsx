"use client";

import React from "react";

interface ClickUpTask {
  id: string;
  name: string;
  status: {
    status: string;
    color: string;
  };
  assignees: any[];
  date_created: string;
  date_updated: string;
}

interface StatusCountsProps {
  tasks: ClickUpTask[];
}

const statusColors: Record<string, string> = {
  "미확인": "#FF6B6B",
  "확인 중": "#4ECDC4", 
  "판단 중": "#45B7D1",
  "결함": "#96CEB4",
  "무결함": "#FECA57",
  "반려": "#FF9FF3",
  "완료": "#54A0FF",
  "default": "#74b9ff"
};

export const StatusCounts: React.FC<StatusCountsProps> = ({ tasks }) => {
  // Calculate status counts
  const statusCounts = tasks.reduce((acc, task) => {
    const status = task.status.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get all unique statuses
  const allStatuses = Object.keys(statusCounts);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "미확인": return "❓";
      case "확인 중": return "👀";
      case "판단 중": return "🤔";
      case "결함": return "🐛";
      case "무결함": return "✨";
      case "반려": return "↩️";
      case "완료": return "✅";
      default: return "📝";
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Task Status Overview
        </h4>
        <p className="text-sm text-meta-3">
          Distribution of tasks by status
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allStatuses.map((status) => {
          const count = statusCounts[status];
          const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
          const color = statusColors[status] || statusColors.default;

          return (
            <div
              key={status}
              className="flex items-center justify-between rounded-lg border border-stroke p-4 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white text-lg"
                  style={{ backgroundColor: color }}
                >
                  {getStatusIcon(status)}
                </div>
                <div>
                  <h5 className="font-medium text-black dark:text-white">
                    {status}
                  </h5>
                  <p className="text-sm text-meta-3">
                    {percentage}% of total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-black dark:text-white">
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {allStatuses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg text-meta-3">No tasks found</p>
        </div>
      )}
    </div>
  );
};
