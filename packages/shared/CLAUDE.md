# @factory/shared

Cross-package types and Zod schemas. Imported by the FE (and future BE) as `@factory/shared`.

## Rules

- Every domain type lives here first. Consumers import; they never redeclare.
- Every request/response payload has a Zod schema. Infer the TS type from the schema — do not write them separately.
- No runtime dependencies beyond `zod`. This package must remain safe to import from any environment (browser, node, worker).
- No React, no fetch, no logging, no side effects.

## Layout

```
src/
├── index.ts           ← barrel export
└── <domain>/          ← one folder per domain (drivers, orders, etc.)
    ├── schemas.ts     ← Zod schemas
    └── types.ts       ← inferred types re-exported for convenience
```

## Adding a Domain

1. Create `src/<domain>/schemas.ts` with Zod schemas.
2. Infer types: `export type Driver = z.infer<typeof DriverSchema>;`
3. Re-export from `src/index.ts`.
