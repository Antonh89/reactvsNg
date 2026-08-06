import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const SEED_FILE = join(import.meta.dirname, "todos.json");

/** Unique source de vérité : le tableau reste en mémoire, rien n'est réécrit sur le disque. */
let todos: Todo[] = [];

/** Appelé une fois au démarrage du serveur. */
export function loadTodos(): number {
  todos = JSON.parse(readFileSync(SEED_FILE, "utf8")) as Todo[];

  return todos.length;
}

export function listTodos(): Todo[] {
  return todos;
}

export function findTodo(id: number): Todo | undefined {
  return todos.find((todo) => todo.id === id);
}

export function insertTodo(input: Omit<Todo, "id">): Todo {
  // Champs listés dans l'ordre de jsonplaceholder pour que toutes les réponses se ressemblent.
  const created: Todo = {
    userId: input.userId,
    id: nextId(),
    title: input.title,
    completed: input.completed,
  };

  todos = [created, ...todos];

  return created;
}

export function updateTodo(
  id: number,
  changes: Partial<Omit<Todo, "id">>
): Todo | undefined {
  const existing = findTodo(id);

  if (!existing) {
    return undefined;
  }

  Object.assign(existing, changes);

  return existing;
}

export function removeTodo(id: number): boolean {
  const index = todos.findIndex((todo) => todo.id === id);

  if (index === -1) {
    return false;
  }

  todos.splice(index, 1);

  return true;
}

function nextId(): number {
  return todos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
}
