import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { Todo } from './todo.model';

const BASE_URL = 'https://jsonplaceholder.typicode.com/todos';
const PRELOAD_COUNT = 20;
const LAST_REMOTE_ID = 200;

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(BASE_URL, { params: { _limit: PRELOAD_COUNT } });
  }

  createTodo(title: string): Observable<Todo> {
    return this.http.post<Todo>(BASE_URL, { title, completed: false, userId: 1 });
  }

  toggleTodo(todo: Todo): Observable<Todo> {
    const updated: Todo = { ...todo, completed: !todo.completed };

    if (todo.id > LAST_REMOTE_ID) {
      return of(updated);
    }

    return this.http
      .patch<Todo>(`${BASE_URL}/${todo.id}`, { completed: updated.completed })
      .pipe(map(() => updated));
  }

  removeTodo(todo: Todo): Observable<number> {
    if (todo.id > LAST_REMOTE_ID) {
      return of(todo.id);
    }

    return this.http.delete<unknown>(`${BASE_URL}/${todo.id}`).pipe(map(() => todo.id));
  }

  nextLocalId(todos: Todo[]): number {
    return todos.reduce((highest, todo) => Math.max(highest, todo.id), LAST_REMOTE_ID) + 1;
  }
}
