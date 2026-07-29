import { Card } from "../../components/Card/Card";
import styles from "./HomePage.module.scss";

const cards = [
  {
    to: "/counter",
    title: "Compteur",
    text: "useState et gestion d’événements onClick : incrémenter, décrémenter, réinitialiser.",
  },
  {
    to: "/todos",
    title: "TodoList",
    text: "SWR pour le chargement et les mutations, react-hook-form pour la saisie, Radix UI pour la modale.",
  },
];

export function HomePage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Démo React 19</h1>
      <p className={styles.intro}>
        Version React de la comparaison. React Router pour le routage,
        react-hook-form pour les formulaires, SWR pour les données, Radix UI
        pour la modale, CSS Modules et SCSS pour les styles.
      </p>

      <div className={styles.cards}>
        {cards.map((card) => (
          <Card
            key={card.to}
            to={card.to}
            title={card.title}
            text={card.text}
          />
        ))}
      </div>
    </section>
  );
}
