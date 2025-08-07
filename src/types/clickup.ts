// ClickUp API 관련 타입 정의

export interface ClickUpTask {
  id: string;
  custom_id: string | null;
  name: string;
  text_content: string;
  description: string;
  status: {
    id: string;
    status: string;
    color: string;
    type: string;
    orderindex: number;
  };
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed: string | null;
  date_done: string | null;
  assignees: Array<{
    id: number;
    username: string;
    color: string;
    email: string;
    profilePicture: string;
  }>;
  watchers: Array<{
    id: number;
    username: string;
    color: string;
    email: string;
    profilePicture: string;
  }>;
  checklists: Array<any>;
  tags: Array<{
    name: string;
    tag_fg: string;
    tag_bg: string;
  }>;
  parent: string | null;
  priority: {
    id: string;
    priority: string;
    color: string;
    orderindex: string;
  } | null;
  due_date: string | null;
  start_date: string | null;
  points: number | null;
  time_estimate: number | null;
  time_spent: number | null;
  custom_fields: Array<any>;
  dependencies: Array<any>;
  linked_tasks: Array<any>;
  team_id: string;
  url: string;
  sharing: {
    public: boolean;
    public_share_expires_on: string | null;
    public_fields: Array<string>;
    token: string | null;
    seo_optimized: boolean;
  };
  permission_level: string;
  list: {
    id: string;
    name: string;
    access: boolean;
  };
  project: {
    id: string;
    name: string;
    hidden: boolean;
    access: boolean;
  };
  folder: {
    id: string;
    name: string;
    hidden: boolean;
    access: boolean;
  };
  space: {
    id: string;
  };
}

export interface ClickUpTasksResponse {
  tasks: ClickUpTask[];
  last_page: boolean;
}

export interface ClickUpApiTestRequest {
  spaceId: string;
  apiKey: string;
  listId: string;
  endpoint: string;
}

export interface ClickUpApiTestResponse {
  success: boolean;
  data: ClickUpTasksResponse;
  requestInfo: {
    spaceId: string;
    listId: string;
    endpoint: string;
    timestamp: string;
  };
}

export interface ClickUpApiError {
  error: string;
  details?: string;
}
