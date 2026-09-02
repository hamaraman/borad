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
    if (!response.ok) {
      if (response.status === 500 || response.status === 504) throw new Error("Mock");
      let detail = "요청을 처리하지 못했습니다.";
      try { const body = await response.json(); detail = body.message || body.error || detail; } catch { /* plain response */ }
      throw new Error(`${response.status}: ${detail}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  } catch (err: any) {
    if (err.message.includes("Mock") || err.name === "TypeError") {
       // 백엔드가 꺼져있을 때 LocalStorage Fallback 사용
       return handleMockRequest<T>(path, init);
    }
    throw err;
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
