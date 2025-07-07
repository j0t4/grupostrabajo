## Commands

- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm run test`
- Run a single test: `npm test -- src/tests/members/route.test.ts`

## Code Style

- **Imports**: Use ES6 module imports.
- **Formatting**: Follow Prettier defaults (via Next.js ESLint config).
- **Types**: Use TypeScript. Add types for all function parameters and return values.
- **Naming**:
  - Components: PascalCase (e.g., `MyComponent`).
  - Functions/Variables: camelCase (e.g., `myFunction`).
  - Interfaces/Types: PascalCase (e.g., `MyType`).
- **Error Handling**: Use try/catch blocks for async operations.
- **API**: Use Next.js API routes.
- **Database**: Use Prisma for database access.
- **UI**: Use React components.
