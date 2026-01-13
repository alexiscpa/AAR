const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const token = this.getToken();
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || "Request failed");
    }

    return response.json();
  }

  // Auth
  auth = {
    register: (data: { email: string; password: string; name: string }) =>
      this.request<{ user: User; token: string }>("/auth/register", { method: "POST", body: data }),

    login: (data: { email: string; password: string }) =>
      this.request<{ user: User; token: string }>("/auth/login", { method: "POST", body: data }),

    me: () => this.request<User>("/auth/me"),
  };

  // Courses
  courses = {
    list: () => this.request<Course[]>("/courses"),

    get: (id: number) => this.request<Course>(`/courses/${id}`),

    create: (data: CourseCreate) =>
      this.request<Course>("/courses", { method: "POST", body: data }),

    update: (id: number, data: CourseUpdate) =>
      this.request<Course>(`/courses/${id}`, { method: "PATCH", body: data }),

    delete: (id: number) =>
      this.request<{ success: boolean }>(`/courses/${id}`, { method: "DELETE" }),

    stats: () => this.request<CourseStats>("/courses/stats"),
  };

  // Knowledge Points
  knowledgePoints = {
    listByCourse: (courseId: number) =>
      this.request<KnowledgePoint[]>(`/knowledge-points/course/${courseId}`),

    create: (data: KnowledgePointCreate) =>
      this.request<KnowledgePoint>("/knowledge-points", { method: "POST", body: data }),

    update: (id: number, data: KnowledgePointUpdate) =>
      this.request<KnowledgePoint>(`/knowledge-points/${id}`, { method: "PATCH", body: data }),

    delete: (id: number) =>
      this.request<{ success: boolean }>(`/knowledge-points/${id}`, { method: "DELETE" }),
  };

  // Action Items
  actionItems = {
    listByCourse: (courseId: number) =>
      this.request<ActionItem[]>(`/action-items/course/${courseId}`),

    listByUser: () =>
      this.request<ActionItemWithCourse[]>("/action-items"),

    create: (data: ActionItemCreate) =>
      this.request<ActionItem>("/action-items", { method: "POST", body: data }),

    update: (id: number, data: ActionItemUpdate) =>
      this.request<ActionItem>(`/action-items/${id}`, { method: "PATCH", body: data }),

    delete: (id: number) =>
      this.request<{ success: boolean }>(`/action-items/${id}`, { method: "DELETE" }),

    stats: () => this.request<ActionItemStats>("/action-items/stats"),
  };

  // Review Logs
  reviewLogs = {
    listByCourse: (courseId: number) =>
      this.request<ReviewLog[]>(`/review-logs/course/${courseId}`),

    listByUser: () =>
      this.request<ReviewLogWithCourse[]>("/review-logs"),

    create: (data: ReviewLogCreate) =>
      this.request<ReviewLog>("/review-logs", { method: "POST", body: data }),

    update: (id: number, data: ReviewLogUpdate) =>
      this.request<ReviewLog>(`/review-logs/${id}`, { method: "PATCH", body: data }),

    delete: (id: number) =>
      this.request<{ success: boolean }>(`/review-logs/${id}`, { method: "DELETE" }),
  };

  // Tags
  tags = {
    list: () => this.request<Tag[]>("/tags"),

    create: (data: TagCreate) =>
      this.request<Tag>("/tags", { method: "POST", body: data }),

    delete: (id: number) =>
      this.request<{ success: boolean }>(`/tags/${id}`, { method: "DELETE" }),

    listByCourse: (courseId: number) =>
      this.request<CourseTagResponse[]>(`/tags/course/${courseId}`),

    addToCourse: (data: { courseId: number; tagId: number }) =>
      this.request<{ success: boolean }>("/tags/course", {
        method: "POST",
        body: { course_id: data.courseId, tag_id: data.tagId },
      }),

    removeFromCourse: (courseId: number, tagId: number) =>
      this.request<{ success: boolean }>(`/tags/course/${courseId}/tag/${tagId}`, {
        method: "DELETE",
      }),
  };
}

export const api = new ApiClient();

// Types
export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Course {
  id: number;
  user_id: number;
  title: string;
  platform: string | null;
  instructor: string | null;
  description: string | null;
  course_url: string | null;
  purchase_date: string | null;
  status: "not-started" | "in-progress" | "completed";
  progress_percentage: number;
  completed_chapters: number;
  total_chapters: number;
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export interface CourseCreate {
  title: string;
  platform?: string;
  instructor?: string;
  purchase_date?: string;
  course_url?: string;
  description?: string;
  total_chapters?: number;
}

export interface CourseUpdate {
  title?: string;
  platform?: string;
  instructor?: string;
  status?: "not-started" | "in-progress" | "completed";
  progress_percentage?: number;
  completed_chapters?: number;
  total_chapters?: number;
  priority?: "low" | "medium" | "high";
  description?: string;
  course_url?: string;
}

export interface CourseStats {
  total: number;
  completed: number;
  in_progress: number;
  not_started: number;
}

export interface KnowledgePoint {
  id: number;
  course_id: number;
  title: string;
  content: string | null;
  summary: string | null;
  personal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgePointCreate {
  course_id: number;
  title: string;
  content?: string;
  summary?: string;
  personal_notes?: string;
}

export interface KnowledgePointUpdate {
  title?: string;
  content?: string;
  summary?: string;
  personal_notes?: string;
}

export interface ActionItem {
  id: number;
  course_id: number;
  knowledge_point_id: number | null;
  user_id: number;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  completed: boolean;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionItemWithCourse {
  action_item: ActionItem;
  course: Course | null;
}

export interface ActionItemCreate {
  course_id: number;
  knowledge_point_id?: number;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  due_date?: string;
}

export interface ActionItemUpdate {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  completed?: boolean;
  due_date?: string;
}

export interface ActionItemStats {
  total: number;
  completed: number;
  pending: number;
}

export interface ReviewLog {
  id: number;
  course_id: number;
  user_id: number;
  title: string;
  reflection: string | null;
  application_insights: string | null;
  key_takeaways: string | null;
  emotional_indicator: number;
  review_date: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewLogWithCourse {
  review_log: ReviewLog;
  course: Course | null;
}

export interface ReviewLogCreate {
  course_id: number;
  title: string;
  reflection?: string;
  application_insights?: string;
  key_takeaways?: string;
  emotional_indicator?: number;
  review_date?: string;
}

export interface ReviewLogUpdate {
  title?: string;
  reflection?: string;
  application_insights?: string;
  key_takeaways?: string;
  emotional_indicator?: number;
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  color: string | null;
  category: string | null;
  created_at: string;
}

export interface TagCreate {
  name: string;
  color?: string;
  category?: string;
}

export interface CourseTagResponse {
  course_tag_id: number;
  tag: Tag;
}
