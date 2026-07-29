import { Component, input, model, output } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
})
export class AppCheckbox implements FormCheckboxControl {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly touch = output<void>();

  readonly label = input.required<string>();
  readonly controlId = input('app-checkbox');
  readonly struck = input(false);

  protected onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
