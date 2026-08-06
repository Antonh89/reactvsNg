import { useCallback } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  TODOS_KEY,
  createTodo,
  fetchTodos,
  removeTodo,
  toggleTodo,
} from "../api/todos";
import type { Todo } from "../types";

/**
 * `project` affiche la liste optimiste pendant l'appel ; `reconcile` reconstruit le cache à
 * partir de la réponse de l'API, seule source de l'identifiant réel des tâches créées.
 */
function optimisticOptions<TResult>(
  project: (todos: Todo[]) => Todo[],
  reconcile: (result: TResult, todos: Todo[]) => Todo[]
) {
  return {
    optimisticData: (current?: Todo[]) => project(current ?? []),
    populateCache: (result: TResult, current: Todo[] | undefined) =>
      reconcile(result, current ?? []),
    revalidate: false,
    rollbackOnError: true,
  };
}

export function useApiTodos() {
  const {
    data: todos,
    error,
    isLoading,
    isValidating,
    mutate: refresh,
  } = useSWR<Todo[]>(TODOS_KEY, fetchTodos, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const isRefreshing = isValidating && !isLoading;

  const { trigger: triggerCreate, isMutating: isCreating } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg }: { arg: string }) => createTodo(arg)
  );

  const create = useCallback(
    (title: string) => {
      // Pas d'identifiant tant que l'API n'a pas répondu : la ligne optimiste s'affiche sans id.
      const optimistic: Todo = {
        userId: 1,
        id: undefined,
        title,
        completed: false,
      };

      return triggerCreate<Todo[]>(
        title,
        optimisticOptions(
          (current) => [optimistic, ...current],
          (created, current) => [created, ...current]
        )
      );
    },
    [triggerCreate]
  );

  const { trigger: triggerToggle, isMutating: isToggling } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg }: { arg: Todo }) => toggleTodo(arg)
  );

  const toggle = useCallback(
    (todo: Todo) =>
      triggerToggle<Todo[]>(
        todo,
        optimisticOptions<Todo>(
          (current) =>
            current.map((item) =>
              item.id === todo.id
                ? { ...item, completed: !item.completed }
                : item
            ),
          (updated, current) =>
            current.map((item) => (item.id === updated.id ? updated : item))
        )
      ),
    [triggerToggle]
  );

  const { trigger: triggerRemove, isMutating: isRemoving } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg }: { arg: Todo }) => removeTodo(arg)
  );

  const remove = useCallback(
    (todo: Todo) => {
      const withoutTodo = (current: Todo[]) =>
        current.filter((item) => item.id !== todo.id);

      return triggerRemove<Todo[]>(
        todo,
        optimisticOptions<void>(withoutTodo, (_, current) =>
          withoutTodo(current)
        )
      );
    },
    [triggerRemove]
  );

  return {
    todos,
    error,
    isLoading,
    create,
    toggle,
    remove,
    refresh,
    isRefreshing,
    isCreating,
    isToggling,
    isRemoving,
  };
}
