"use client";

import React, { useState, useEffect } from "react";
import { TaskSummaryTable } from "@/components/clickup/TaskSummaryTable";
import { TaskSummaryInfo } from "@/components/clickup/TaskSummaryInfo";
import { DefectListTables } from "@/components/clickup/DefectListTables";
import { ClickUpMetrics } from "@/components/clickup/ClickUpMetrics";
import { MonthlyCompletionChart } from "@/components/clickup/MonthlyCompletionChart";
import { TaskStatisticsChart } from "@/components/clickup/TaskStatisticsChart";

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

interface ClickUpSettings {
  apiKey: string;
  spaceId: string;
  listId: string;
  endpoint?: string;
  fetchAllPages?: boolean;
}

// localStorage 키 상수 (api-test와 동일)
const STORAGE_KEY = 'clickup_api_settings';

export default function Dashboard() {
  const [tasks, setTasks] = useState<ClickUpTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ClickUpSettings | null>(null);
  const [settingsChecked, setSettingsChecked] = useState(false);

  useEffect(() => {
    // Load settings from localStorage (api-test에서 저장한 값과 동일한 키 사용)
    console.log('🔍 Checking localStorage for settings...');
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    console.log('📦 Raw localStorage data:', savedSettings);
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('✅ Parsed settings:', parsedSettings);
        
        // 필수 필드가 있는지 확인
        if (parsedSettings.apiKey && parsedSettings.listId) {
          // api-test에서 저장한 형태의 데이터를 dashboard에서 사용하는 형태로 변환
          const dashboardSettings = {
            apiKey: parsedSettings.apiKey,
            spaceId: parsedSettings.spaceId || '',
            listId: parsedSettings.listId,
            endpoint: parsedSettings.endpoint || '',
            fetchAllPages: parsedSettings.fetchAllPages || true
          };
          
          console.log('🎯 Dashboard settings:', dashboardSettings);
          setSettings(dashboardSettings);
        } else {
          console.log('⚠️ Settings incomplete - missing apiKey or listId');
        }
      } catch (error) {
        console.error('❌ Error parsing saved settings:', error);
      }
    } else {
      console.log('🚫 No settings found in localStorage');
    }
    setSettingsChecked(true);
  }, []);

  useEffect(() => {
    console.log('⚡ Settings changed:', settings);
    console.log('🔍 Settings checked:', settingsChecked);
    
    if (settingsChecked) {
      if (settings) {
        console.log('🚀 Settings available, fetching tasks...');
        fetchTasks();
      } else {
        console.log('⏹️ No settings, setting loading to false');
        setLoading(false);
      }
    }
  }, [settings, settingsChecked]);

  const fetchTasks = async () => {
    if (!settings) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Dashboard: Fetching tasks with settings:', {
        apiKey: settings.apiKey.substring(0, 10) + '...',
        listId: settings.listId,
        spaceId: settings.spaceId
      });

      // ClickUp Tasks 페이지와 동일한 API 사용
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

      console.log('📡 Dashboard API response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      
      if (!responseText.trim()) {
        throw new Error('Empty response from API');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Dashboard JSON parsing error:', parseError);
        console.error('📄 Response text:', responseText.substring(0, 200) + '...');
        throw new Error('Failed to parse JSON response');
      }

      console.log('✅ Dashboard parsed result:', result);

      if (result.success) {
        let tasksData = [];
        if (result.data && result.data.tasks && Array.isArray(result.data.tasks)) {
          tasksData = result.data.tasks;
          console.log(`✅ Dashboard: Successfully loaded ${tasksData.length} tasks`);
        } else if (result.data && Array.isArray(result.data)) {
          tasksData = result.data;
          console.log(`✅ Dashboard: Successfully loaded ${tasksData.length} tasks (direct array)`);
        } else {
          console.warn('⚠️ Dashboard: Unexpected data structure:', result);
          throw new Error('Unexpected data structure received');
        }
        
        setTasks(tasksData);
      } else {
        throw new Error(result.error || 'API request succeeded but success was false');
      }
    } catch (error: any) {
      console.error('💥 Dashboard fetchTasks error:', error);
      setError(error.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !settingsChecked) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-meta-3">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
            ClickUp Settings Required
          </h3>
          <p className="text-meta-3 mb-4">
            Please configure your ClickUp API settings first to view the dashboard.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-meta-3">
              Required: API Key and List ID
            </p>
            <p className="text-sm text-meta-3">
              Storage Key: {STORAGE_KEY}
            </p>
          </div>
          <a
            href="/api-test"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90 mt-4"
          >
            Configure Settings
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-meta-3 mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Hi-Builder 구축 2차
          </h1>
          <p className="text-meta-3">
            ClickUp 테스크 관리 대시보드
          </p>
        </div>
      </div>

      {/* 총 접수 현황 및 상태별 설명 */}
      <TaskSummaryTable tasks={tasks} />

      {/* 접수 총괄 및 결함 조치 기간 */}
      <TaskSummaryInfo tasks={tasks} />

      {/* Charts Section - 월별 완료 및 통계 */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-6">
          <MonthlyCompletionChart tasks={tasks} />
        </div>
        
        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
                주요 통계
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-meta-4 rounded">
                  <span className="text-meta-3">총 접수:</span>
                  <span className="font-semibold text-lg">{tasks.length}건</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-meta-4 rounded">
                  <span className="text-meta-3">완료:</span>
                  <span className="font-semibold text-lg text-green-600">
                    {tasks.filter(t => t.status.status === "완료").length}건
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-meta-4 rounded">
                  <span className="text-meta-3">진행중:</span>
                  <span className="font-semibold text-lg text-blue-600">
                    {tasks.filter(t => t.status.status !== "완료").length}건
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-meta-4 rounded">
                  <span className="text-meta-3">완료율:</span>
                  <span className="font-semibold text-lg text-yellow-600">
                    {tasks.length > 0 
                      ? Math.round((tasks.filter(t => t.status.status === "완료").length / tasks.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 전체 통계 차트 */}
      <TaskStatisticsChart tasks={tasks} />

      {/* 결함 조치 리스트 */}
      <DefectListTables tasks={tasks} />

      {/* 액션 버튼들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={fetchTasks}
          className="flex items-center justify-center rounded-md bg-primary px-4 py-3 text-center font-medium text-white hover:bg-opacity-90 transition-colors"
        >
          🔄 데이터 새로고침
        </button>
        <a
          href="/clickup-tasks"
          className="flex items-center justify-center rounded-md border border-primary px-4 py-3 text-center font-medium text-primary hover:bg-primary hover:text-white transition-colors"
        >
          📋 전체 테스크 보기
        </a>
        <a
          href="/api-test"
          className="flex items-center justify-center rounded-md border border-stroke px-4 py-3 text-center font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
        >
          ⚙️ API 설정
        </a>
        <div className="flex items-center justify-center rounded-md border border-stroke px-4 py-3 text-center">
          <div className="text-center">
            <div className="text-sm font-medium text-black dark:text-white">마지막 업데이트</div>
            <div className="text-xs text-meta-3">
              {new Date().toLocaleString('ko-KR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
