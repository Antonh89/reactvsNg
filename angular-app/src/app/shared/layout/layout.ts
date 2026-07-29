import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class AppLayout {
  protected readonly links = [
    { path: '/', label: 'Accueil', exact: true },
    { path: '/counter', label: 'Compteur', exact: false },
    { path: '/todos', label: 'TodoList', exact: false },
  ];
}
