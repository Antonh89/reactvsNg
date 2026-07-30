import { Component, computed, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';

import { AppButton } from '../../shared/button/button';
import { AppFieldError } from '../../shared/input/field-error';
import { AppInput } from '../../shared/input/input';

interface SignupModel {
  email: string;
  phone: string;
  nickname: string;
  password: string;
  confirmPassword: string;
}

/** Fixe, mobile, avec ou sans indicatif : 06 12 34 56 78, 01.23.45.67.89, +33 6 12 34 56 78. */
const FRENCH_PHONE = /^(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}$/;

const SUBMIT_DELAY = 2_000;

const EMPTY_ACCOUNT: SignupModel = {
  email: '',
  phone: '',
  nickname: '',
  password: '',
  confirmPassword: '',
};

@Component({
  selector: 'app-signup',
  imports: [AppButton, AppFieldError, AppInput, FormField, FormRoot],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupPage {
  protected readonly createdNickname = signal<string | null>(null);

  private readonly newAccount = signal<SignupModel>(EMPTY_ACCOUNT);

  protected readonly signupForm = form(
    this.newAccount,
    (path) => {
      email(path.email, { message: "Le format de l'adresse email est invalide." });

      // `pattern` ignore la valeur vide : le champ reste donc optionnel.
      pattern(path.phone, FRENCH_PHONE, {
        message: 'Le format du numéro français est invalide (ex. 06 12 34 56 78).',
      });

      required(path.nickname, { message: 'Le pseudonyme est obligatoire.' });
      required(path.password, { message: 'Le mot de passe est obligatoire.' });
      required(path.confirmPassword, {
        message: 'La confirmation du mot de passe est obligatoire.',
      });

      // Règle inter-champs portée par la racine : elle ne cible aucun champ en particulier.
      validate(path, ({ value }) => {
        const { email: emailValue, phone } = value();

        if (emailValue !== '' || phone !== '') {
          return undefined;
        }

        return {
          kind: 'contactRequired',
          message: 'Renseignez au moins une adresse email ou un numéro de téléphone.',
        };
      });

      // Règle inter-champs portée par la confirmation : `valueOf` lit le champ voisin.
      validate(path.confirmPassword, ({ value, valueOf }) => {
        if (value() === '' || value() === valueOf(path.password)) {
          return undefined;
        }

        return {
          kind: 'passwordMismatch',
          message: 'Les deux mots de passe doivent être identiques.',
        };
      });
    },
    {
      submission: {
        action: async () => {
          await this.createAccount();
        },
      },
    },
  );

  protected readonly contactError = computed(() => {
    const state = this.signupForm();

    if (!state.touched()) {
      return null;
    }

    return state.errors().find((error) => error.kind === 'contactRequired')?.message ?? null;
  });

  private async createAccount(): Promise<void> {
    const nickname = this.newAccount().nickname.trim();

    this.createdNickname.set(null);
    await new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY));

    this.createdNickname.set(nickname);
    this.signupForm().reset(EMPTY_ACCOUNT);
  }
}
