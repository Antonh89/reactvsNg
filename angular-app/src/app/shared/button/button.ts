import { Directive, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

@Directive({
  selector: 'button[appButton]',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class AppButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly active = input(false);

  protected readonly hostClasses = computed(() => {
    const classes = ['app-button', `app-button--${this.variant()}`];

    if (this.active()) {
      classes.push('app-button--active');
    }

    return classes.join(' ');
  });
}
