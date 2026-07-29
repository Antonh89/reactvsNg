import { useState } from "react";
import { Button } from "../../components/Button/Button";
import styles from "./CounterPage.module.scss";

const STEP = 1;

export function CounterPage() {
  const [count, setCount] = useState(0);

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Compteur</h1>
      <p className={styles.intro}>
        État local avec <code>useState</code>, mis à jour par trois
        gestionnaires <code>onClick</code>.
      </p>

      <div className={styles.card}>
        <output className={styles.value}>{count}</output>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => setCount((value) => value - STEP)}
          >
            − Décrémenter
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCount(0)}
            disabled={count === 0}
          >
            Réinitialiser
          </Button>
          <Button
            variant="primary"
            onClick={() => setCount((value) => value + STEP)}
          >
            + Incrémenter
          </Button>
        </div>
      </div>
    </section>
  );
}
