import { Button } from "../../components/Button/Button";
import { Checkbox } from "../../components/Checkbox/Checkbox";
import type { Todo } from "../../types";
import styles from "./TodoItem.module.scss";

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onRequestDelete: (todo: Todo) => void;
}

export function TodoItem({
  todo,
  onToggle,
  onRequestDelete,
}: Readonly<TodoItemProps>) {
  return (
    <li className={styles.item}>
      <Checkbox
        id={`todo-${todo.id}`}
        label={todo.title}
        struck={todo.completed}
        checked={todo.completed}
        onChange={() => onToggle(todo)}
      />
      {/* Tant que l'API n'a pas renvoyé d'identifiant, il n'y a rien à supprimer côté serveur. */}
      {todo.id !== undefined ? (
        <Button
          variant="ghost"
          onClick={() => onRequestDelete(todo)}
          aria-label={`Supprimer « ${todo.title} »`}
        >
          Supprimer
        </Button>
      ) : (
        <span className={styles.pending}>Création en cours</span>
      )}
    </li>
  );
}
