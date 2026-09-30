export interface Todo {
  /** Absent sur la ligne optimiste : seul le serveur attribue un identifiant. */
  id?: number;
  title: string;
  completed: boolean;
}

export type TodoFilter = 'all' | 'completed' | 'remaining';
