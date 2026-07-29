import { useCallback } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  TODOS_KEY,
  createTodo,
  fetchTodos,
  nextLocalId,
  removeTodo,
  toggleTodo,
} from "../api/todos";
import type { Todo } from "../types";

function optimisticOptions(project: (todos: Todo[]) => Todo[]) {
  return {
    optimisticData: (current?: Todo[]) => project(current ?? []),
    populateCache: (_result: unknown, current: Todo[] | undefined) =>
      project(current ?? []),
    revalidate: false,
    rollbackOnError: true,
  };
}

export function useApiTodos() {
  const {
    data: todos,
    error,
    isLoading,
  } = useSWR<Todo[]>(TODOS_KEY, fetchTodos);

  const { trigger: triggerCreate, isMutating: isCreating } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg }: { arg: string }) => createTodo(arg)
  );

  const { trigger: triggerToggle, isMutating: isToggling } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg }: { arg: Todo }) => toggleTodo(arg)
  );

  const { trigger: triggerRemove, isMutating: isRemoving } = useSWRMutation(
    TODOS_KEY,
    (_key: string, { arg }: { arg: Todo }) => removeTodo(arg)
  );

  const create = useCallback(
    (title: string) => {
      const optimistic: Todo = {
        userId: 1,
        id: nextLocalId(todos ?? []),
        title,
        completed: false,
      };

      return triggerCreate<Todo[]>(
        title,
        optimisticOptions((current) => [optimistic, ...current])
      );
    },
    [todos, triggerCreate]
  );

  const toggle = useCallback(
    (todo: Todo) =>
      triggerToggle<Todo[]>(
        todo,
        optimisticOptions((current) =>
          current.map((item) =>
            item.id === todo.id ? { ...item, completed: !item.completed } : item
          )
        )
      ),
    [triggerToggle]
  );

  const remove = useCallback(
    (todo: Todo) =>
      triggerRemove<Todo[]>(
        todo,
        optimisticOptions((current) =>
          current.filter((item) => item.id !== todo.id)
        )
      ),
    [triggerRemove]
  );

  return {
    todos,
    error,
    isLoading,
    create,
    toggle,
    remove,
    isCreating,
    isToggling,
    isRemoving,
  };
}
