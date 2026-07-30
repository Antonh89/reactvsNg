import { Component } from '@angular/core';
import { AppCard } from '../../shared/card/card';

@Component({
  selector: 'app-home',
  imports: [AppCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {
  protected readonly cards = [
    {
      path: '/counter',
      title: 'Compteur',
      text: 'signal() et liaison (click) : incrémenter, décrémenter, réinitialiser.',
    },
    {
      path: '/signup',
      title: 'Inscription',
      text: 'Formulaire validé par les Signal Forms natives : format email, téléphone français, mots de passe identiques.',
    },
    {
      path: '/todos',
      title: 'TodoList',
      text: 'Service HttpClient et rxResource pour les données, Signal Forms pour la saisie, CDK Dialog pour la modale.',
    },
  ];
}
