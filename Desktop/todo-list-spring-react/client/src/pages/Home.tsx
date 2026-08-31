/* 오늘할일: Spring Boot API와 연결된 종이 질감의 편집 디자인 생산성 화면. */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Clock3, Inbox, LayoutList, Plus, Search, SlidersHorizontal, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Todo, todosApi } from "@/lib/todos-api";

const formatDate = (value: string) => new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const isSoon = (todo: Todo) => !todo.completed && new Date(todo.dueDate).getTime() - Date.now() <= 86400000 && new Date(todo.dueDate).getTime() >= Date.now();

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [form, setForm] = useState({ title: "", content: "", dueDate: "2026-08-28T18:00", category: "업무" });
  const pageSize = 4;
  const openCount = todos.filter(t => !t.completed).length;
  const soonCount = todos.filter(isSoon).length;
  const completedCount = todos.filter(t => t.completed).length;
  const shownCount = todos.length;
  const refresh = async () => { setLoading(true); setError(""); try { const result = await todosApi.list(page, pageSize, filter, query); setTodos(result.content); setTotalPages(Math.max(1, result.totalPages)); setTotalElements(result.totalElements); } catch (err) { setError(err instanceof Error ? err.message : "API에 연결할 수 없습니다."); } finally { setLoading(false); } };
  useEffect(() => { void refresh(); }, [page, filter, query]);
  const displayed = useMemo(() => todos, [todos]);
  const openCreate = () => { setEditing(null); setForm({ title: "", content: "", dueDate: "2026-08-28T18:00", category: "업무" }); setShowForm(true); };
  const openEdit = (todo: Todo) => { setEditing(todo); setForm({ title: todo.title, content: todo.content, dueDate: todo.dueDate.slice(0, 16), category: todo.category || "업무" }); setShowForm(true); };
  const submit = async () => { if (!form.title.trim()) return toast.error("제목을 입력해 주세요."); try { if (editing) await todosApi.update(editing.id, form); else await todosApi.create(form); setShowForm(false); toast.success(editing ? "기록을 수정했습니다." : "DB에 기록을 저장했습니다."); await refresh(); } catch (err) { toast.error(err instanceof Error ? err.message : "저장에 실패했습니다."); } };
  const toggle = async (todo: Todo) => { try { await todosApi.toggle(todo.id, !todo.completed); toast.success("상태를 업데이트했습니다."); await refresh(); } catch (err) { toast.error(err instanceof Error ? err.message : "상태 변경에 실패했습니다."); } };
  const remove = async (id: number) => { if (!window.confirm("이 기록을 삭제할까요?")) return; try { await todosApi.remove(id); toast.success("기록을 삭제했습니다."); await refresh(); } catch (err) { toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다."); } };
  const chooseFilter = (next: "all" | "open" | "done") => { setFilter(next); setPage(1); };

  return <div className="ledger-shell">
    <aside className="index-rail"><div className="brand-lockup"><img src="/manus-storage/paper-ledger-logo_d2e58458.png" alt="오늘할일" /><span>오늘<br /><b>할일</b></span></div><div className="rail-rule" /><p className="eyebrow">INDEX / 08—26</p><nav className="rail-nav" aria-label="목록 필터"><button className={filter === "all" ? "active" : ""} onClick={() => chooseFilter("all")}><LayoutList size={16} /> 전체 기록 <span>{filter === "all" ? totalElements : "—"}</span></button><button className={filter === "open" ? "active" : ""} onClick={() => chooseFilter("open")}><Inbox size={16} /> 진행 중 <span>{filter === "open" ? totalElements : "—"}</span></button><button className={filter === "done" ? "active" : ""} onClick={() => chooseFilter("done")}><Check size={16} /> 완료됨 <span>{filter === "done" ? totalElements : "—"}</span></button></nav><div className="rail-note"><span className="dot coral" /><div><b>오늘의 여백</b><p>한 번에 하나씩,<br />다음 기록으로.</p></div></div><div className="rail-footer"><span>v 1.0.0</span><span>API LEDGER</span></div></aside>
    <main className="ledger-main"><header className="topbar"><div><p className="eyebrow">FRIDAY · AUGUST 28, 2026</p><h1>오늘할일<span>.</span></h1></div><Button className="new-button" onClick={openCreate}><Plus size={18} /> 새 기록</Button></header><section className="intro-row"><div><p className="intro-copy">해야 할 일을 쌓아두지 않고,<br /><em>한 줄씩 선명하게</em> 정리합니다.</p></div><div className="stats-strip"><div><span>OPEN ITEMS</span><strong>{String(openCount).padStart(2, "0")}</strong></div><div><span>DUE SOON</span><strong className="coral-text">{String(soonCount).padStart(2, "0")}</strong></div><div><span>COMPLETED</span><strong>{String(completedCount).padStart(2, "0")}</strong></div></div></section><section className="toolbar"><div className="search-wrap"><Search size={16} /><Input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="기록에서 찾기" aria-label="Todo 검색" /></div><button className="filter-button"><SlidersHorizontal size={15} /> 정렬: 마감일순</button></section><div className="list-heading"><span>YOUR RECORDS / {String(totalElements).padStart(2, "0")}</span><span>STATUS · DUE DATE</span></div><section className="todo-list">{loading ? <div className="empty-state"><div className="api-loader" /><h2>기록을 불러오는 중입니다.</h2><p>Spring Boot API와 동기화하고 있습니다.</p></div> : error ? <div className="empty-state"><h2>API에 연결하지 못했습니다.</h2><p>{error}</p><Button onClick={() => void refresh()}>다시 시도</Button></div> : displayed.length === 0 ? <div className="empty-state"><h2>아직 남겨진 기록이 없습니다.</h2><p>새 기록을 남기고 오늘의 흐름을 시작하세요.</p><Button onClick={openCreate}><Plus size={16} /> 첫 기록 남기기</Button></div> : displayed.map((todo, index) => <article className={`todo-row ${todo.completed ? "completed" : ""}`} key={todo.id} style={{ animationDelay: `${index * 45}ms` }}><button className="check-button" onClick={() => void toggle(todo)} aria-label={todo.completed ? "미완료로 변경" : "완료 처리"}>{todo.completed && <Check size={15} strokeWidth={3} />}</button><div className="todo-copy" onClick={() => openEdit(todo)}><div className="todo-title-line"><h2>{todo.title}</h2><Badge>{todo.category}</Badge>{isSoon(todo) && <Badge className="soon-badge"><Clock3 size={12} /> 임박</Badge>}</div><p>{todo.content}</p></div><div className="todo-meta"><span className={isSoon(todo) ? "due-soon" : ""}>{formatDate(todo.dueDate)}</span><div className="row-actions"><button onClick={() => openEdit(todo)} aria-label="수정">편집</button><button onClick={() => void remove(todo.id)} aria-label="삭제"><Trash2 size={15} /></button></div></div></article>)}</section><footer className="list-footer"><span>SHOWING {shownCount} OF {totalElements}</span><div className="pagination"><button disabled={page === 1 || loading} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button><b>{page} <i>/ {totalPages}</i></b><button disabled={page === totalPages || loading} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button></div></footer></main>
    {showForm && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowForm(false)}><div className="record-modal"><button className="close-modal" onClick={() => setShowForm(false)}><X size={18} /></button><p className="eyebrow">{editing ? "EDIT RECORD" : "NEW RECORD"}</p><h2>{editing ? "기록을 다시 다듬습니다." : "다음 기록을 남깁니다."}</h2><label>제목<Input autoFocus value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="예: 팀 회고 메모 공유" /></label><label>내용<Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="이 일을 시작하기 전에 기억할 맥락을 적어주세요." /></label><div className="form-grid"><label>마감일<Input type="datetime-local" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></label><label>카테고리<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>업무</option><option>리서치</option><option>개인</option><option>학습</option></select></label></div><Button className="save-button" onClick={() => void submit()}><Sparkles size={16} /> {editing ? "수정 내용 저장" : "기록 남기기"}</Button></div></div>}
  </div>;
}
