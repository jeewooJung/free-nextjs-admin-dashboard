import React from 'react';
import { ClickUpTask } from '@/types/clickup';

interface TaskListProps {
  tasks: ClickUpTask[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  // Task 상태에 따른 배지 색상
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case '점수':
        return { backgroundColor: '#B0B0B0', color: '#FFFFFF' }; // 회색
      case '확인 중(문의)':
        return { backgroundColor: '#8B5B9A', color: '#FFFFFF' }; // 보라색
      case '판단 중':
        return { backgroundColor: '#A0522D', color: '#FFFFFF' }; // 갈색
      case '결함':
        return { backgroundColor: '#4682B4', color: '#FFFFFF' }; // 파란색
      case '반려(재처리)':
        return { backgroundColor: '#DDA0DD', color: '#333333' }; // 연보라색
      case '협의대상':
        return { backgroundColor: '#32CD32', color: '#FFFFFF' }; // 초록색
      case '무결함':
        return { backgroundColor: '#B0B0B0', color: '#FFFFFF' }; // 회색
      case '완료':
        return { backgroundColor: '#32CD32', color: '#FFFFFF' }; // 초록색
      default:
        return { backgroundColor: '#FDE047', color: '#1F2937' }; // 기본 노란색
    }
  };

  // Task를 status별로 그룹화하고 날짜순으로 정렬
  const groupTasksByStatus = (tasks: ClickUpTask[]) => {
    // status별로 그룹화
    const grouped = tasks.reduce((acc, task) => {
      const status = task.status.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {} as Record<string, ClickUpTask[]>);

    // 각 그룹 내에서 날짜순으로 정렬 (생성일 기준)
    Object.keys(grouped).forEach(status => {
      grouped[status].sort((a, b) => {
        const dateA = a.date_created ? parseInt(a.date_created) : 0;
        const dateB = b.date_created ? parseInt(b.date_created) : 0;
        return dateB - dateA; // 최신순
      });
    });

    return grouped;
  };

  const groupedTasks = groupTasksByStatus(tasks);

  // 우선순위에 따른 색상
  const getPriorityColor = (priority: any) => {
    if (!priority) return 'text-gray-500';
    
    switch (priority.priority.toLowerCase()) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'normal':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  };

  // 날짜 포맷팅
  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return '없음';
    return new Date(parseInt(timestamp)).toLocaleDateString('ko-KR');
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Tasks ({tasks.length}개)
        </h2>
      </div>
      
      {Object.entries(groupedTasks).map(([status, statusTasks]) => (
        <div key={status} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span 
                className="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
                style={getStatusBadgeColor(status)}
              >
                {status}
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                ({statusTasks.length}개)
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    우선순위
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    담당자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    마감일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    생성일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {statusTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          <a 
                            href={task.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {task.name}
                          </a>
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                                style={{ 
                                  backgroundColor: tag.tag_bg, 
                                  color: tag.tag_fg 
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority?.priority || '없음'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {task.assignees.length > 0 ? (
                          task.assignees.map((assignee) => (
                            <span 
                              key={assignee.id}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200 rounded-full"
                            >
                              {assignee.username}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            담당자 없음
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(task.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(task.date_created)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
