import { z } from "zod";

/** Fixe, mobile, avec ou sans indicatif : 06 12 34 56 78, 01.23.45.67.89, +33 6 12 34 56 78. */
const FRENCH_PHONE = /^(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}$/;

/** Chemin virtuel qui reçoit l'erreur inter-champs « email ou téléphone ». */
export const CONTACT_PATH = "contact";

/** La chaîne vide est acceptée : le contact peut être fourni via le téléphone. */
const OPTIONAL_EMAIL = z.union([
  z.literal(""),
  z.email("Le format de l'adresse email est invalide."),
]);

export const signupSchema = z
  .object({
    email: OPTIONAL_EMAIL,
    phone: z.string().refine((value) => value === "" || FRENCH_PHONE.test(value), {
      message: "Le format du numéro français est invalide (ex. 06 12 34 56 78).",
    }),
    nickname: z.string().min(1, "Le pseudonyme est obligatoire."),
    password: z.string().min(1, "Le mot de passe est obligatoire."),
    confirmPassword: z.string().min(1, "La confirmation du mot de passe est obligatoire."),
  })
  .refine((values) => values.email !== "" || values.phone !== "", {
    message: "Renseignez au moins une adresse email ou un numéro de téléphone.",
    path: [CONTACT_PATH],
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Les deux mots de passe doivent être identiques.",
    path: ["confirmPassword"],
  });

/** Le champ virtuel `contact` n'est jamais saisi : il ne porte qu'une erreur. */
export type SignupFormInput = z.input<typeof signupSchema> & {
  [CONTACT_PATH]?: never;
};

export type SignupFormOutput = z.output<typeof signupSchema>;
