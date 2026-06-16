# Ward — League of Legends Wiki (Next.js 15 + App Router)

Wiki completa de League of Legends con App Router de Next.js 15, MongoDB Atlas y soporte para múltiples colecciones.

## Stack
- **Next.js 15** (App Router, React Server Components)
- **MongoDB Atlas** (mongoose-free, driver nativo)
- **TypeScript 5**

## Estructura App Router

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Página principal (campeones)
├── globals.css
├── patch-notes/        # /patch-notes
│   ├── page.tsx
│   └── PatchNotesView.tsx
├── summoner-spells/    # /summoner-spells
│   ├── page.tsx
│   └── SummonerSpellsView.tsx
├── profile/            # /profile
│   ├── page.tsx
│   └── ProfileView.tsx
└── api/
    ├── champions/route.ts
    ├── patch-notes/route.ts
    ├── summoner-spells/route.ts
    ├── users/
    │   ├── route.ts
    │   └── [username]/route.ts
    ├── user-builds/
    │   ├── route.ts
    │   └── [id]/route.ts
    ├── achievements/route.ts
    └── sessions/route.ts
```

## Colecciones MongoDB

| Colección | Descripción |
|-----------|-------------|
| `champions` | Campeones de LoL |
| `championTiers` | Tier list por parche y rol |
| `builds` | Builds recomendadas |
| `skins` | Skins de campeones |
| `abilities` | Habilidades |
| `items` | Items del juego |
| `runes` | Runas |
| `summonerSpells` | Hechizos de invocador |
| `patchNotes` | Notas de parche |
| `users` | Usuarios registrados |
| `userBuilds` | Builds creadas por usuarios |
| `userAchievements` | Logros de usuarios |
| `userSessions` | Sesiones activas |

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.local.example .env.local
# Editar MONGODB_URI con tu cadena de conexión de Atlas

# 3. Iniciar en desarrollo
npm run dev
```

## API Routes (App Router)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/champions` | Lista todos los campeones |
| GET | `/api/patch-notes?version=26.11` | Patch notes (opcional: filtrar por versión) |
| POST | `/api/patch-notes` | Crear/actualizar patch notes |
| GET | `/api/summoner-spells?mode=ARAM` | Hechizos (opcional: filtrar por modo) |
| POST | `/api/summoner-spells` | Crear hechizo |
| GET | `/api/users?username=santi` | Usuarios (sin passwordHash) |
| POST | `/api/users` | Crear usuario |
| GET | `/api/users/[username]` | Usuario específico |
| PATCH | `/api/users/[username]` | Actualizar usuario |
| GET | `/api/user-builds?userId=...&championId=...&public=true` | Builds de usuarios |
| POST | `/api/user-builds` | Crear build |
| GET | `/api/user-builds/[id]` | Build por ID (incrementa vistas) |
| PATCH | `/api/user-builds/[id]` | Actualizar build |
| DELETE | `/api/user-builds/[id]` | Eliminar build |
| GET | `/api/achievements?userId=...` | Logros |
| POST | `/api/achievements` | Desbloquear logro |
| GET | `/api/sessions?userId=...` | Sesiones activas |
| POST | `/api/sessions` | Crear sesión |
| DELETE | `/api/sessions?userId=...` | Cerrar todas las sesiones |
