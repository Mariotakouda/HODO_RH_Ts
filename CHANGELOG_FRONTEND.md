# CHANGELOG — Refonte architecture Hodo_React_typescript

## 🏗️ Nouvelle architecture

```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts         Client axios unique (remplace api/axios.ts)
│   │   └── errors.ts         ApiError + helpers (remplace api/ApiError.ts)
│   └── auth/roles.ts          isAdminRole()/isManagerRole() — miroir exact
│                               de User::isAdmin()/isManager() du backend
├── types/auth.ts               User, Employee, Role — types partagés
├── hooks/
│   ├── useAuth.ts               remplace useContext(AuthContext) partout
│   ├── useResourceList.ts       chargement + recherche + suppression générique
│   └── useDebouncedValue.ts     debounce recherche serveur
├── components/
│   ├── ui/                      KIT RÉUTILISABLE (voir plus bas)
│   └── layout/
│       ├── AppLayout.tsx        layout UNIQUE (remplace AdminLayout + EmployeeLayout)
│       ├── AppLayout.css        CSS consolidé (remplace 1357 lignes dupliquées)
│       └── navConfig.ts         menu par zone (self/team/admin)
├── routes/
│   ├── AppRoutes.tsx            protection par route, zones self/team/admin
│   └── ProtectedRoute.tsx       3 zones au lieu de la logique floue précédente
├── context/AuthContext.tsx      même comportement, code dédupliqué
└── modules/                     INCHANGÉ dans son principe (voir plus bas)
```

### Le kit UI réutilisable (`components/ui/`)

Avant, chaque `list.tsx` (10 modules) réimplémentait ses propres icônes SVG,
son squelette de chargement, sa recherche, ses badges de statut, sa pagination.
Résultat : des centaines de lignes identiques copiées-collées d'un module à
l'autre. Maintenant :

| Composant | Remplace |
|---|---|
| `Avatar` | le bloc photo/initiales dupliqué dans employees, managers... |
| `StatusBadge` + `lib/statusConfig.ts` | les badges codés en dur dans chaque module (libellés **alignés sur les enums PHP du backend**) |
| `DataTable` | le tableau desktop + cartes mobiles + squelette + état vide, dupliqués dans CHAQUE `list.tsx` |
| `SearchInput`, `PageHeader`, `Button`, `IconButton` | les variantes légèrement différentes du même bouton/champ dans chaque module |
| `FormField` (Input/Select/Textarea) | les champs de formulaire avec label + erreur, réécrits à chaque `create.tsx`/`edit.tsx` |
| `ConfirmDialog` (`useConfirm`) | tous les `window.confirm()` — remplacés par une modale cohérente |
| `Pagination` | la pagination réécrite dans departments, roles... |

Toutes les icônes utilisent maintenant les classes `bootstrap-icons` déjà
installées (`<i className="bi bi-xxx" />`) au lieu de SVG inline dupliqués
(un seul `<Icon name="eye">` faisait ~15 lignes de SVG, répété dans 8 fichiers).

### Layout unique

`AdminLayout.tsx` (398 lignes + 706 lignes de CSS) et `EmployeeLayout.tsx`
(409 lignes + 651 lignes de CSS) étaient quasi identiques (sidebar, header,
menu utilisateur) à part le contenu du menu. Remplacés par **un seul**
`AppLayout.tsx` (~150 lignes) + `AppLayout.css` (~250 lignes) : le menu
affiché dépend simplement du rôle (`navConfig.ts`), construit sur le même
modèle à 3 niveaux que le backend (self / team / admin).

### Correction de fond : la protection des routes

`ProtectedRoute` acceptait un `role="admin" | "employee"` avec une règle
bancale ("admin" acceptait aussi les managers — le même bug que côté
backend). Remplacé par 3 zones explicites qui **correspondent exactement**
aux 3 middlewares backend :

- `zone="self"` → `auth:sanctum` seul
- `zone="team"` → middleware `manager` (manager OU admin)
- `zone="admin"` → middleware `admin` (admin uniquement)

