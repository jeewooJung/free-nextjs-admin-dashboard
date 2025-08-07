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

interface ClickUpMetricsProps {
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

export const ClickUpMetrics: React.FC<ClickUpMetricsProps> = ({ tasks }) => {
  // Calculate metrics
  const totalTasks = tasks.length;
  
  // Status counts
  const statusCounts = tasks.reduce((acc, task) => {
    const status = task.status.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent tasks (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentTasks = tasks.filter(task => 
    new Date(task.date_created) > sevenDaysAgo
  ).length;

  // Completed tasks percentage
  const completedTasks = statusCounts["완료"] || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Active tasks (not completed)
  const activeTasks = totalTasks - completedTasks;

  const metricCards = [
    {
      title: "Total Tasks",
      value: totalTasks.toLocaleString(),
      icon: "📋",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Completed Tasks",
      value: completedTasks.toLocaleString(),
      icon: "✅",
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Active Tasks",
      value: activeTasks.toLocaleString(),
      icon: "🔄",
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Recent Tasks (7d)",
      value: recentTasks.toLocaleString(),
      icon: "🆕",
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: "📊",
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
      {metricCards.map((card, index) => (
        <div key={index} className={`rounded-lg border border-stroke py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark ${card.bgColor}`}>
          <div className={`flex h-11.5 w-11.5 items-center justify-center rounded-full ${card.color} mb-4`}>
            <span className="text-white text-lg">{card.icon}</span>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className={`text-2xl font-bold ${card.textColor} dark:text-white`}>
                {card.value}
              </h4>
              <span className="text-sm font-medium text-meta-3">{card.title}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
