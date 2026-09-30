import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay } from 'rxjs';

import { Todo } from './todo.model';

const BASE_URL = 'http://localhost:3000/todos';
const ACTION_DELAY_MS = 2_000;

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(BASE_URL).pipe(delay(ACTION_DELAY_MS));
  }

  createTodo(title: string): Observable<Todo> {
    return this.http.post<Todo>(BASE_URL, { title, completed: false }).pipe(delay(ACTION_DELAY_MS));
  }

  toggleTodo(todo: Todo): Observable<Todo> {
    return this.http
      .patch<Todo>(`${BASE_URL}/${todo.id}`, { completed: !todo.completed })
      .pipe(delay(ACTION_DELAY_MS));
  }

  removeTodo(todo: Todo): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${todo.id}`).pipe(delay(ACTION_DELAY_MS));
  }
}
