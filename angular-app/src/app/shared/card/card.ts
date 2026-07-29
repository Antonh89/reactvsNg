import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class AppCard {
  readonly title = input.required<string>();
  readonly text = input('');
  readonly link = input<string | null>(null);
}
