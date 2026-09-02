/* 오늘할일: Supabase 직접 연결을 통한 데이터 접근 계층. */
import { createClient } from '@supabase/supabase-js';

export type Todo = { id: number; title: string; content: string; dueDate: string; completed: boolean; category: string };
export type TodoDraft = Omit<Todo, "id" | "completed">;
export type TodoPage = { content: Todo[]; totalElements: number; totalPages: number; number: number; size: number };

const supabaseUrl = 'https://pumygnxmylpwujkmbjox.supabase.co';
const supabaseKey = 'sb_publishable_GjwudSxg3IomE1x58qbeMg_2lbXHPdi';
export const supabase = createClient(supabaseUrl, supabaseKey);

export const todosApi = {
  async list(page: number, size: number, status: "all" | "open" | "done", query: string) {
    let request = supabase
      .from('todos')
      .select('*', { count: 'exact' });

    if (status !== 'all') {
      request = request.eq('completed', status === 'done');
    }
    if (query.trim()) {
      request = request.ilike('title', `%${query.trim()}%`);
    }

    const from = (page - 1) * size;
    const to = from + size - 1;

    const { data, error, count } = await request
      .order('due_date', { ascending: true })
      .range(from, to);

    if (error) throw new Error(error.message);

    const content = (data || []).map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      dueDate: row.due_date || row.dueDate, 
      completed: row.completed,
      category: row.category
    }));

    return {
      content,
      totalElements: count || 0,
      totalPages: Math.ceil((count || 0) / size),
      number: page - 1,
      size
    };
  },
  
  async create(draft: TodoDraft) {
    const { data, error } = await supabase
      .from('todos')
      .insert([{
        title: draft.title,
        content: draft.content,
        due_date: draft.dueDate,
        category: draft.category,
        completed: false
      }])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return { ...data, dueDate: data.due_date || data.dueDate };
  },

  async update(id: number, draft: TodoDraft) {
    const { data, error } = await supabase
      .from('todos')
      .update({
        title: draft.title,
        content: draft.content,
        due_date: draft.dueDate,
        category: draft.category
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return { ...data, dueDate: data.due_date || data.dueDate };
  },

  async toggle(id: number, completed: boolean) {
    const { data, error } = await supabase
      .from('todos')
      .update({ completed })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return { ...data, dueDate: data.due_date || data.dueDate };
  },

  async remove(id: number) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  }
};
