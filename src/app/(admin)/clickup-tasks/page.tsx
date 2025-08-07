"use client";
import React, { useState, useEffect } from "react";
import { ClickUpTask } from "@/types/clickup";
import TaskList from "@/components/common/TaskList";
import TaskCards from "@/components/common/TaskCards";

interface StoredSettings {
  apiKey: string;
  listId: string;
  spaceId: string;
  endpoint: string;
}

type ViewMode = 'table' | 'cards';

interface TasksResponse {
  tasks: ClickUpTask[];
  success: boolean;
  error?: string;
}

const ClickUpTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<ClickUpTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [settings, setSettings] = useState<StoredSettings | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // localStorage에서 설정 불러오기
  const loadSettings = (): StoredSettings | null => {
    try {
      const stored = localStorage.getItem('clickup_api_settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        return parsedSettings;
      }
      return null;
    } catch (error) {
      console.error('설정 불러오기 실패:', error);
      return null;
    }
  };

  // Task 데이터 가져오기
  const fetchTasks = async () => {
    if (!settings || !settings.apiKey || !settings.listId) {
      setError("API Key와 List ID가 설정되지 않았습니다. API TEST 페이지에서 설정을 저장해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log('Fetching tasks with settings:', {
        apiKey: settings.apiKey.substring(0, 10) + '...',
        listId: settings.listId,
        spaceId: settings.spaceId
      });

      const response = await fetch('/api/clickup-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: settings.apiKey,
          listId: settings.listId,
          spaceId: settings.spaceId,
          endpoint: `https://api.clickup.com/api/v2/list/${settings.listId}/task?include_closed=true&limit=100`,
          fetchAllPages: true
        }),
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries(response.headers.entries()));

      // 응답 텍스트 먼저 가져와서 확인
      const responseText = await response.text();
      console.log('API response text length:', responseText.length);
      console.log('API response preview:', responseText.substring(0, 200));

      let result;
      try {
        if (responseText.trim()) {
          result = JSON.parse(responseText);
        } else {
          throw new Error('빈 응답을 받았습니다.');
        }
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        throw new Error(`응답 파싱 실패: ${parseError instanceof Error ? parseError.message : '알 수 없는 오류'}`);
      }

      console.log('Parsed result:', result);

      if (!response.ok) {
        const errorMessage = result?.error || result?.details || `API 오류: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (result.success) {
        if (result.data && result.data.tasks && Array.isArray(result.data.tasks)) {
          console.log(`Successfully loaded ${result.data.tasks.length} tasks`);
          setTasks(result.data.tasks);
        } else if (result.data && Array.isArray(result.data)) {
          // 직접 배열이 반환된 경우
          console.log(`Successfully loaded ${result.data.length} tasks (direct array)`);
          setTasks(result.data);
        } else {
          console.warn('Unexpected data structure:', result);
          setError('예상치 못한 데이터 형식을 받았습니다.');
        }
      } else {
        setError(result.error || 'API 요청은 성공했지만 success가 false입니다.');
      }
    } catch (error) {
      console.error('fetchTasks error:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setError(`작업 로드 실패: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 설정 불러오기
  useEffect(() => {
    const storedSettings = loadSettings();
    setSettings(storedSettings);
  }, []);

  // 설정이 로드되면 자동으로 Task 가져오기
  useEffect(() => {
    if (settings) {
      fetchTasks();
    }
  }, [settings]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ClickUp Tasks
          </h1>
          <div className="flex items-center gap-4">
            {/* 뷰 모드 전환 */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Cards
              </button>
            </div>
            
            <button
              onClick={fetchTasks}
              disabled={loading || !settings}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              {loading ? "불러오는 중..." : "새로고침"}
            </button>
          </div>
        </div>

        {/* 설정 상태 표시 */}
        {!settings ? (
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">설정이 필요합니다</p>
            <p>API TEST 페이지에서 API Key와 List ID를 설정하고 저장해주세요.</p>
          </div>
        ) : (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">설정 확인됨</p>
            <p>List ID: {settings.listId} | API Key: {settings.apiKey.substring(0, 10)}...</p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">오류 발생:</p>
            <p className="mb-2">{error}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">디버그 정보 (클릭하여 펼치기)</summary>
              <div className="mt-2 text-xs bg-red-50 dark:bg-red-800 p-2 rounded">
                <p><strong>설정:</strong></p>
                {settings && (
                  <ul className="ml-4 list-disc">
                    <li>API Key: {settings.apiKey ? settings.apiKey.substring(0, 15) + '...' : '없음'}</li>
                    <li>List ID: {settings.listId || '없음'}</li>
                    <li>Space ID: {settings.spaceId || '없음'}</li>
                  </ul>
                )}
                <p className="mt-2"><strong>브라우저 콘솔을 확인하여 더 자세한 정보를 확인하세요.</strong></p>
                <p className="text-xs mt-1">F12 → Console 탭에서 추가 로그를 확인할 수 있습니다.</p>
              </div>
            </details>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Task 목록 */}
        {!loading && tasks.length > 0 && (
          viewMode === 'table' ? (
            <TaskList tasks={tasks} />
          ) : (
            <TaskCards tasks={tasks} />
          )
        )}

        {/* Task가 없는 경우 */}
        {!loading && !error && tasks.length === 0 && settings && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium mb-2">Task가 없습니다</p>
              <p>해당 리스트에 Task가 없거나 권한이 없을 수 있습니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClickUpTasksPage;
