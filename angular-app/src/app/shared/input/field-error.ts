import { Directive, computed, input } from '@angular/core';
import { Field } from '@angular/forms/signals';

@Directive({
  selector: '[appFieldError]',
  host: {
    class: 'app-field__error',
    role: 'alert',
    '[hidden]': '!message()',
    '[textContent]': 'message()',
  },
})
export class AppFieldError<TValue> {
  readonly field = input.required<Field<TValue>>({ alias: 'appFieldError' });

  protected readonly message = computed(() => {
    const state = this.field()();

    if (!state.touched() || state.errors().length === 0) {
      return '';
    }

    return state.errors()[0].message ?? 'Valeur invalide.';
  });
}
