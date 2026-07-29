export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export type TodoFilter = 'all' | 'completed' | 'remaining';
