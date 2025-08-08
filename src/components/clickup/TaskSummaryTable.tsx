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
  "확인 중(문의)": "#8B5B9A", 
  "판단 중": "#A0522D",
  "결함": "#4682B4",
  "무결함": "#B0B0B0",
  "반려(재처리)": "#DDA0DD",
  "완료": "#32CD32",
  "default": "#74b9ff"
};

// 상태 매핑 (ClickUp 실제 상태 → 화면 표시 상태)
const statusMapping: Record<string, string> = {
  "미확인": "미확인",
  "확인 중(문의)": "확인 중(문의)",
  "판단 중": "판정 중",
  "결함": "결함",
  "무결함": "무결함",
  "반려(재처리)": "반려(재처리)",
  "완료": "완료"
};

export const TaskSummaryTable: React.FC<TaskSummaryTableProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  
  // 디버깅: 실제 상태값들 출력
  React.useEffect(() => {
    const uniqueStatuses = [...new Set(tasks.map(task => task.status.status))];
    console.log('🎯 Dashboard 실제 상태값들:', uniqueStatuses);
    console.log('📊 총 테스크 수:', totalTasks);
    
    const statusCounts = tasks.reduce((acc, task) => {
      const status = task.status.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('📈 상태별 개수:', statusCounts);
  }, [tasks, totalTasks]);
  
  // 상태별 개수 계산
  const statusCounts = tasks.reduce((acc, task) => {
    const status = task.status.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 상태 순서 정의 (우선순위에 따라) - 실제 ClickUp 상태값 기준
  const statusPriority: Record<string, number> = {
    "미확인": 1,
    "확인 중(문의)": 2,
    "판단 중": 3,
    "결함": 4,
    "무결함": 5,
    "반려(재처리)": 6,
    "완료": 7,
  };

  // 실제 존재하는 상태들만 우선순위에 따라 정렬
  const actualStatuses = Object.keys(statusCounts);
  
  // statusPriority에 정의된 상태들 중 실제 존재하는 것들만 우선순위 순서대로 정렬
  const definedActualStatuses = actualStatuses
    .filter(status => statusPriority[status])
    .sort((a, b) => statusPriority[a] - statusPriority[b]);
  
  // statusPriority에 정의되지 않은 실제 상태들
  const undefinedStatuses = actualStatuses.filter(status => !statusPriority[status]);
  
  // 최종 표시할 상태들: 우선순위가 있는 실제 상태들 + 정의되지 않은 상태들
  const displayStatuses = [...definedActualStatuses, ...undefinedStatuses];

  console.log('🔍 실제 존재하는 상태들:', actualStatuses);
  console.log('📋 우선순위 정의된 실제 상태들:', definedActualStatuses);
  console.log('❓ 정의되지 않은 상태들:', undefinedStatuses);
  console.log('✅ 최종 표시할 상태들:', displayStatuses);
  console.log('📊 상태별 개수:', statusCounts);

  // 상태별 설명 (실제 ClickUp 상태값 기준)
  const statusDescriptions: Record<string, string> = {
    "미확인": "아직 확인하지 못한 접수 건들",
    "확인 중(문의)": "접수는 했으나 요청사항에 대한 문의가 필요한 것들",
    "판단 중": "내부 분석이 필요하여 결함 판정 중인 것들",
    "결함": "결함 판정된 것들",
    "무결함": "무결함 판정된 것들",
    "반려(재처리)": "재처리가 필요한 반려된 작업들",
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
        
        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 dark:bg-meta-4">
                  <th className="border border-stroke px-6 py-4 text-center font-semibold text-black dark:text-white dark:border-strokedark text-base">
                    TOTAL 접수
                  </th>
                  {displayStatuses.map((status: string) => (
                    <th 
                      key={status}
                      className="border border-stroke px-6 py-4 text-center font-semibold text-black dark:text-white dark:border-strokedark text-base min-w-32"
                    >
                      {statusMapping[status] || status}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 개수 행 */}
                <tr>
                  <td className="border border-stroke px-6 py-4 text-center font-bold text-2xl text-black dark:text-white dark:border-strokedark bg-gray-50 dark:bg-meta-4">
                    {totalTasks}
                  </td>
                  {displayStatuses.map((status: string) => {
                    const count = statusCounts[status] || 0;
                    const color = statusColors[status] || statusColors.default;
                    return (
                      <td 
                        key={status}
                        className="border border-stroke px-6 py-4 text-center font-bold text-2xl dark:border-strokedark"
                        style={{ color: color }}
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
                {/* 비율 행 */}
                <tr>
                  <td className="border border-stroke px-6 py-4 text-center text-meta-3 dark:border-strokedark bg-gray-50 dark:bg-meta-4 text-base">
                    100%
                  </td>
                  {displayStatuses.map((status: string) => {
                    const count = statusCounts[status] || 0;
                    const percentage = totalTasks > 0 ? ((count / totalTasks) * 100).toFixed(2) : "0.00";
                    const color = statusColors[status] || statusColors.default;
                    return (
                      <td 
                        key={status}
                        className="border border-stroke px-6 py-4 text-center text-base dark:border-strokedark"
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
                {displayStatuses.map((status: string) => (
                  <tr key={status}>
                    <td className="border border-stroke px-6 py-4 text-center font-semibold bg-gray-100 dark:bg-meta-4 dark:border-strokedark w-48 min-w-48">
                      <span 
                        className="inline-block px-4 py-2 rounded text-white text-base font-medium whitespace-nowrap"
                        style={{ backgroundColor: statusColors[status] || statusColors.default }}
                      >
                        {statusMapping[status] || status}
                      </span>
                    </td>
                    <td className="border border-stroke px-6 py-4 text-black dark:text-white dark:border-strokedark text-base leading-relaxed">
                      {statusDescriptions[status] || `${statusMapping[status] || status} 상태의 작업들입니다.`}
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
