"use client";
import React, { useState, useEffect } from "react";
import { ClickUpApiTestRequest, ClickUpApiTestResponse, ClickUpApiError } from "@/types/clickup";

interface ApiTestFormData extends ClickUpApiTestRequest {
  endpoint: string;
  fetchAllPages?: boolean;
}

interface ApiResponse {
  data?: ClickUpApiTestResponse;
  error?: string;
  loading: boolean;
}

// localStorage 키 상수
const STORAGE_KEY = 'clickup_api_settings';

const ApiTestPage: React.FC = () => {
  // 사전 정의된 엔드포인트 옵션들
  const predefinedEndpoints = [
    {
      name: "Get All Tasks (All Pages)",
      url: "https://api.clickup.com/api/v2/list/{listId}/task?include_closed=true&limit=100",
      description: "모든 페이지의 작업을 자동으로 가져옵니다 (100개 이상도 가능)",
      fetchAllPages: true,
    },
    {
      name: "Get Tasks from List (All Status)",
      url: "https://api.clickup.com/api/v2/list/{listId}/task?include_closed=true&limit=100",
      description: "지정된 리스트의 모든 상태 작업 목록을 가져옵니다 (최대 100개)",
      fetchAllPages: false,
    },
    {
      name: "Get Tasks from List (Open Only)",
      url: "https://api.clickup.com/api/v2/list/{listId}/task",
      description: "지정된 리스트의 열린 작업 목록만 가져옵니다",
      fetchAllPages: false,
    },
    {
      name: "Get Tasks from List (More Results)",
      url: "https://api.clickup.com/api/v2/list/{listId}/task?include_closed=true&limit=100&page=0",
      description: "페이지네이션을 고려한 모든 작업 목록 (page 파라미터 조정 가능)",
      fetchAllPages: false,
    },
    {
      name: "Get Space Details",
      url: "https://api.clickup.com/api/v2/space/{spaceId}",
      description: "스페이스 정보를 가져옵니다",
      fetchAllPages: false,
    },
    {
      name: "Get Lists in Space",
      url: "https://api.clickup.com/api/v2/space/{spaceId}/list",
      description: "스페이스의 모든 리스트를 가져옵니다",
      fetchAllPages: false,
    },
    {
      name: "Get List Details",
      url: "https://api.clickup.com/api/v2/list/{listId}",
      description: "리스트 정보를 가져옵니다",
      fetchAllPages: false,
    },
    {
      name: "Custom Endpoint",
      url: "",
      description: "사용자 정의 엔드포인트를 입력합니다",
      fetchAllPages: false,
    },
  ];
  const [formData, setFormData] = useState<ApiTestFormData>({
    spaceId: "",
    apiKey: "",
    listId: "",
    endpoint: "https://api.clickup.com/api/v2/list/{listId}/task?include_closed=true&limit=100",
    fetchAllPages: true,
  });

  const [apiResponse, setApiResponse] = useState<ApiResponse>({
    loading: false,
  });

  const [autoSave, setAutoSave] = useState<boolean>(false);
  const [hasStoredSettings, setHasStoredSettings] = useState<boolean>(false);

  // localStorage 상태 확인
  const checkStoredSettings = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setHasStoredSettings(!!stored);
  };

  // localStorage에서 설정 불러오기
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setFormData(parsedSettings);
      }
      checkStoredSettings();
    } catch (error) {
      console.error('설정 불러오기 실패:', error);
    }
  };

  // localStorage에 설정 저장하기
  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      checkStoredSettings();
      alert('설정이 저장되었습니다!');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  // localStorage에서 설정 삭제하기
  const clearSettings = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setFormData({
        spaceId: "",
        apiKey: "",
        listId: "",
        endpoint: "https://api.clickup.com/api/v2/list/{listId}/task?include_closed=true&limit=100",
        fetchAllPages: true,
      });
      checkStoredSettings();
      alert('설정이 초기화되었습니다!');
    } catch (error) {
      console.error('설정 초기화 실패:', error);
      alert('설정 초기화에 실패했습니다.');
    }
  };

  // 설정을 JSON 파일로 내보내기
  const exportSettings = () => {
    try {
      const dataStr = JSON.stringify(formData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'clickup_api_settings.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('설정 내보내기 실패:', error);
      alert('설정 내보내기에 실패했습니다.');
    }
  };

  // JSON 파일에서 설정 가져오기
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const importedSettings = JSON.parse(result);
          setFormData(importedSettings);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(importedSettings));
          checkStoredSettings();
          alert('설정을 성공적으로 가져왔습니다!');
        }
      } catch (error) {
        console.error('설정 가져오기 실패:', error);
        alert('유효하지 않은 설정 파일입니다.');
      }
    };
    reader.readAsText(file);
    // 파일 입력 초기화
    event.target.value = '';
  };

  // 컴포넌트 마운트 시 저장된 설정 불러오기
  useEffect(() => {
    loadSettings();
    checkStoredSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);

    // 자동 저장이 활성화된 경우
    if (autoSave) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFormData));
        checkStoredSettings();
      } catch (error) {
        console.error('자동 저장 실패:', error);
      }
    }
  };

  const handleEndpointSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEndpoint = predefinedEndpoints.find(ep => ep.name === e.target.value);
    if (selectedEndpoint) {
      const newFormData = {
        ...formData,
        endpoint: selectedEndpoint.url,
        fetchAllPages: selectedEndpoint.fetchAllPages || false,
      };
      setFormData(newFormData);

      // 자동 저장이 활성화된 경우
      if (autoSave) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newFormData));
          checkStoredSettings();
        } catch (error) {
          console.error('자동 저장 실패:', error);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.apiKey || !formData.endpoint) {
      setApiResponse({
        loading: false,
        error: "API Key와 Endpoint는 필수입니다.",
      });
      return;
    }

    setApiResponse({ loading: true });

    try {
      const response = await fetch(`/api/clickup-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "API 요청에 실패했습니다.");
      }

      setApiResponse({
        loading: false,
        data: result,
      });
    } catch (error) {
      setApiResponse({
        loading: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    }
  };

  const clearResponse = () => {
    setApiResponse({ loading: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          ClickUp API 테스트
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                API 설정
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveSettings}
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition duration-200"
                  title="현재 설정을 저장합니다"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={loadSettings}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
                  title="저장된 설정을 불러옵니다"
                >
                  불러오기
                </button>
                <button
                  type="button"
                  onClick={clearSettings}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200"
                  title="설정을 초기화합니다"
                >
                  초기화
                </button>
                <button
                  type="button"
                  onClick={exportSettings}
                  className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-200"
                  title="설정을 JSON 파일로 내보냅니다"
                >
                  내보내기
                </button>
                <label className="px-3 py-1 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md transition duration-200 cursor-pointer">
                  가져오기
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                    title="JSON 파일에서 설정을 가져옵니다"
                  />
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="endpointSelect"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  API 엔드포인트 선택
                </label>
                <select
                  id="endpointSelect"
                  onChange={handleEndpointSelect}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-3"
                >
                  <option value="">엔드포인트를 선택하세요</option>
                  {predefinedEndpoints.map((endpoint) => (
                    <option key={endpoint.name} value={endpoint.name}>
                      {endpoint.name}
                    </option>
                  ))}
                </select>

                <label
                  htmlFor="endpoint"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  API 엔드포인트 URL
                </label>
                <textarea
                  id="endpoint"
                  name="endpoint"
                  value={formData.endpoint}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="https://api.clickup.com/api/v2/..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {`{spaceId}, {listId} 같은 플레이스홀더를 사용할 수 있습니다`}
                </p>
              </div>

              <div>
                <label
                  htmlFor="apiKey"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  API Key *
                </label>
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="ClickUp Personal Access Token을 입력하세요"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ClickUp Personal Access Token (pk_로 시작하는 토큰)을 입력하세요.
                  <br />
                  토큰 생성: ClickUp → Settings → Apps → API Token
                </p>
              </div>

              <div>
                <label
                  htmlFor="spaceId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Space ID (옵션)
                </label>
                <input
                  type="text"
                  id="spaceId"
                  name="spaceId"
                  value={formData.spaceId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="예: 123456 (숫자만)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  숫자로만 구성된 Space ID를 입력하세요. ClickUp URL에서 확인 가능합니다.
                </p>
              </div>

              <div>
                <label
                  htmlFor="listId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  List ID (옵션)
                </label>
                <input
                  type="text"
                  id="listId"
                  name="listId"
                  value={formData.listId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="예: 987654321 (숫자만)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  숫자로만 구성된 List ID를 입력하세요. ClickUp URL에서 확인 가능합니다.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    자동 저장 활성화
                  </span>
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {hasStoredSettings ? '✓ 저장된 설정 있음' : '저장된 설정 없음'}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-700 rounded-md">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.fetchAllPages || false}
                    onChange={(e) => setFormData({...formData, fetchAllPages: e.target.checked})}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    모든 페이지 가져오기 (100개 이상)
                  </span>
                </label>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {formData.fetchAllPages ? '⚡ 자동 페이지네이션 활성화' : '📄 단일 페이지만'}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={apiResponse.loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  {apiResponse.loading ? "테스트 중..." : "API 테스트"}
                </button>
                
                {(apiResponse.data || apiResponse.error) && (
                  <button
                    type="button"
                    onClick={clearResponse}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                  >
                    초기화
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* 응답 결과 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              API 응답
            </h2>

            <div className="min-h-[400px]">
              {apiResponse.loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {apiResponse.error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-md">
                  <p className="font-medium">오류 발생:</p>
                  <p>{apiResponse.error}</p>
                </div>
              )}

              {apiResponse.data && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 overflow-auto">
                  <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {JSON.stringify(apiResponse.data, null, 2)}
                  </pre>
                </div>
              )}

              {!apiResponse.loading && !apiResponse.error && !apiResponse.data && (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <p>API 테스트 결과가 여기에 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API 정보 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            ClickUp API 정보
          </h3>
          <div className="text-blue-800 dark:text-blue-200 space-y-2">
            <p><strong>Base URL:</strong> https://api.clickup.com/api/v2</p>
            <p><strong>사용 가능한 엔드포인트:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              {predefinedEndpoints.slice(0, -1).map((endpoint) => (
                <li key={endpoint.name}>
                  <strong>{endpoint.name}:</strong> {endpoint.description}
                </li>
              ))}
            </ul>
            <p className="mt-4"><strong>참고:</strong> 
              <br />• API Key는 ClickUp Personal Access Token을 사용하세요 (pk_로 시작)
              <br />• 토큰 생성: ClickUp → Settings → Apps → API Token
              <br />• <strong>완료된 작업 보기:</strong> include_closed=true 파라미터 사용
              <br />• <strong>페이지네이션:</strong> limit (최대 100), page 파라미터로 조정
              <br />• <strong>ID 찾는 방법:</strong>
              <br />  - ClickUp URL 예시: https://app.clickup.com/123456/v/li/987654321
              <br />  - Space ID: 123456 (숫자만)
              <br />  - List ID: 987654321 (숫자만)
              <br />• 잘못된 형식: "8crb1jk-29098" (하이픈이나 문자 포함 불가)
            </p>
          </div>
        </div>

        {/* ClickUp API 파라미터 가이드 */}
        <div className="mt-6 bg-green-50 dark:bg-green-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
            📋 ClickUp API 파라미터 가이드
          </h3>
          <div className="text-green-800 dark:text-green-200 space-y-3">
            <div>
              <p><strong>완료된 작업 포함하기</strong></p>
              <p className="ml-4 text-sm">• <code className="bg-green-200 dark:bg-green-800 px-1 rounded">include_closed=true</code> - 완료/닫힌 작업도 결과에 포함</p>
              <p className="ml-4 text-sm">• 기본값: false (완료된 작업은 제외됨)</p>
            </div>
            <div>
              <p><strong>결과 개수 제한</strong></p>
              <p className="ml-4 text-sm">• <code className="bg-green-200 dark:bg-green-800 px-1 rounded">limit=100</code> - 한 번에 가져올 최대 작업 수 (최대 100개)</p>
              <p className="ml-4 text-sm">• 기본값: 100개</p>
            </div>
            <div>
              <p><strong>🚀 모든 페이지 자동 가져오기</strong></p>
              <p className="ml-4 text-sm">• <code className="bg-green-200 dark:bg-green-800 px-1 rounded">fetchAllPages=true</code> - 100개가 넘는 작업도 자동으로 모두 가져옵니다</p>
              <p className="ml-4 text-sm">• 최대 10페이지(1000개 작업)까지 자동 수집</p>
              <p className="ml-4 text-sm">• API 요청 간 100ms 지연으로 서버 부하 최소화</p>
            </div>
            <div>
              <p><strong>예시 URL:</strong></p>
              <p className="ml-4 text-sm font-mono bg-green-200 dark:bg-green-800 p-2 rounded">
                https://api.clickup.com/api/v2/list/123456789/task?include_closed=true&limit=100&page=0
              </p>
            </div>
          </div>
        </div>

        {/* ID 찾기 도움말 */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
            🔍 ClickUp ID 찾는 방법
          </h3>
          <div className="text-yellow-800 dark:text-yellow-200 space-y-3">
            <div>
              <p><strong>1. ClickUp에서 원하는 리스트로 이동</strong></p>
              <p className="ml-4 text-sm">• 브라우저에서 ClickUp을 열고 테스트하려는 리스트로 이동하세요</p>
            </div>
            <div>
              <p><strong>2. URL에서 ID 확인</strong></p>
              <p className="ml-4 text-sm">• URL 형식: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">https://app.clickup.com/[SPACE_ID]/v/li/[LIST_ID]</code></p>
              <p className="ml-4 text-sm">• 예시: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">https://app.clickup.com/123456/v/li/987654321</code></p>
            </div>
            <div>
              <p><strong>3. ID 추출</strong></p>
              <p className="ml-4 text-sm">• Space ID: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">123456</code> (숫자만)</p>
              <p className="ml-4 text-sm">• List ID: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">987654321</code> (숫자만)</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-md">
              <p><strong>⚠️ 주의:</strong></p>
              <p className="ml-4 text-sm">• ID는 반드시 <strong>숫자만</strong> 포함해야 합니다</p>
              <p className="ml-4 text-sm">• 하이픈(-), 문자, 기타 특수문자는 포함하면 안 됩니다</p>
              <p className="ml-4 text-sm">• 잘못된 예: "8crb1jk-29098", "list_123"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;
