import { Component, input, output } from '@angular/core';

import { Todo } from '../../../core/todo.model';
import { AppButton } from '../../../shared/button/button';
import { AppCheckbox } from '../../../shared/checkbox/checkbox';

@Component({
  selector: 'app-todo-item',
  imports: [AppButton, AppCheckbox],
  templateUrl: './todo-item.html',
  styleUrl: './todo-item.scss',
})
export class TodoItem {
  readonly todo = input.required<Todo>();
  readonly toggled = output<Todo>();
  readonly deleteRequested = output<Todo>();
}
