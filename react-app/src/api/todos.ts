import type { Todo } from "../types";

const BASE_URL = "http://localhost:3000/todos";

export const TODOS_KEY = BASE_URL;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 2_000));
}

async function send(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Échec de la requête ${init?.method ?? "GET"} ${url} (${response.status})`);
  }

  return response;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await send(url, init);

  return (await response.json()) as T;
}

export async function fetchTodos(url: string): Promise<Todo[]> {
  await delay();

  return request<Todo[]>(url);
}

export async function createTodo(title: string): Promise<Todo> {
  await delay();

  return request<Todo>(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, completed: false }),
  });
}

export async function toggleTodo(todo: Todo): Promise<Todo> {
  await delay();

  return request<Todo>(`${BASE_URL}/${todo.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: !todo.completed }),
  });
}

export async function removeTodo(todo: Todo): Promise<void> {
  await delay();

  // L'API répond 204 sans corps : rien à désérialiser.
  await send(`${BASE_URL}/${todo.id}`, { method: "DELETE" });
}
