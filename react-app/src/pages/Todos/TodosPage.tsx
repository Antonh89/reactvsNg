import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  TODOS_KEY,
  createTodo,
  fetchTodos,
  nextLocalId,
  removeTodo,
  toggleTodo,
} from '../../api/todos';
import { Button } from '../../components/Button/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { Input } from '../../components/Input/Input';
import type { Todo, TodoFilter } from '../../types';
import { TodoItem } from './TodoItem';
import styles from './TodosPage.module.scss';

interface AddTodoForm {
  title: string;
}

const MIN_TITLE_LENGTH = 3;

const filterOptions: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'completed', label: 'Complétés' },
  { value: 'remaining', label: 'Restants' },
];

function optimisticOptions(project: (todos: Todo[]) => Todo[]) {
  return {
    optimisticData: (current?: Todo[]) => project(current ?? []),
    populateCache: (_result: unknown, current: Todo[] | undefined) => project(current ?? []),
    revalidate: false,
    rollbackOnError: true,
  };
}

export function TodosPage() {
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [pendingDeletion, setPendingDeletion] = useState<Todo | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: todos, error, isLoading } = useSWR<Todo[]>(TODOS_KEY, fetchTodos);

  const { trigger: triggerCreate, isMutating: isCreating } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg }: { arg: string }) => createTodo(arg),
  );

  const { trigger: triggerToggle } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg }: { arg: Todo }) => toggleTodo(arg),
  );

  const { trigger: triggerRemove, isMutating: isRemoving } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg }: { arg: Todo }) => removeTodo(arg),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddTodoForm>({ defaultValues: { title: '' } });

  const counts = useMemo(() => {
    const list = todos ?? [];
    const completed = list.filter((todo) => todo.completed).length;

    return { all: list.length, completed, remaining: list.length - completed };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    const list = todos ?? [];

    if (filter === 'completed') {
      return list.filter((todo) => todo.completed);
    }

    if (filter === 'remaining') {
      return list.filter((todo) => !todo.completed);
    }

    return list;
  }, [todos, filter]);

  const onSubmit = handleSubmit(async ({ title }) => {
    const trimmed = title.trim();
    const optimistic: Todo = {
      userId: 1,
      id: nextLocalId(todos ?? []),
      title: trimmed,
      completed: false,
    };

    setActionError(null);

    try {
      await triggerCreate<Todo[]>(
        trimmed,
        optimisticOptions((current) => [optimistic, ...current]),
      );
      reset();
    } catch {
      setActionError("L'ajout a échoué, la liste a été restaurée.");
    }
  });

  async function handleToggle(todo: Todo) {
    setActionError(null);

    try {
      await triggerToggle<Todo[]>(
        todo,
        optimisticOptions((current) =>
          current.map((item) => (item.id === todo.id ? { ...item, completed: !item.completed } : item)),
        ),
      );
    } catch {
      setActionError('La mise à jour a échoué, la liste a été restaurée.');
    }
  }

  async function confirmDeletion() {
    if (!pendingDeletion) {
      return;
    }

    const target = pendingDeletion;
    setActionError(null);

    try {
      await triggerRemove<Todo[]>(
        target,
        optimisticOptions((current) => current.filter((item) => item.id !== target.id)),
      );
      setPendingDeletion(null);
    } catch {
      setActionError('La suppression a échoué, la liste a été restaurée.');
      setPendingDeletion(null);
    }
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>TodoList</h1>
      <p className={styles.intro}>
        Chargement via SWR, mutations optimistes via <code>useSWRMutation</code>, saisie validée par
        react-hook-form.
      </p>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <Input
          label="Nouvelle tâche"
          placeholder="Que faut-il faire ?"
          autoComplete="off"
          error={errors.title?.message}
          {...register('title', {
            required: 'Le titre est obligatoire.',
            minLength: {
              value: MIN_TITLE_LENGTH,
              message: `Le titre doit contenir au moins ${MIN_TITLE_LENGTH} caractères.`,
            },
          })}
        />
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Ajout…' : 'Ajouter'}
        </Button>
      </form>

      <div className={styles.filters} role="group" aria-label="Filtrer par statut">
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

      {isLoading ? <p className={styles.state}>Chargement des tâches…</p> : null}

      {error ? (
        <p className={styles.alert}>Impossible de charger les tâches depuis jsonplaceholder.</p>
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
            : ''
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
