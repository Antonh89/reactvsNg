import { Router } from 'express';
import { z } from 'zod';

import { findTodo, insertTodo, listTodos, removeTodo, updateTodo } from './todos.store.ts';

const idSchema = z.coerce.number().int().positive();

const listQuerySchema = z.object({
  _start: z.coerce.number().int().min(0).optional(),
  _limit: z.coerce.number().int().min(1).optional(),
  completed: z.enum(['true', 'false']).optional(),
});

/** POST : titre obligatoire, `completed` vaut false par défaut. */
const createSchema = z.object({
  title: z.string().trim().min(1),
  completed: z.boolean().default(false),
});

/** PUT : remplacement complet de la tâche. */
const replaceSchema = z.object({
  title: z.string().trim().min(1),
  completed: z.boolean(),
});

/** PATCH : au moins un champ, et uniquement ceux fournis sont écrasés. */
const updateSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    completed: z.boolean().optional(),
  })
  .refine((changes) => Object.keys(changes).length > 0, {
    message: 'Fournir au moins un champ à modifier (title, completed)',
  });

export const todosRouter = Router();

todosRouter.get('/', (req, res) => {
  const query = listQuerySchema.safeParse(req.query);

  if (!query.success) {
    res.status(400).json(badRequest('Paramètres de requête invalides', query.error));
    return;
  }

  const { _start = 0, _limit, completed } = query.data;

  let todos = listTodos();

  if (completed !== undefined) {
    todos = todos.filter((todo) => todo.completed === (completed === 'true'));
  }

  res.json(todos.slice(_start, _limit === undefined ? undefined : _start + _limit));
});

todosRouter.get('/:id', (req, res) => {
  const id = parseId(req.params.id);

  if (id === undefined) {
    res.status(400).json(badRequest("L'identifiant doit être un entier positif"));
    return;
  }

  const todo = findTodo(id);

  if (!todo) {
    res.status(404).json(notFound(id));
    return;
  }

  res.json(todo);
});

todosRouter.post('/', (req, res) => {
  const body = createSchema.safeParse(req.body);

  if (!body.success) {
    res.status(400).json(badRequest('Corps de requête invalide', body.error));
    return;
  }

  const created = insertTodo(body.data);

  res.status(201).location(`/todos/${created.id}`).json(created);
});

todosRouter.put('/:id', (req, res) => {
  const id = parseId(req.params.id);

  if (id === undefined) {
    res.status(400).json(badRequest("L'identifiant doit être un entier positif"));
    return;
  }

  const body = replaceSchema.safeParse(req.body);

  if (!body.success) {
    res.status(400).json(badRequest('Corps de requête invalide', body.error));
    return;
  }

  const replaced = updateTodo(id, body.data);

  if (!replaced) {
    res.status(404).json(notFound(id));
    return;
  }

  res.json(replaced);
});

todosRouter.patch('/:id', (req, res) => {
  const id = parseId(req.params.id);

  if (id === undefined) {
    res.status(400).json(badRequest("L'identifiant doit être un entier positif"));
    return;
  }

  const body = updateSchema.safeParse(req.body);

  if (!body.success) {
    res.status(400).json(badRequest('Corps de requête invalide', body.error));
    return;
  }

  const updated = updateTodo(id, body.data);

  if (!updated) {
    res.status(404).json(notFound(id));
    return;
  }

  res.json(updated);
});

todosRouter.delete('/:id', (req, res) => {
  const id = parseId(req.params.id);

  if (id === undefined) {
    res.status(400).json(badRequest("L'identifiant doit être un entier positif"));
    return;
  }

  if (!removeTodo(id)) {
    res.status(404).json(notFound(id));
    return;
  }

  res.status(204).end();
});

function parseId(raw: string | undefined): number | undefined {
  const id = idSchema.safeParse(raw);

  return id.success ? id.data : undefined;
}

function badRequest(message: string, error?: z.ZodError) {
  return {
    message,
    issues: error?.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}

function notFound(id: number) {
  return { message: `Aucune tâche avec l'identifiant ${id}` };
}
