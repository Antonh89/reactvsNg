import type { Todo } from '../types';

const BASE_URL = 'https://jsonplaceholder.typicode.com/todos';
const PRELOAD_COUNT = 20;
const LAST_REMOTE_ID = 200;

export const TODOS_KEY = `${BASE_URL}?_limit=${PRELOAD_COUNT}`;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Échec de la requête ${init?.method ?? 'GET'} ${url} (${response.status})`);
  }

  return (await response.json()) as T;
}

export function fetchTodos(url: string): Promise<Todo[]> {
  return request<Todo[]>(url);
}

export function createTodo(title: string): Promise<Todo> {
  return request<Todo>(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, completed: false, userId: 1 }),
  });
}

export async function toggleTodo(todo: Todo): Promise<Todo> {
  if (todo.id > LAST_REMOTE_ID) {
    return { ...todo, completed: !todo.completed };
  }

  await request<Todo>(`${BASE_URL}/${todo.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !todo.completed }),
  });

  return { ...todo, completed: !todo.completed };
}

export async function removeTodo(todo: Todo): Promise<number> {
  if (todo.id <= LAST_REMOTE_ID) {
    await request<unknown>(`${BASE_URL}/${todo.id}`, { method: 'DELETE' });
  }

  return todo.id;
}

export function nextLocalId(todos: Todo[]): number {
  return todos.reduce((highest, todo) => Math.max(highest, todo.id), LAST_REMOTE_ID) + 1;
}