**Important : aucune URL n'a changé.** Toutes les routes restent sous
`/admin/...` et `/employee/...` comme avant — seule la protection par route
a été corrigée (ex. `/admin/departments` exige maintenant vraiment `admin`,
alors que `/admin/employees` — liste — n'exige que `team`). Ce choix évite
de modifier des dizaines de `navigate()`/`Link` dans les fichiers non encore
migrés.

## ✅ Modules entièrement migrés vers le nouveau kit

- **Auth** : `Login.tsx` (icônes bootstrap-icons, redirection simplifiée)
- **Employees** : `service.ts`, `list.tsx`, `create.tsx`
- **Departments** : `service.ts`, `list.tsx`, `create.tsx`

## 🔄 Modules pas encore migrés — mais toujours fonctionnels

Les **29 autres fichiers** (tasks, presences, leaveRequests, announcements,
managers, roles, employeeRoles, écrans self-service employé, `employees/edit.tsx`,
`employees/show.tsx`, `departments/edit.tsx`, `departments/show.tsx`...)
**compilent et fonctionnent à l'identique** grâce à deux fichiers de
compatibilité :

- `src/api/axios.ts` → ré-exporte `lib/api/client.ts`
- `src/api/ApiError.ts` → ré-exporte `lib/api/errors.ts`

Ils continuent d'importer `../../api/axios` comme avant. Quand tu migreras
un de ces modules, remplace l'import par `../../lib/api/client` et utilise
le kit `components/ui/` — le pattern est le même que pour `employees/` et
`departments/` (regarde ces deux modules comme référence).

## 🗑️ Code mort supprimé

- `modules/auth/Register.tsx` — jamais routé, auto-inscription abandonnée
  (le backend crée les employés uniquement via l'admin)
- `services/employeeService.ts`, `services/emailService.ts` — utilisés
  uniquement par `Register.tsx`
- `AdminLayout.tsx`, `AdminLayout.css`, `EmployeeLayout.tsx`, `EmployeeLayout.css`
  → remplacés par `AppLayout`
- `index.css` — c'était encore le template par défaut généré par Vite
  (thème sombre, `body` centré), jamais nettoyé après l'ajout de Bootstrap.
  Remplacé par une feuille de style minimale adaptée à l'app.
- Routes `/admin/leave-requests/create` et `/admin/leave-requests/:id/edit`
  — aucun endpoint backend correspondant (un admin ne crée pas la demande
  de congé d'un employé), c'était du code routé vers rien d'exploitable.

## ⚠️ Point de concordance frontend/backend à corriger ensuite

`modules/tasks/service.ts` appelle toujours `GET/POST/PUT /tasks`, qui est
réservé à `manager`/`admin` côté backend (middleware `manager`). Or
`TaskList`/`TaskCreate`/`TaskEdit` sont utilisés à la fois dans la zone
`/admin` ET dans la zone `/employee` (pour les managers). J'ai protégé ces
3 routes en zone `"team"` des deux côtés — donc un **manager** les utilise
sans problème, comme avant. Mais un **employé simple** n'a toujours pas de
véritable écran "mes tâches" en liste (seulement le détail d'une tâche via
`/employee/tasks/:id`, qui lui fonctionne via l'endpoint self-service
`/me/tasks`). Les liens "Mes tâches" de `Profile.tsx` et `dashboard.tsx`
pointent vers `/employee/tasks`, qui redirige maintenant proprement vers le
dashboard pour un simple employé au lieu de planter avec un 403 silencieux —
mais ce n'est pas un vrai écran dédié. À faire dans un prochain passage :
créer un `MyTaskList` self-service basé sur `GET /me/tasks`.

## Pour appliquer le même traitement aux modules restants

Pattern à reproduire (voir `modules/employees/` et `modules/departments/`) :
1. `service.ts` → importer `../../lib/api/client` au lieu de `../../api/axios`
2. `list.tsx` → `useResourceList` (ou pagination serveur + `useDebouncedValue`
   si le backend paginate déjà) + `DataTable` + `SearchInput` + `PageHeader`
3. `create.tsx`/`edit.tsx` → `InputField`/`SelectField`/`TextareaField` + `Button`
4. Remplacer tout `window.confirm` par `useConfirm()`
