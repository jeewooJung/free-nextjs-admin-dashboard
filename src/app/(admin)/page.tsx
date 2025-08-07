"use client";

import React, { useState, useEffect } from "react";
import { ClickUpMetrics } from "@/components/clickup/ClickUpMetrics";
import { StatusCounts } from "@/components/clickup/StatusCounts";
import { MonthlyCompletionChart } from "@/components/clickup/MonthlyCompletionChart";
import { TaskStatisticsChart } from "@/components/clickup/TaskStatisticsChart";
import { ClickUpTaskTable } from "@/components/clickup/ClickUpTaskTable";

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
      const queryParams = new URLSearchParams({
        apiKey: settings.apiKey,
        spaceId: settings.spaceId,
        listId: settings.listId,
        fetchAllPages: 'true'
      });

      const response = await fetch(`/api/clickup-tasks?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      
      if (!responseText.trim()) {
        throw new Error('Empty response from API');
      }

      const data = JSON.parse(responseText);
      
      if (data.error) {
        throw new Error(data.error);
      }

      setTasks(data.tasks || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
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
            ClickUp Task Dashboard
          </h1>
          <p className="text-meta-3">
            Comprehensive overview of your task management data
          </p>
        </div>
      </div>

      {/* Metrics Section */}
      <ClickUpMetrics tasks={tasks} />

      {/* Status Counts Section */}
      <StatusCounts tasks={tasks} />

      {/* Charts Section */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <MonthlyCompletionChart tasks={tasks} />
        
        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h4 className="text-xl font-semibold text-black dark:text-white mb-2">
                Quick Stats
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-meta-3">Total Tasks:</span>
                  <span className="font-semibold">{tasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-meta-3">Completed:</span>
                  <span className="font-semibold text-green-600">
                    {tasks.filter(t => t.status.status === "완료").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-meta-3">In Progress:</span>
                  <span className="font-semibold text-blue-600">
                    {tasks.filter(t => t.status.status !== "완료").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-meta-3">Completion Rate:</span>
                  <span className="font-semibold text-primary">
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

      {/* Statistics Chart */}
      <TaskStatisticsChart tasks={tasks} />

      {/* Task List Display */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <ClickUpTaskTable tasks={tasks} />
        
        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
              Actions
            </h4>
            <div className="space-y-3">
              <button
                onClick={fetchTasks}
                className="w-full flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
              >
                🔄 Refresh Data
              </button>
              <a
                href="/clickup-tasks"
                className="w-full flex items-center justify-center rounded-md border border-primary px-4 py-2 text-center font-medium text-primary hover:bg-primary hover:text-white transition-colors"
              >
                📋 View All Tasks
              </a>
              <a
                href="/api-test"
                className="w-full flex items-center justify-center rounded-md border border-stroke px-4 py-2 text-center font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
              >
                ⚙️ Settings
              </a>
            </div>
            
            <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark">
              <h5 className="font-semibold text-black dark:text-white mb-2">
                Last Updated
              </h5>
              <p className="text-sm text-meta-3">
                {new Date().toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
