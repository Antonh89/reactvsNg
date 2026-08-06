import cors from 'cors';
import express from 'express';
import type { ErrorRequestHandler } from 'express';

import { todosRouter } from './todos.router.ts';
import { loadTodos } from './todos.store.ts';

const PORT = Number(process.env.PORT ?? 3000);

// Le fichier todos.json est lu une seule fois ici : tout le reste se joue en mémoire.
const loaded = loadTodos();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'reactVsNg2 API',
    endpoints: [
      'GET    /todos?_start=&_limit=&userId=&completed=',
      'GET    /todos/:id',
      'POST   /todos',
      'PUT    /todos/:id',
      'PATCH  /todos/:id',
      'DELETE /todos/:id',
    ],
  });
});

app.use('/todos', todosRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Route inconnue : ${req.method} ${req.originalUrl}` });
});

const handleErrors: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ message: 'JSON invalide' });
    return;
  }

  console.error(error);
  res.status(500).json({ message: 'Erreur interne du serveur' });
};

app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`${loaded} tâches chargées en mémoire depuis todos.json`);
  console.log(`API prête sur http://localhost:${PORT}/todos`);
});
