# Angular 22 vs React 19 — comparaison sur deux applications jumelles

Deux applications volontairement simples et **fonctionnellement identiques**, l'une en Angular, l'autre en React. Mêmes pages, mêmes composants réutilisables, même API, même UX : la seule variable est le framework.

## Lancer

L'API locale d'abord, les deux applications tapent dessus :

```bash
cd back        && npm install && npm run dev     # http://localhost:3000
cd react-app   && npm install && npm run dev     # http://localhost:5173
cd angular-app && npm install && npm start       # http://localhost:4200
```

## Périmètre couvert

Chaque application propose trois pages :

| Page | Contenu |
|---|---|
| `/` | Accueil avec liens vers les autres pages |
| `/counter` | Compteur avec décrémenter / réinitialiser / incrémenter |
| `/todos` | TodoList chargée depuis l'API locale `back/` (`http://localhost:3000/todos`) |

La TodoList permet d'ajouter une tâche (champ validé), de cocher son statut, de la supprimer via une modale de confirmation, et de filtrer sur **Tous / Complétés / Restants**.

## Table de correspondance

| Besoin | React 19 | Angular 22 |
|---|---|---|
| Routage | `createBrowserRouter` + route parente `Layout` | `Routes` + route parente `AppLayout` |
| Vue imbriquée | `<Outlet />` | `<router-outlet />` |
| Lien de navigation actif | `<NavLink>` + `className={({isActive}) => …}` | `routerLinkActive` |
| Chargement paresseux | route → composant importé | `loadComponent: () => import(…)` |
| État local | `useState` | `signal()` |
| État dérivé | `useMemo` | `computed()` |
| Événement click | `onClick={…}` | `(click)="…"` |
| Formulaire | react-hook-form (`register`, `handleSubmit`) | Signal Forms (`form()`, `[formField]`, `[formRoot]`) |
| Validation | `required`, `minLength` dans `register` | `required()`, `minLength()` dans le schéma |
| Chargement HTTP | SWR (`useSWR`) | service `HttpClient` exposé via `rxResource` |
| Mutation optimiste | `useSWRMutation` + `optimisticData` | `resource.value.update()` |
| Modale | Radix UI (`@radix-ui/react-dialog`) | Angular CDK (`@angular/cdk/dialog`) |
| Styles | CSS Modules + SCSS | SCSS encapsulé par composant |
| Design tokens | `src/styles/_tokens.scss` | `src/styles/_tokens.scss` (identiques) |

## Ce que la comparaison fait ressortir

**Le modèle de réactivité est le vrai point de divergence.** React ré-exécute le composant et l'on décrit *quand* recalculer (`useMemo` et ses tableaux de dépendances). Angular 22 est zoneless et OnPush par défaut : les `signal()` / `computed()` déclarent le graphe de dépendances, et le framework ne recalcule que ce qui en dépend. Le code du compteur est presque identique, celui de la TodoList ne l'est plus du tout.

**Les deux écosystèmes ont convergé sur le formulaire piloté par le modèle.** Les Signal Forms (stables en v22) partent d'un `signal` de données et en dérivent l'arbre de champs ; react-hook-form part du DOM via `register`. Résultat comparable, chemin inverse : Angular descend du modèle vers le champ, React remonte du champ vers le modèle.

**Sur les mutations optimistes, SWR est plus outillé.** `useSWRMutation` prend en charge `optimisticData`, `rollbackOnError` et `populateCache` : le rollback est déclaratif. Côté Angular, `resource.value` étant un `WritableSignal`, on écrit la mise à jour optimiste soi-même — et on gère le rollback à la main via un instantané avant l'appel. Plus explicite, plus verbeux.

**Un même piège dans les deux frameworks.** Le lien « Accueil » reste actif sur toutes les pages si l'on ne fait rien, car la route `''` est un préfixe de toutes les autres. Il faut `end` sur le `<NavLink>` React et `[routerLinkActiveOptions]="{ exact: true }"` en Angular. Même problème, même coût : un attribut.

