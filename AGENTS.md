# Agent guidelines

Rules and conventions for AI assistants and future contributors.

## Code comments: English only

All comments in the codebase (inline comments, JSDoc, block comments, TODO/FIXME notes) must be written in **English**. This applies regardless of the language used when talking to the agent or in the project’s user-facing copy (UI, docs for end users, etc.). Keeping comments in English keeps the code consistent and readable for any contributor.

## Commit messages: Commitlint (Conventional Commits)

The project uses **commitlint** with **@commitlint/config-conventional**. Every commit is validated by the `commit-msg` Husky hook.

**Format:** `<type>(<scope>): <subject>` (body and footer optional).

**Types:** `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`.

**Rules (summary):** type and subject required; type lowercase; subject not sentence-case; header max 100 characters; blank line before body/footer.

**Examples:**

- `feat: add timeline zoom`
- `fix(video): trim when no background video`
- `docs: update AGENTS.md`

**Config:** `commitlint.config.cjs` (extends conventional). To run manually: `yarn commitlint` (stdin) or the hook runs on `git commit`.

## React Compiler: no manual memoization

**The project uses React Compiler** (see `babel-plugin-react-compiler` in package.json). The compiler automatically memoizes components, hooks, and values when it detects that stability is needed (e.g. to avoid unnecessary re-renders or to satisfy dependency arrays).

**Do not add:**

- `useMemo` for derived values or expensive computations — write the computation inline; the compiler will optimize when needed.
- `useCallback` for event handlers or callbacks — define plain functions; the compiler will stabilize them when they are passed as props or used in dependency arrays.

**Exceptions:** Add `useMemo` or `useCallback` only when:

- A function is used in a `useEffect` (or similar) dependency array and the linter or runtime requires a stable identity (e.g. to avoid infinite effect runs).
- A third-party API explicitly requires referential equality and does not work with the compiler’s output.

Prefer removing manual memoization first and reintroducing it only when the linter flags it or profiling shows it is necessary.

This keeps the code simpler and avoids redundant memoization that the compiler already provides.

## Utils: one function per file

In `src/utils/`, each exported function lives in its **own file**. Do not group several functions in a single module (e.g. one file with `formatDateLocal`, `formatTimeLocal` and `formatElapsedAsDateTimeLocal`). If a function needs another util, import it from its dedicated file. Tests follow the same layout: one test file per util file (e.g. `formatDateLocal.test.ts` for `formatDateLocal.ts`).

## Imports format

Always use the `import { whatever } from "@/.../ItemToImport"` format except for the unit tests. At unit test use `import { whatever } from "./itemToTest"`