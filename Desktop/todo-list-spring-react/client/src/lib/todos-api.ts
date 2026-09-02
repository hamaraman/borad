/* 오늘할일: Spring Boot REST API와 실제 DB를 연결하는 단일 데이터 접근 계층. */
export type Todo = { id: number; title: string; content: string; dueDate: string; completed: boolean; category: string };
export type TodoDraft = Omit<Todo, "id" | "completed">;
export type TodoPage = { content: Todo[]; totalElements: number; totalPages: number; number: number; size: number };

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, ...init });
  if (!response.ok) {
    let detail = "요청을 처리하지 못했습니다.";
    try { const body = await response.json(); detail = body.message || body.error || detail; } catch { /* plain response */ }
    throw new Error(`${response.status}: ${detail}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const todosApi = {
  async list(page: number, size: number, status: "all" | "open" | "done", query: string) {
    const params = new URLSearchParams({ page: String(page - 1), size: String(size), sort: "dueDate,asc" });
    if (status !== "all") params.set("status", status === "open" ? "OPEN" : "COMPLETED");
    if (query.trim()) params.set("query", query.trim());
    const result = await request<TodoPage | Todo[]>(`/api/todos?${params}`);
    return Array.isArray(result) ? { content: result, totalElements: result.length, totalPages: 1, number: 0, size } : result;
  },
  create: (draft: TodoDraft) => request<Todo>("/api/todos", { method: "POST", body: JSON.stringify(draft) }),
  update: (id: number, draft: TodoDraft) => request<Todo>(`/api/todos/${id}`, { method: "PUT", body: JSON.stringify(draft) }),
  toggle: (id: number, completed: boolean) => request<Todo>(`/api/todos/${id}/complete`, { method: "PATCH", body: JSON.stringify({ completed }) }),
  remove: (id: number) => request<void>(`/api/todos/${id}`, { method: "DELETE" }),
};