**Les composants réutilisables ne coûtent pas le même prix.** En React 19, `ref` est une prop normale : `Input` s'écrit sans `forwardRef` et absorbe directement le spread de `register()`. En Angular, un champ réutilisable doit implémenter le contrat `FormValueControl<T>` (un `value = model()`) — et, détail peu documenté, **émettre un output `touch`** pour que l'état `touched` soit marqué au blur, sans quoi les messages d'erreur ne s'affichent jamais.

**Volume de code comparable, nombre de fichiers non.** À périmètre égal : ~1 190 lignes sur 24 fichiers pour React, ~1 200 lignes sur 36 fichiers pour Angular. L'écart vient de la séparation `.ts` / `.html` / `.scss` là où React co-localise le markup dans le `.tsx`.

## Points de vigilance rencontrés

- **Angular 22 exige TypeScript `>=6.0 <6.1`** alors que la dernière version publiée est 7.x. Ne pas « mettre à jour » TypeScript dans `angular-app`. Le projet React, lui, tourne bien en TypeScript 7.
- **`@angular/cdk/overlay-prebuilt.css` est obligatoire** (déclaré dans `angular.json`), sinon la modale CDK s'affiche sans backdrop ni positionnement.
- **`withFetch()` est déprécié en v22** : `FetchBackend` est déjà le backend par défaut de `provideHttpClient()`.
- **L'identifiant d'une tâche créée vient du serveur.** Plutôt qu'un id provisoire fabriqué côté client, la ligne optimiste s'affiche avec `id: undefined` : le bouton « Supprimer » est masqué tant que l'identifiant est absent, ce qui évite un `DELETE` sur un id inexistant. La ligne est remplacée par la tâche renvoyée par l'API — React dans `populateCache`, Angular dans un `value.update()` après la réponse. Conséquence côté template : la clé de liste doit tolérer l'absence d'id (`key={todo.id ?? "pending"}`, `track todo.id ?? 'pending'`).
- **`DELETE` répond `204` sans corps** : côté React, appeler `response.json()` sur cette réponse lève une erreur — il faut se contenter de vérifier `response.ok`. Angular, lui, mappe un corps vide sur `null` sans broncher.
- **Le serveur ne persiste rien sur le disque** : le redémarrer remet les 20 tâches de `back/todos.json`.

## API locale (`back/`)

Un petit serveur Express 5 en TypeScript, exécuté directement par Node 24 (type stripping natif, pas d'étape de build). Au démarrage, `todos.json` est lu **une seule fois** et le tableau reste en mémoire : les routes lisent et modifient cet objet, rien n'est réécrit sur le disque. Redémarrer le serveur remet donc les 20 tâches d'origine.

Les chemins et la forme des tâches reprennent ceux de jsonplaceholder, qui servait d'API avant : le `BASE_URL` des deux applications pointe désormais sur `http://localhost:3000/todos`.

| Route | Effet |
|---|---|
| `GET /todos` | Liste, filtrable par `_start`, `_limit`, `userId`, `completed` |
| `GET /todos/:id` | Une tâche, `404` si inconnue |
| `POST /todos` | Crée (`title` requis, `completed` et `userId` par défaut) → `201` |
| `PUT /todos/:id` | Remplace (`title` + `completed` requis) |
| `PATCH /todos/:id` | Modifie les champs fournis (au moins un) |
| `DELETE /todos/:id` | Supprime → `204` |

Les corps et paramètres sont validés par zod : `400` avec la liste des champs fautifs, `404` sur identifiant inconnu.

## Structure

```text
reactVsNg2/
├── back/
│   ├── index.ts                      serveur Express, chargement du json au boot
│   ├── todos.router.ts               routes CRUD + validation zod
│   ├── todos.store.ts                tableau en mémoire (list/find/insert/update/remove)
│   └── todos.json                    20 tâches de départ
├── react-app/
│   └── src/
│       ├── api/todos.ts              fetcher + create/toggle/remove
│       ├── components/               Layout, Button, Input, Checkbox, ConfirmDialog
│       ├── pages/                    Home, Counter, Todos (+ TodoItem)
│       ├── styles/                   _tokens.scss, global.scss
│       └── router.tsx
└── angular-app/
    └── src/app/
        ├── core/                     todo.model.ts, todo.service.ts
        ├── shared/                   layout, button, input, checkbox, confirm-dialog
        ├── pages/                    home, counter, todos (+ todo-item)
        └── app.routes.ts
```
