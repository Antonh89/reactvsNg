import { Dialog } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormField, FormRoot, form, minLength, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { Todo, TodoFilter } from '../../core/todo.model';
import { TodoService } from '../../core/todo.service';
import { AppButton } from '../../shared/button/button';
import { AppConfirmDialog, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog';
import { AppFieldError } from '../../shared/input/field-error';
import { AppInput } from '../../shared/input/input';
import { TodoItem } from './todo-item/todo-item';

const MIN_TITLE_LENGTH = 3;

@Component({
  selector: 'app-todos',
  imports: [AppButton, AppFieldError, AppInput, FormField, FormRoot, TodoItem],
  templateUrl: './todos.html',
  styleUrl: './todos.scss',
})
export class TodosPage {
  private readonly todoService = inject(TodoService);
  private readonly dialog = inject(Dialog);

  protected readonly filter = signal<TodoFilter>('all');
  protected readonly actionError = signal<string | null>(null);

  protected readonly todosResource = rxResource({
    stream: () => this.todoService.getTodos(),
    defaultValue: [] as Todo[],
  });

  protected readonly newTodo = signal({ title: '' });

  protected readonly addForm = form(
    this.newTodo,
    (path) => {
      required(path.title, { message: 'Le titre est obligatoire.' });
      minLength(path.title, MIN_TITLE_LENGTH, {
        message: `Le titre doit contenir au moins ${MIN_TITLE_LENGTH} caractères.`,
      });
    },
    {
      submission: {
        action: async () => {
          await this.createTodo(this.newTodo().title.trim());
        },
      },
    },
  );

  protected readonly filterOptions: { value: TodoFilter; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'completed', label: 'Complétés' },
    { value: 'remaining', label: 'Restants' },
  ];

  protected readonly isInitialLoading = computed(() => this.todosResource.status() === 'loading');

  protected readonly isRefreshing = computed(() => this.todosResource.status() === 'reloading');

  protected readonly counts = computed(() => {
    const todos = this.todosResource.value();
    const completed = todos.filter((todo) => todo.completed).length;

    return { all: todos.length, completed, remaining: todos.length - completed };
  });

  protected readonly visibleTodos = computed(() => {
    const todos = this.todosResource.value();
    const filter = this.filter();

    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed);
    }

    if (filter === 'remaining') {
      return todos.filter((todo) => !todo.completed);
    }

    return todos;
  });

  protected refreshTodos(): void {
    this.actionError.set(null);
    this.todosResource.reload();
  }

  protected async toggleTodo(todo: Todo): Promise<void> {
    const snapshot = this.todosResource.value();
    this.actionError.set(null);
    this.todosResource.value.update((todos) =>
      todos.map((item) => (item.id === todo.id ? { ...item, completed: !item.completed } : item)),
    );

    try {
      await firstValueFrom(this.todoService.toggleTodo(todo));
    } catch {
      this.todosResource.value.set(snapshot);
      this.actionError.set('La mise à jour a échoué, la liste a été restaurée.');
    }
  }

  protected requestDeletion(todo: Todo): void {
    const dialogRef = this.dialog.open<boolean, ConfirmDialogData, AppConfirmDialog>(
      AppConfirmDialog,
      {
        data: {
          title: 'Supprimer la tâche ?',
          description: `« ${todo.title} » sera retirée de la liste. Cette action est définitive.`,
          confirmLabel: 'Supprimer',
          cancelLabel: 'Annuler',
        },
      },
    );

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        void this.removeTodo(todo);
      }
    });
  }

  private async createTodo(title: string): Promise<void> {
    const snapshot = this.todosResource.value();
    const optimistic: Todo = {
      userId: 1,
      id: this.todoService.nextLocalId(snapshot),
      title,
      completed: false,
    };

    this.actionError.set(null);
    this.todosResource.value.update((todos) => [optimistic, ...todos]);

    try {
      await firstValueFrom(this.todoService.createTodo(title));
      this.newTodo.set({ title: '' });
      this.addForm().reset();
    } catch {
      this.todosResource.value.set(snapshot);
      this.actionError.set("L'ajout a échoué, la liste a été restaurée.");
    }
  }

  private async removeTodo(todo: Todo): Promise<void> {
    const snapshot = this.todosResource.value();
    this.actionError.set(null);
    this.todosResource.value.update((todos) => todos.filter((item) => item.id !== todo.id));

    try {
      await firstValueFrom(this.todoService.removeTodo(todo));
    } catch {
      this.todosResource.value.set(snapshot);
      this.actionError.set('La suppression a échoué, la liste a été restaurée.');
    }
  }
}
