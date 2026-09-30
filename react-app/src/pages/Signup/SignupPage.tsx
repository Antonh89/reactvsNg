import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import styles from "./SignupPage.module.scss";
import {
  CONTACT_PATH,
  signupSchema,
  type SignupFormInput,
  type SignupFormOutput,
} from "./signupSchema";

const SUBMIT_DELAY = 2_000;

const emptyForm: SignupFormInput = {
  email: "",
  phone: "",
  nickname: "",
  password: "",
  confirmPassword: "",
};

function createAccount(account: SignupFormInput): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(account.nickname.trim()), SUBMIT_DELAY));
}

function useSignupForm() {
  const { register: registerRHF, ...form } = useForm<SignupFormInput, unknown, SignupFormOutput>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: emptyForm,
  });

  /**
   * `mode: "onChange"` ne remonte que l'erreur du champ modifié : chaque champ déclare
   * `contact` en dépendance pour que l'alerte globale soit revalidée à chaque frappe.
   */
  const register: typeof registerRHF = (name, options) => {
    let deps: FieldPath<SignupFormInput> | FieldPath<SignupFormInput>[] = [CONTACT_PATH];

    if (!options) {
      return registerRHF(name, { deps });
    }

    if (options.deps) {
      deps = Array.isArray(options.deps) ? [...options.deps, ...deps] : [options.deps, ...deps];
    }

    return registerRHF(name, {
      ...options,
      deps,
    });
  };

  return {
    ...form,
    register,
  };
}

export function SignupPage() {
  const [createdNickname, setCreatedNickname] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useSignupForm();

  const onSubmit = handleSubmit(async (account) => {
    setCreatedNickname(null);
    setCreatedNickname(await createAccount(account));
    reset(emptyForm);
  });

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Inscription</h1>
      <p className={styles.intro}>
        Schéma <code>Zod</code> branché sur react-hook-form via <code>zodResolver</code> :
        validation par champ, règles inter-champs (contact, mots de passe) et bouton actif
        uniquement si tout est valide.
      </p>

      {createdNickname ? (
        <p className={styles.success}>Bienvenue {createdNickname} ! Le compte a été créé.</p>
      ) : null}

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <Input
          label="Adresse email"
          type="email"
          placeholder="prenom.nom@exemple.fr"
          autoComplete="off"
          error={errors.email?.message}
          // {...register("email", { deps: [CONTACT_PATH] })}
          {...register("email")}
        />

        <Input
          label="Numéro de téléphone (optionnel)"
          type="tel"
          placeholder="06 12 34 56 78"
          autoComplete="off"
          error={errors.phone?.message}
          // {...register("phone", { deps: [CONTACT_PATH] })}
          {...register("phone")}
        />

        <Input
          label="Pseudonyme"
          placeholder="Comment doit-on vous appeler ?"
          autoComplete="off"
          error={errors.nickname?.message}
          //         {...register("nickname", { deps: [CONTACT_PATH] })}
          {...register("nickname")}
        />

        <Input
          label="Mot de passe"
          type="password"
          autoComplete="off"
          error={errors.password?.message}
          // {...register("password", {
          //   deps: ["confirmPassword", CONTACT_PATH],
          // })}
          {...register("password", { deps: ["confirmPassword"] })}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          autoComplete="off"
          error={errors.confirmPassword?.message}
          // {...register("confirmPassword", { deps: [CONTACT_PATH] })}
          {...register("confirmPassword")}
        />

        {errors.contact?.message ? <p className={styles.alert}>{errors.contact.message}</p> : null}

        <Button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Création…" : "Valider"}
        </Button>
      </form>
    </section>
  );
}
