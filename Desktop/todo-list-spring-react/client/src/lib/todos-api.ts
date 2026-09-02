/* 오늘할일: Spring Boot REST API와 실제 DB를 연결하는 단일 데이터 접근 계층. (서버 연결 실패 시 로컬 스토리지로 자동 대체) */
export type Todo = { id: number; title: string; content: string; dueDate: string; completed: boolean; category: string };
export type TodoDraft = Omit<Todo, "id" | "completed">;
export type TodoPage = { content: Todo[]; totalElements: number; totalPages: number; number: number; size: number };

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// Local Mock DB
const getLocalTodos = (): Todo[] => JSON.parse(localStorage.getItem("mock_todos") || "[]");
const saveLocalTodos = (todos: Todo[]) => localStorage.setItem("mock_todos", JSON.stringify(todos));

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, ...init });

    // 401/403은 에러로 던짐 (인증 문제)
    if (response.status === 401 || response.status === 403) {
      let detail = "인증이 필요합니다.";
      try { const body = await response.json(); detail = body.message || body.error || detail; } catch { /* plain response */ }
      throw new Error(`${response.status}: ${detail}`);
    }

    // 그 외 응답이 정상이 아니거나 JSON이 아닌 경우 → Mock fallback
    if (!response.ok) {
      return handleMockRequest<T>(path, init);
    }

    if (response.status === 204) return undefined as T;

    // Content-Type 확인 — JSON이 아니면 Mock fallback
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return handleMockRequest<T>(path, init);
    }

    return response.json() as Promise<T>;
  } catch (err: any) {
    // 네트워크 에러 또는 JSON 파싱 에러 → Mock fallback
    return handleMockRequest<T>(path, init);
  }
}

// Mock Request Handler
async function handleMockRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method || "GET";
  let todos = getLocalTodos();
  
  if (path.startsWith("/api/todos")) {
    if (method === "GET") {
      const url = new URL(`http://localhost${path}`);
      const status = url.searchParams.get("status");
      const query = url.searchParams.get("query")?.toLowerCase();
      
      let filtered = todos;
      if (status === "OPEN") filtered = filtered.filter(t => !t.completed);
      if (status === "COMPLETED") filtered = filtered.filter(t => t.completed);
      if (query) filtered = filtered.filter(t => t.title.toLowerCase().includes(query) || t.content.toLowerCase().includes(query));
      
      return { content: filtered, totalElements: filtered.length, totalPages: 1, number: 0, size: 10 } as any;
    }
    
    if (method === "POST") {
      const draft = JSON.parse(init!.body as string) as TodoDraft;
      const newTodo = { ...draft, id: Date.now(), completed: false };
      saveLocalTodos([...todos, newTodo]);
      return newTodo as any;
    }

    const idMatch = path.match(/\/api\/todos\/(\d+)/);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const index = todos.findIndex(t => t.id === id);
      
      if (method === "PUT" && index > -1) {
        const draft = JSON.parse(init!.body as string) as TodoDraft;
        todos[index] = { ...todos[index], ...draft };
        saveLocalTodos(todos);
        return todos[index] as any;
      }
      
      if (method === "PATCH" && path.endsWith("/complete") && index > -1) {
        const body = JSON.parse(init!.body as string);
        todos[index].completed = body.completed;
        saveLocalTodos(todos);
        return todos[index] as any;
      }
      
      if (method === "DELETE" && index > -1) {
        todos.splice(index, 1);
        saveLocalTodos(todos);
        return undefined as any;
      }
    }
  }
  throw new Error("Mock API Not Implemented");
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
