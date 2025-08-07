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

interface TaskSummaryTableProps {
  tasks: ClickUpTask[];
}

const statusColors: Record<string, string> = {
  "미확인": "#FF6B6B",
  "확인 중": "#4ECDC4", 
  "판정 중": "#45B7D1",
  "결함": "#96CEB4",
  "무결함": "#FECA57",
  "반려": "#FF9FF3",
  "완료": "#54A0FF",
  "default": "#74b9ff"
};

// 상태 매핑 (ClickUp 상태 → 화면 표시 상태)
const statusMapping: Record<string, string> = {
  "미확인": "미확인",
  "확인 중": "확인 중(문의)",
  "판단 중": "판정 중",
  "결함": "결함",
  "무결함": "무결함",
  "반려": "반려(재처리)",
  "완료": "완료"
};

export const TaskSummaryTable: React.FC<TaskSummaryTableProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  
  // 상태별 개수 계산
  const statusCounts = tasks.reduce((acc, task) => {
    const status = task.status.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 표시할 상태 순서 (이미지와 동일)
  const displayOrder = ["미확인", "확인 중", "판정 중", "결함", "무결함", "반려", "완료"];

  // 상태별 설명
  const statusDescriptions: Record<string, string> = {
    "미확인": "아직 확인하지 못한 접수 건들",
    "확인 중": "접수는 했으나 요청사항에 대한 문의가 필요한 것들",
    "판정 중": "내부 분석이 필요하여 결함 판정 중인 것들",
    "결함": "결함 판정된 것들",
    "무결함": "무결함 판정된 것들",
    "완료": "검증시험 중 처리 완료(종결과 배포까지) 된 것들"
  };

  return (
    <div className="space-y-6">
      {/* 총 접수 현황 테이블 */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6 dark:border-strokedark">
          <h3 className="font-semibold text-black dark:text-white text-lg">
            총 접수 현황
          </h3>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 dark:bg-meta-4">
                  <th className="border border-stroke px-4 py-3 text-center font-semibold text-black dark:text-white dark:border-strokedark">
                    TOTAL 접수
                  </th>
                  {displayOrder.map(status => (
                    <th 
                      key={status}
                      className="border border-stroke px-4 py-3 text-center font-semibold text-black dark:text-white dark:border-strokedark"
                    >
                      {statusMapping[status] || status}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 개수 행 */}
                <tr>
                  <td className="border border-stroke px-4 py-3 text-center font-bold text-xl text-black dark:text-white dark:border-strokedark bg-gray-50 dark:bg-meta-4">
                    {totalTasks}
                  </td>
                  {displayOrder.map(status => {
                    const count = statusCounts[status] || 0;
                    const color = statusColors[status] || statusColors.default;
                    return (
                      <td 
                        key={status}
                        className="border border-stroke px-4 py-3 text-center font-bold text-xl dark:border-strokedark"
                        style={{ color: color }}
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
                {/* 비율 행 */}
                <tr>
                  <td className="border border-stroke px-4 py-3 text-center text-meta-3 dark:border-strokedark bg-gray-50 dark:bg-meta-4">
                    100%
                  </td>
                  {displayOrder.map(status => {
                    const count = statusCounts[status] || 0;
                    const percentage = totalTasks > 0 ? ((count / totalTasks) * 100).toFixed(2) : "0.00";
                    const color = statusColors[status] || statusColors.default;
                    return (
                      <td 
                        key={status}
                        className="border border-stroke px-4 py-3 text-center text-sm dark:border-strokedark"
                        style={{ color: color }}
                      >
                        {percentage}%
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 상태별 설명 테이블 */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6 dark:border-strokedark">
          <h3 className="font-semibold text-black dark:text-white text-lg">
            상태별 설명
          </h3>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <tbody>
                {displayOrder.filter(status => statusDescriptions[status]).map(status => (
                  <tr key={status}>
                    <td className="border border-stroke px-4 py-3 text-center font-semibold bg-gray-100 dark:bg-meta-4 dark:border-strokedark w-32">
                      <span 
                        className="inline-block px-3 py-1 rounded text-white text-sm"
                        style={{ backgroundColor: statusColors[status] || statusColors.default }}
                      >
                        {statusMapping[status] || status}
                      </span>
                    </td>
                    <td className="border border-stroke px-4 py-3 text-black dark:text-white dark:border-strokedark">
                      {statusDescriptions[status]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
