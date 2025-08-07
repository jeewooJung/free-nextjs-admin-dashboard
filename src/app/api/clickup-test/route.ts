import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { spaceId, apiKey, listId, endpoint } = await request.json();

    // 입력 검증
    if (!apiKey) {
      return NextResponse.json(
        { error: "apiKey is required" },
        { status: 400 }
      );
    }

    // List ID 형식 검증 (엔드포인트에 {listId}가 포함된 경우)
    if (endpoint && endpoint.includes('{listId}') && listId) {
      // ClickUp List ID는 보통 숫자로만 구성됩니다
      if (!/^\d+$/.test(listId)) {
        return NextResponse.json(
          { 
            error: "Invalid List ID format",
            details: "List ID should contain only numbers (e.g., '123456789')",
            providedListId: listId
          },
          { status: 400 }
        );
      }
    }

    // Space ID 형식 검증 (엔드포인트에 {spaceId}가 포함된 경우)
    if (endpoint && endpoint.includes('{spaceId}') && spaceId) {
      // ClickUp Space ID도 보통 숫자로만 구성됩니다
      if (!/^\d+$/.test(spaceId)) {
        return NextResponse.json(
          { 
            error: "Invalid Space ID format",
            details: "Space ID should contain only numbers (e.g., '123456')",
            providedSpaceId: spaceId
          },
          { status: 400 }
        );
      }
    }

    // 기본 엔드포인트 설정
    let apiUrl = endpoint || `https://api.clickup.com/api/v2/list/${listId}/task`;
    
    // 동적 파라미터 치환
    if (spaceId) {
      apiUrl = apiUrl.replace('{spaceId}', spaceId);
    }
    if (listId) {
      apiUrl = apiUrl.replace('{listId}', listId);
    }

    // ClickUp API 호출
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // ClickUp API는 여러 인증 방식을 지원합니다
    // 1. Bearer 토큰 방식 (Personal Access Token)
    // 2. 직접 Authorization 헤더에 API 키
    if (apiKey.startsWith('pk_')) {
      // Personal Access Token인 경우
      requestHeaders["Authorization"] = apiKey;
    } else {
      // 일반 API 키인 경우 Bearer 방식 시도
      requestHeaders["Authorization"] = `Bearer ${apiKey}`;
    }

    console.log('Making request to:', apiUrl);
    console.log('Request headers:', {
      ...requestHeaders,
      Authorization: requestHeaders.Authorization.substring(0, 20) + '...'
    });

    const clickupResponse = await fetch(apiUrl, {
      method: "GET",
      headers: requestHeaders,
    });

    if (!clickupResponse.ok) {
      let errorData;
      try {
        // JSON 응답인지 먼저 확인
        const contentType = clickupResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await clickupResponse.json();
        } else {
          errorData = await clickupResponse.text();
        }
      } catch (parseError) {
        errorData = 'Failed to parse error response';
      }

      console.error('ClickUp API Error Details:', {
        status: clickupResponse.status,
        statusText: clickupResponse.statusText,
        headers: Object.fromEntries(clickupResponse.headers.entries()),
        errorData,
        requestUrl: apiUrl,
        requestHeaders: {
          ...requestHeaders,
          Authorization: requestHeaders.Authorization.substring(0, 20) + '...'
        }
      });

      return NextResponse.json(
        { 
          error: `ClickUp API Error: ${clickupResponse.status} ${clickupResponse.statusText}`,
          details: errorData,
          requestUrl: apiUrl
        },
        { status: clickupResponse.status }
      );
    }

    const data = await clickupResponse.json();

    return NextResponse.json({
      success: true,
      data: data,
      requestInfo: {
        spaceId,
        listId,
        endpoint: apiUrl,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("API Test Error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
