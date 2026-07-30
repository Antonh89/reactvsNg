import { Component, computed, input } from '@angular/core';
import { Field } from '@angular/forms/signals';

@Component({
  selector: 'app-field-error',
  template: '{{ message() }}',
  styleUrl: './field-error.scss',
  host: {
    role: 'alert',
    '[hidden]': '!message()',
  },
})
export class AppFieldError<TValue> {
  readonly field = input.required<Field<TValue>>();

  protected readonly message = computed(() => {
    const state = this.field()();

    if (!state.touched() || state.errors().length === 0) {
      return '';
    }

    return state.errors()[0].message ?? 'Valeur invalide.';
  });
}
