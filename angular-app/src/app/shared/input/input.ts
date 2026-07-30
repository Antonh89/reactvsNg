import { Directive, computed, inject } from '@angular/core';
import { FORM_FIELD } from '@angular/forms/signals';

@Directive({
  selector: 'input[appInput]',
  host: {
    class: 'app-input',
    autocomplete: 'off',
    '[class.app-input--invalid]': 'showError()',
    '[attr.aria-invalid]': 'showError() || null',
  },
})
export class AppInput {
  private readonly formField = inject(FORM_FIELD, { optional: true, self: true });

  protected readonly showError = computed(() => {
    const state = this.formField?.state();

    return state ? state.touched() && state.invalid() : false;
  });
}
