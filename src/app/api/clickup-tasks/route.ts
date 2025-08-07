import { NextRequest, NextResponse } from "next/server";

// GET 요청을 처리하는 함수 (Dashboard에서 사용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId');
    const apiKey = searchParams.get('apiKey');
    const listId = searchParams.get('listId');
    const fetchAllPages = searchParams.get('fetchAllPages') === 'true';

    // 입력 검증
    if (!apiKey) {
      return NextResponse.json(
        { error: "apiKey is required" },
        { status: 400 }
      );
    }

    if (!listId) {
      return NextResponse.json(
        { error: "listId is required" },
        { status: 400 }
      );
    }

    // List ID 형식 검증
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

    // 기본 엔드포인트 설정 (모든 상태의 태스크 포함)
    let baseApiUrl = `https://api.clickup.com/api/v2/list/${listId}/task?include_closed=true&limit=100`;

    console.log('🚀 Making ClickUp API request:');
    console.log('📌 URL:', baseApiUrl);
    console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'None');
    console.log('📋 List ID:', listId);
    console.log('📊 Fetch All Pages:', fetchAllPages);

    let allTasks: any[] = [];
    let page = 0;
    let hasMorePages = true;

    // 모든 페이지 가져오기 기능
    const fetchAllTaskPages = async () => {
      while (hasMorePages) {
        const currentUrl = `${baseApiUrl}&page=${page}`;
        console.log(`📄 Fetching page ${page}: ${currentUrl}`);

        const response = await fetch(currentUrl, {
          method: 'GET',
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ ClickUp API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`ClickUp API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const responseText = await response.text();
        
        if (!responseText.trim()) {
          console.log('📭 Empty response received');
          break;
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ JSON parsing error:', parseError);
          console.error('📄 Response text:', responseText.substring(0, 200) + '...');
          throw new Error('Failed to parse JSON response');
        }

        if (data.tasks && Array.isArray(data.tasks)) {
          allTasks = allTasks.concat(data.tasks);
          console.log(`✅ Page ${page}: Found ${data.tasks.length} tasks (Total: ${allTasks.length})`);
          
          // 다음 페이지가 있는지 확인
          if (data.tasks.length < 100) {
            hasMorePages = false;
            console.log('🏁 No more pages available');
          } else {
            page++;
          }
        } else {
          hasMorePages = false;
          console.log('🏁 No tasks in response');
        }

        // 무한 루프 방지
        if (page > 50) {
          console.log('⚠️ Max page limit reached (50)');
          break;
        }
      }

      return allTasks;
    };

    let tasks;
    if (fetchAllPages) {
      tasks = await fetchAllTaskPages();
    } else {
      // 단일 페이지만 가져오기
      const response = await fetch(baseApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ClickUp API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`ClickUp API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseText = await response.text();
      
      if (!responseText.trim()) {
        console.log('📭 Empty response received');
        return NextResponse.json({
          tasks: [],
          totalTasks: 0,
          message: "No tasks found"
        });
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parsing error:', parseError);
        console.error('📄 Response text:', responseText.substring(0, 200) + '...');
        throw new Error('Failed to parse JSON response');
      }

      tasks = data.tasks || [];
    }

    console.log('🎉 Final result:', {
      totalTasks: tasks.length,
      fetchAllPages,
      pagesProcessed: page + 1
    });

    return NextResponse.json({
      tasks,
      totalTasks: tasks.length,
      pagesProcessed: fetchAllPages ? page + 1 : 1,
      fetchAllPages
    });

  } catch (error: any) {
    console.error('💥 API route error:', error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: error.stack
      },
      { status: 500 }
    );
  }
}
