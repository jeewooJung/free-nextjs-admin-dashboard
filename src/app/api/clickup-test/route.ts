import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { spaceId, apiKey, listId, endpoint, fetchAllPages = false } = await request.json();

    // 입력 검증
    if (!apiKey) {
      return NextResponse.json(
        { error: "apiKey is required" },
        { status: 400 }
      );
    }

    // List ID 형식 검증 (엔드포인트에 {listId}가 포함된 경우)
    if (endpoint && endpoint.includes('{listId}') && listId) {
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
    let baseApiUrl = endpoint || `https://api.clickup.com/api/v2/list/${listId}/task`;
    
    // 동적 파라미터 치환
    if (spaceId) {
      baseApiUrl = baseApiUrl.replace('{spaceId}', spaceId);
    }
    if (listId) {
      baseApiUrl = baseApiUrl.replace('{listId}', listId);
    }

    // 인증 헤더 설정
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey.startsWith('pk_')) {
      requestHeaders["Authorization"] = apiKey;
    } else {
      requestHeaders["Authorization"] = `Bearer ${apiKey}`;
    }

    // 모든 페이지 가져오기 옵션이 활성화된 경우
    if (fetchAllPages && baseApiUrl.includes('/task')) {
      return await fetchAllTaskPages(baseApiUrl, requestHeaders);
    }

    // 단일 페이지 요청
    console.log('Making request to:', baseApiUrl);
    
    const clickupResponse = await fetch(baseApiUrl, {
      method: "GET",
      headers: requestHeaders,
    });

    console.log('Response status:', clickupResponse.status);
    console.log('Response headers:', Object.fromEntries(clickupResponse.headers.entries()));

    if (!clickupResponse.ok) {
      let errorData = null;
      const contentType = clickupResponse.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          const responseText = await clickupResponse.text();
          console.log('Error response text:', responseText);
          
          if (responseText.trim()) {
            errorData = JSON.parse(responseText);
          } else {
            errorData = { message: 'Empty response body' };
          }
        } else {
          errorData = await clickupResponse.text();
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorData = { 
          message: 'Failed to parse error response',
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        };
      }

      return NextResponse.json(
        { 
          error: `ClickUp API Error: ${clickupResponse.status} ${clickupResponse.statusText}`,
          details: errorData,
          requestUrl: baseApiUrl
        },
        { status: clickupResponse.status }
      );
    }

    // 성공 응답 처리
    let data = null;
    const contentType = clickupResponse.headers.get('content-type');
    
    try {
      const responseText = await clickupResponse.text();
      console.log('Success response text length:', responseText.length);
      console.log('Success response preview:', responseText.substring(0, 200));
      
      if (responseText.trim()) {
        if (contentType && contentType.includes('application/json')) {
          data = JSON.parse(responseText);
        } else {
          data = { rawResponse: responseText };
        }
      } else {
        data = { message: 'Empty response body', success: true };
      }
    } catch (parseError) {
      console.error('Failed to parse success response:', parseError);
      return NextResponse.json(
        { 
          error: "Failed to parse ClickUp API response",
          details: {
            parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
            contentType: contentType,
            status: clickupResponse.status
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      requestInfo: {
        spaceId,
        listId,
        endpoint: baseApiUrl,
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

// 모든 페이지의 task를 가져오는 함수
async function fetchAllTaskPages(baseUrl: string, headers: Record<string, string>) {
  const allTasks: any[] = [];
  let page = 0;
  let hasMorePages = true;
  const maxPages = 10; // 안전장치: 최대 10페이지까지만 (1000개 task)
  
  try {
    while (hasMorePages && page < maxPages) {
      // URL에 페이지네이션 파라미터 추가
      const url = new URL(baseUrl);
      
      // 기존 파라미터 유지하면서 페이지 파라미터 추가
      if (!url.searchParams.has('limit')) {
        url.searchParams.set('limit', '100');
      }
      if (!url.searchParams.has('include_closed')) {
        url.searchParams.set('include_closed', 'true');
      }
      url.searchParams.set('page', page.toString());
      
      console.log(`Fetching page ${page}:`, url.toString());
      
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: headers,
      });

      console.log(`Page ${page} response status:`, response.status);

      if (!response.ok) {
        let errorData = null;
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const responseText = await response.text();
            if (responseText.trim()) {
              errorData = JSON.parse(responseText);
            } else {
              errorData = { message: 'Empty error response body' };
            }
          } else {
            errorData = await response.text();
          }
        } catch (parseError) {
          console.error(`Failed to parse error response for page ${page}:`, parseError);
          errorData = { 
            message: 'Failed to parse error response',
            parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
          };
        }

        return NextResponse.json(
          { 
            error: `ClickUp API Error on page ${page}: ${response.status} ${response.statusText}`,
            details: errorData,
            requestUrl: url.toString(),
            collectedTasks: allTasks.length
          },
          { status: response.status }
        );
      }

      // 성공 응답 처리
      let pageData = null;
      const contentType = response.headers.get('content-type');
      
      try {
        const responseText = await response.text();
        console.log(`Page ${page} response text length:`, responseText.length);
        
        if (responseText.trim()) {
          if (contentType && contentType.includes('application/json')) {
            pageData = JSON.parse(responseText);
          } else {
            console.warn(`Page ${page} returned non-JSON response`);
            hasMorePages = false;
            break;
          }
        } else {
          console.warn(`Page ${page} returned empty response`);
          hasMorePages = false;
          break;
        }
      } catch (parseError) {
        console.error(`Failed to parse response for page ${page}:`, parseError);
        return NextResponse.json(
          { 
            error: `Failed to parse page ${page} response`,
            details: {
              parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
              collectedTasks: allTasks.length
            }
          },
          { status: 500 }
        );
      }
      
      if (pageData && pageData.tasks && Array.isArray(pageData.tasks)) {
        allTasks.push(...pageData.tasks);
        console.log(`Page ${page}: collected ${pageData.tasks.length} tasks (total: ${allTasks.length})`);
        
        // 이 페이지에서 가져온 task 수가 limit보다 적으면 마지막 페이지
        const limit = parseInt(url.searchParams.get('limit') || '100');
        if (pageData.tasks.length < limit) {
          hasMorePages = false;
        }
      } else {
        console.log(`Page ${page}: no tasks found or invalid structure`);
        hasMorePages = false;
      }
      
      page++;
      
      // API 부하를 줄이기 위한 짧은 지연
      if (hasMorePages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Completed pagination: ${page} pages, ${allTasks.length} total tasks`);

    return NextResponse.json({
      success: true,
      data: {
        tasks: allTasks,
        totalTasks: allTasks.length,
        pagesCollected: page,
        lastTaskDate: allTasks.length > 0 ? allTasks[allTasks.length - 1]?.date_created : null
      },
      requestInfo: {
        endpoint: baseUrl,
        totalPages: page,
        totalTasks: allTasks.length,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("Error during pagination:", error);
    return NextResponse.json(
      { 
        error: "Error during pagination",
        details: error instanceof Error ? error.message : "Unknown error",
        collectedTasks: allTasks.length,
        pagesProcessed: page
      },
      { status: 500 }
    );
  }
}
