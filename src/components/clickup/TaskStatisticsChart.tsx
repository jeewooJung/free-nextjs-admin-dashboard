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

interface TaskStatisticsChartProps {
  tasks: ClickUpTask[];
}

export const TaskStatisticsChart: React.FC<TaskStatisticsChartProps> = ({ tasks }) => {
  // Process tasks for trend data (last 12 months)
  const getTrendData = () => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const currentDate = new Date();
    const categories = [];
    const createdData = [];
    const completedData = [];

    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      
      categories.push(`${monthNames[monthIndex]} ${year}`);

      // Count tasks created in this month
      const created = tasks.filter(task => {
        const taskDate = new Date(task.date_created);
        return taskDate.getMonth() === monthIndex && 
               taskDate.getFullYear() === year;
      }).length;

      // Count tasks completed in this month
      const completed = tasks.filter(task => {
        if (task.status.status !== "완료") return false;
        const taskDate = new Date(task.date_updated || task.date_created);
        return taskDate.getMonth() === monthIndex && 
               taskDate.getFullYear() === year;
      }).length;

      createdData.push(created);
      completedData.push(completed);
    }

    return {
      categories,
      createdData,
      completedData
    };
  };

  const { categories, createdData, completedData } = getTrendData();

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 335,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: "smooth",
    },
    // labels: {
    //   show: false,
    //   position: "top",
    // },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: "#fff",
      strokeColors: ["#3C50E0", "#80CAEE"],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      min: 0,
    },
    colors: ["#3C50E0", "#80CAEE"],
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
  };

  const series = [
    {
      name: "Tasks Created",
      data: createdData,
    },
    {
      name: "Tasks Completed",
      data: completedData,
    },
  ];

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Tasks Created</p>
              <p className="text-sm font-medium">Trend over last 12 months</p>
            </div>
          </div>
          <div className="flex min-w-47.5">
            <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-secondary">Tasks Completed</p>
              <p className="text-sm font-medium">Completion trend</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div id="taskStatisticsChart" className="-ml-5 h-[355px] w-[105%]">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={355}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};
