# Project Rules for TrolleyLLMArena

## Auto-Run After Code Changes

**Always run verification after making code changes:**

1. After modifying TypeScript/JavaScript files, run `npx tsc --noEmit` to check for type errors
2. After modifying React components, ensure the dev server is running and check for errors
3. After modifying test files, run the relevant tests
4. After modifying Prisma schema, run `npx prisma generate`

This applies to ALL code changes - do not wait for user permission to verify your changes work.
