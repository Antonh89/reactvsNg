import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/Button/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog/ConfirmDialog";
import { Input } from "../../components/Input/Input";
import { useApiTodos } from "../../hooks/useApiTodos";
import type { Todo, TodoFilter } from "../../types";
import { TodoItem } from "./TodoItem";
import styles from "./TodosPage.module.scss";

interface AddTodoForm {
  title: string;
}

const MIN_TITLE_LENGTH = 3;

const filterOptions: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "completed", label: "Complétés" },
  { value: "remaining", label: "Restants" },
];

export function TodosPage() {
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [pendingDeletion, setPendingDeletion] = useState<Todo | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    todos,
    error,
    isLoading,
    create,
    toggle,
    remove,
    isCreating,
    isRemoving,
  } = useApiTodos();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddTodoForm>({ defaultValues: { title: "" } });

  const counts = useMemo(() => {
    const list = todos ?? [];
    const completed = list.filter((todo) => todo.completed).length;

    return {
      all: list.length,
      completed,
      remaining: list.length - completed,
    };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    const list = todos ?? [];

    if (filter === "completed") {
      return list.filter((todo) => todo.completed);
    }

    if (filter === "remaining") {
      return list.filter((todo) => !todo.completed);
    }

    return list;
  }, [todos, filter]);

  const onSubmit = handleSubmit(async ({ title }) => {
    setActionError(null);

    try {
      await create(title.trim());
      reset();
    } catch {
      setActionError("L'ajout a échoué, la liste a été restaurée.");
    }
  });

  async function handleToggle(todo: Todo) {
    setActionError(null);

    try {
      await toggle(todo);
    } catch {
      setActionError("La mise à jour a échoué, la liste a été restaurée.");
    }
  }

  async function confirmDeletion() {
    if (!pendingDeletion) {
      return;
    }

    setActionError(null);

    try {
      await remove(pendingDeletion);
      setPendingDeletion(null);
    } catch {
      setActionError("La suppression a échoué, la liste a été restaurée.");
      setPendingDeletion(null);
    }
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>TodoList</h1>
      <p className={styles.intro}>
        Chargement via SWR, mutations optimistes via <code>useSWRMutation</code>
        , saisie validée par react-hook-form.
      </p>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <Input
          label="Nouvelle tâche"
          placeholder="Que faut-il faire ?"
          autoComplete="off"
          error={errors.title?.message}
          {...register("title", {
            required: "Le titre est obligatoire.",
            minLength: {
              value: MIN_TITLE_LENGTH,
              message: `Le titre doit contenir au moins ${MIN_TITLE_LENGTH} caractères.`,
            },
          })}
        />
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Ajout…" : "Ajouter"}
        </Button>
      </form>

      <div
        className={styles.filters}
        role="group"
        aria-label="Filtrer par statut"
      >
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant="secondary"
            active={filter === option.value}
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
          >
            {option.label} ({counts[option.value]})
          </Button>
        ))}
      </div>

      {actionError ? <p className={styles.alert}>{actionError}</p> : null}

      {isLoading ? (
        <p className={styles.state}>Chargement des tâches…</p>
      ) : null}

      {error ? (
        <p className={styles.alert}>
          Impossible de charger les tâches depuis jsonplaceholder.
        </p>
      ) : null}

      {!isLoading && !error ? (
        visibleTodos.length > 0 ? (
          <ul className={styles.list}>
            {visibleTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onRequestDelete={setPendingDeletion}
              />
            ))}
          </ul>
        ) : (
          <p className={styles.state}>Aucune tâche pour ce filtre.</p>
        )
      ) : null}

      <ConfirmDialog
        open={pendingDeletion !== null}
        title="Supprimer la tâche ?"
        description={
          pendingDeletion
            ? `« ${pendingDeletion.title} » sera retirée de la liste. Cette action est définitive.`
            : ""
        }
        confirmLabel="Supprimer"
        pending={isRemoving}
        onConfirm={confirmDeletion}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeletion(null);
          }
        }}
      />
    </section>
  );
}
