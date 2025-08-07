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

interface DefectListTablesProps {
  tasks: ClickUpTask[];
}

export const DefectListTables: React.FC<DefectListTablesProps> = ({ tasks }) => {
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

  const getDaysFromCreation = (dateString: string) => {
    try {
      const created = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - created.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  const getDaysFromUpdate = (dateString: string) => {
    try {
      const updated = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - updated.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  // 일반 결함 (결함 상태)
  const normalDefects = tasks
    .filter(task => task.status.status === "결함")
    .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
    .slice(0, 5);

  // 긴급 결함 (임의로 최근 생성된 결함들 중 일부를 긴급으로 분류)
  const urgentDefects = tasks
    .filter(task => task.status.status === "결함" || task.status.status === "판정 중")
    .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
    .slice(0, 3);

  // 일반 결함(HEC에서 처리 목록)
  const hecDefects = tasks
    .filter(task => task.status.status === "무결함" || task.status.status === "완료")
    .sort((a, b) => new Date(b.date_updated).getTime() - new Date(a.date_updated).getTime())
    .slice(0, 4);

  const renderDefectTable = (
    title: string,
    defects: ClickUpTask[],
    titleColor: string = "text-black dark:text-white"
  ) => (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-3 px-4 dark:border-strokedark">
        <h4 className={`font-semibold ${titleColor}`}>
          {title}
        </h4>
      </div>
      
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-meta-4">
                <th className="border border-stroke px-2 py-2 text-center font-medium text-black dark:text-white dark:border-strokedark">
                  결함 조치 List<br/>(No.)
                </th>
                <th className="border border-stroke px-2 py-2 text-center font-medium text-black dark:text-white dark:border-strokedark">
                  조치 기간(Day)<br/>(작업 후 조치 기준)
                </th>
                <th className="border border-stroke px-2 py-2 text-center font-medium text-black dark:text-white dark:border-strokedark">
                  경과(Day)
                </th>
              </tr>
            </thead>
            <tbody>
              {defects.map((defect, index) => {
                const daysSinceCreation = getDaysFromCreation(defect.date_created);
                const daysSinceUpdate = getDaysFromUpdate(defect.date_updated);
                const taskNumber = defect.id.slice(-3); // 마지막 3자리 사용
                
                return (
                  <tr key={defect.id}>
                    <td className="border border-stroke px-2 py-2 text-center text-black dark:text-white dark:border-strokedark">
                      {taskNumber}
                    </td>
                    <td className="border border-stroke px-2 py-2 text-center text-black dark:text-white dark:border-strokedark">
                      {daysSinceCreation}
                    </td>
                    <td className="border border-stroke px-2 py-2 text-center font-semibold dark:border-strokedark">
                      <span className={daysSinceUpdate > 3 ? "text-red-600" : "text-green-600"}>
                        {daysSinceUpdate > 0 ? daysSinceUpdate.toFixed(2) : daysSinceCreation.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {defects.length === 0 && (
                <tr>
                  <td colSpan={3} className="border border-stroke px-2 py-4 text-center text-meta-3 dark:border-strokedark">
                    해당하는 결함이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 일반 결함 */}
        {renderDefectTable(
          "일반 결함",
          normalDefects,
          "text-blue-600"
        )}

        {/* 긴급 결함 */}
        {renderDefectTable(
          "긴급 결함",
          urgentDefects,
          "text-red-600"
        )}

        {/* 일반 결함(HEC에서 처리 목록) */}
        {renderDefectTable(
          "일반 결함(HEC에서 처리 목록)",
          hecDefects,
          "text-green-600"
        )}
      </div>
    </div>
  );
};
