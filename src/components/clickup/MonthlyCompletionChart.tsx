"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Dynamically import ReactApexChart to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

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

interface MonthlyCompletionChartProps {
  tasks: ClickUpTask[];
}

export const MonthlyCompletionChart: React.FC<MonthlyCompletionChartProps> = ({ tasks }) => {
  // Process tasks for monthly completion data
  const getMonthlyData = () => {
    const currentYear = new Date().getFullYear();
    const monthlyData = Array(12).fill(0);
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Filter completed tasks and group by month
    const completedTasks = tasks.filter(task => task.status.status === "완료");
    
    completedTasks.forEach(task => {
      const taskDate = new Date(task.date_updated || task.date_created);
      if (taskDate.getFullYear() === currentYear) {
        const month = taskDate.getMonth();
        monthlyData[month]++;
      }
    });

    return {
      categories: monthNames,
      data: monthlyData
    };
  };

  const { categories, data } = getMonthlyData();

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 335,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    grid: {
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
    },
    colors: ["#54A0FF"],
  };

  const series = [
    {
      name: "Completed Tasks",
      data: data,
    },
  ];

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-7">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Monthly Task Completion
          </h4>
          <p className="text-sm text-meta-3">
            Number of tasks completed per month in {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <div>
        <div id="monthlyCompletionChart" className="-ml-5 h-[355px] w-[105%]">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={355}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};
