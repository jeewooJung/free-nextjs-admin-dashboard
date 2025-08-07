import React from 'react';
import { ClickUpTask } from '@/types/clickup';

interface TaskCardProps {
  task: ClickUpTask;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Task 헤더 */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            <a 
              href={task.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              {task.name}
            </a>
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {task.description}
            </p>
          )}
        </div>
        <span 
          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-4"
          style={getStatusBadgeColor(task.status.status)}
        >
          {task.status.status}
        </span>
      </div>

      {/* 우선순위 */}
      {task.priority && (
        <div className="mb-3">
          <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
            우선순위: {task.priority.priority}
          </span>
        </div>
      )}

      {/* 태그 */}
      {task.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
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
        </div>
      )}

      {/* 담당자 */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">담당자</div>
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
      </div>

      {/* 날짜 정보 */}
      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div>
          <span className="font-medium">생성일:</span> {formatDate(task.date_created)}
        </div>
        <div>
          <span className="font-medium">마감일:</span> {formatDate(task.due_date)}
        </div>
      </div>
    </div>
  );
};

interface TaskCardsProps {
  tasks: ClickUpTask[];
}

const TaskCards: React.FC<TaskCardsProps> = ({ tasks }) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Tasks ({tasks.length}개)
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TaskCards;
