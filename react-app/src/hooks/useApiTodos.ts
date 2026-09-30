import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { TODOS_KEY, createTodo, fetchTodos, removeTodo, toggleTodo } from "../api/todos";
import type { Todo } from "../types";

export function useApiTodos() {
  // Lecture : la liste est mise en cache sous la clé TODOS_KEY.
  const {
    data: todos,
    error,
    isLoading,
    isValidating,
    mutate: refresh,
  } = useSWR<Todo[]>(TODOS_KEY, fetchTodos, {
    revalidateIfStale: false,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const isRefreshing = isValidating && !isLoading;

  // Écritures : chaque mutation met à jour ce même cache.
  const { trigger: triggerCreate, isMutating: isCreating } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg: title }: { arg: string }) => createTodo(title),
  );

  const { trigger: triggerToggle } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg: todo }: { arg: Todo }) => toggleTodo(todo),
  );

  const { trigger: triggerRemove, isMutating: isRemoving } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg: todo }: { arg: Todo }) => removeTodo(todo),
  );

  /*
   * Pour chaque mutation : `optimisticData` s'affiche pendant l'appel, `populateCache`
   * reconstruit la liste avec la réponse de l'API (qui seule attribue l'id des tâches
   * créées), et `rollbackOnError` restaure la liste si l'appel échoue.
   */
  function create(title: string) {
    // Pas d'identifiant tant que l'API n'a pas répondu : la ligne optimiste s'affiche sans id.
    const optimistic: Todo = { title, completed: false };

    return triggerCreate<Todo[]>(title, {
      optimisticData: (current = []) => [optimistic, ...current],
      populateCache: (created, current = []) => [created, ...current],
      revalidate: false,
      rollbackOnError: true,
    });
  }

  function toggle(todo: Todo) {
    return triggerToggle<Todo[]>(todo, {
      optimisticData: (current = []) =>
        current.map((item) =>
          item.id === todo.id ? { ...item, completed: !item.completed } : item,
        ),
      populateCache: (updated, current = []) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      revalidate: false,
      rollbackOnError: true,
    });
  }

  function remove(todo: Todo) {
    return triggerRemove<Todo[]>(todo, {
      optimisticData: (current = []) => current.filter((item) => item.id !== todo.id),
      populateCache: (_, current = []) => current.filter((item) => item.id !== todo.id),
      revalidate: false,
      rollbackOnError: true,
    });
  }

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
    isRemoving,
  };
}
