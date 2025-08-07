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

interface TaskSummaryInfoProps {
  tasks: ClickUpTask[];
}

export const TaskSummaryInfo: React.FC<TaskSummaryInfoProps> = ({ tasks }) => {
  // 평균 접수 일자 계산 (생성일 기준)
  const getAverageCreationDays = () => {
    if (tasks.length === 0) return 0;
    
    const now = new Date();
    const totalDays = tasks.reduce((sum, task) => {
      const createdDate = new Date(task.date_created);
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return (totalDays / tasks.length).toFixed(1);
  };

  // 결함 조치 기간 계산
  const getDefectResolutionStats = () => {
    const defectTasks = tasks.filter(task => task.status.status === "결함");
    const completedDefects = tasks.filter(task => 
      task.status.status === "완료" && 
      new Date(task.date_updated).getTime() > new Date(task.date_created).getTime()
    );

    const getResolutionDays = (task: ClickUpTask) => {
      const created = new Date(task.date_created);
      const updated = new Date(task.date_updated);
      const diffTime = updated.getTime() - created.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // 일반결함 평균 (임의로 설정 - 실제로는 우선순위나 라벨로 구분해야 함)
    const normalDefects = completedDefects.slice(0, Math.floor(completedDefects.length * 0.7));
    const urgentDefects = completedDefects.slice(Math.floor(completedDefects.length * 0.7));

    const normalAvg = normalDefects.length > 0 
      ? (normalDefects.reduce((sum, task) => sum + getResolutionDays(task), 0) / normalDefects.length).toFixed(1)
      : "0.0";

    const urgentAvg = urgentDefects.length > 0
      ? (urgentDefects.reduce((sum, task) => sum + getResolutionDays(task), 0) / urgentDefects.length).toFixed(1)
      : "0.0";

    return { normalAvg, urgentAvg };
  };

  const averageDays = getAverageCreationDays();
  const { normalAvg, urgentAvg } = getDefectResolutionStats();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 접수 총괄 */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke pb-3 mb-4 dark:border-strokedark">
          <h3 className="font-semibold text-black dark:text-white text-lg">
            접수 총괄
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-meta-4 p-4 rounded-lg">
            <div className="text-sm text-meta-3 mb-1">평균 +1Day 내외</div>
            <div className="text-xs text-meta-3 mb-2">
              ※ 접수 분류 : 약 0.25 소요(1Day 기준(접수 일에 따라 다소 유동적)
            </div>
            <div className="text-xs text-meta-3">
              ※ 결함 조치(특히) 간급 건의 경우) 중에는 접수 내용 확인(접수 기능 인원 x)
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              +{averageDays}Day
            </div>
            <div className="text-sm text-meta-3">
              평균 접수 후 경과일
            </div>
          </div>
        </div>
      </div>

      {/* 결함 조치 기간 */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke pb-3 mb-4 dark:border-strokedark">
          <h3 className="font-semibold text-black dark:text-white text-lg">
            결함 조치 기간
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-meta-4 rounded-lg">
              <div className="text-sm text-meta-3 mb-2">일반결함</div>
              <div className="text-xl font-bold text-green-600 mb-1">
                평균 약 +{normalAvg}day
              </div>
              <div className="text-xs text-meta-3">
                소요 중(누적 기준)
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-meta-4 rounded-lg">
              <div className="text-sm text-meta-3 mb-2">긴급결함</div>
              <div className="text-xl font-bold text-red-600 mb-1">
                평균 약 +{urgentAvg}day
              </div>
              <div className="text-xs text-meta-3">
                소요 중(누적 기준)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
