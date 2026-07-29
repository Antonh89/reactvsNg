import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';

import { Todo } from './todo.model';

const BASE_URL = 'https://jsonplaceholder.typicode.com/todos';
const PRELOAD_COUNT = 20;
const LAST_REMOTE_ID = 200;
const ACTION_DELAY_MS = 2_000;

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);

  getTodos(): Observable<Todo[]> {
    return this.http
      .get<Todo[]>(BASE_URL, { params: { _limit: PRELOAD_COUNT } })
      .pipe(delay(ACTION_DELAY_MS));
  }

  createTodo(title: string): Observable<Todo> {
    return this.http
      .post<Todo>(BASE_URL, { title, completed: false, userId: 1 })
      .pipe(delay(ACTION_DELAY_MS));
  }

  toggleTodo(todo: Todo): Observable<Todo> {
    const updated: Todo = { ...todo, completed: !todo.completed };

    if (todo.id > LAST_REMOTE_ID) {
      return of(updated).pipe(delay(ACTION_DELAY_MS));
    }

    return this.http.patch<Todo>(`${BASE_URL}/${todo.id}`, { completed: updated.completed }).pipe(
      map(() => updated),
      delay(ACTION_DELAY_MS),
    );
  }

  removeTodo(todo: Todo): Observable<number> {
    if (todo.id > LAST_REMOTE_ID) {
      return of(todo.id).pipe(delay(ACTION_DELAY_MS));
    }

    return this.http.delete<unknown>(`${BASE_URL}/${todo.id}`).pipe(
      map(() => todo.id),
      delay(ACTION_DELAY_MS),
    );
  }

  nextLocalId(todos: Todo[]): number {
    return todos.reduce((highest, todo) => Math.max(highest, todo.id), LAST_REMOTE_ID) + 1;
  }
}
