import { Component, signal } from '@angular/core';

import { AppButton } from '../../shared/button/button';

const STEP = 1;

@Component({
  selector: 'app-counter',
  imports: [AppButton],
  templateUrl: './counter.html',
  styleUrl: './counter.scss',
})
export class CounterPage {
  protected readonly count = signal(0);

  protected increment(): void {
    this.count.update((value) => value + STEP);
  }

  protected decrement(): void {
    this.count.update((value) => value - STEP);
  }

  protected reset(): void {
    this.count.set(0);
  }
}
