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

interface ClickUpTaskTableProps {
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

export const ClickUpTaskTable: React.FC<ClickUpTaskTableProps> = ({ tasks }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return statusColors[status] || statusColors.default;
  };

  // Show only recent 10 tasks for dashboard
  const recentTasks = tasks
    .sort((a, b) => new Date(b.date_updated || b.date_created).getTime() - new Date(a.date_updated || a.date_created).getTime())
    .slice(0, 10);

  return (
    <div className="col-span-12 xl:col-span-7">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Recent Tasks
            </h4>
            <p className="text-sm text-meta-3">
              Latest 10 tasks sorted by update date
            </p>
          </div>
          <span className="text-sm text-meta-3">
            {tasks.length} total tasks
          </span>
        </div>

        <div className="flex flex-col">
          <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
            <div className="p-2.5 xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                Task ID
              </h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                Task Name
              </h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                Status
              </h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                Assignees
              </h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                Updated
              </h5>
            </div>
          </div>

          {recentTasks.map((task, index) => (
            <div
              className={`grid grid-cols-3 sm:grid-cols-5 ${
                index === recentTasks.length - 1
                  ? ""
                  : "border-b border-stroke dark:border-strokedark"
              }`}
              key={task.id}
            >
              <div className="flex items-center gap-3 p-2.5 xl:p-5">
                <p className="text-sm text-black dark:text-white font-mono">
                  #{task.id.slice(-6)}
                </p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-sm text-black dark:text-white truncate max-w-[200px]" title={task.name}>
                  {task.name}
                </p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <span
                  className="inline-flex rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: getStatusBadgeColor(task.status.status) }}
                >
                  {task.status.status}
                </span>
              </div>

              <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                <div className="flex items-center gap-1">
                  {task.assignees.length > 0 ? (
                    <>
                      {task.assignees.slice(0, 2).map((assignee, idx) => (
                        <div
                          key={idx}
                          className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs"
                          title={assignee.username || 'Assignee'}
                        >
                          {(assignee.username || 'A').charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {task.assignees.length > 2 && (
                        <span className="text-xs text-meta-3">
                          +{task.assignees.length - 2}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-meta-3">Unassigned</span>
                  )}
                </div>
              </div>

              <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                <p className="text-sm text-meta-3">
                  {formatDate(task.date_updated || task.date_created)}
                </p>
              </div>
            </div>
          ))}

          {recentTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg text-meta-3">No tasks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
