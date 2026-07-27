# IOSL.v1 — Repository-Wide Rules

Monorepo managed with pnpm workspaces.

## Layout

- `apps/web/` — React 18 + Vite + TS frontend. Read `apps/web/CLAUDE.md` before touching.
- `packages/shared/` — cross-package types and Zod schemas. Published as `@factory/shared`. The FE and (future) BE both import from here. Never redeclare a type or schema in a consumer.

## Package Manager

- pnpm only. Never use npm or yarn. Never mix lockfiles.
- Install at the root: `pnpm install`.
- Add a dep to a workspace: `pnpm --filter <name> add <dep>`.

## Verifying Changes

Before declaring a task done, from the repo root:

```
pnpm typecheck && pnpm lint && pnpm build
```

## Adding a Package

Stop and ask. New workspaces must be justified.
