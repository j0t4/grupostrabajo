# AGENTS.md - Project Guidelines

## Build/Lint/Test Commands
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm run test`
- Run single test: `npm test -- <test_file_path>` (e.g. `npm test -- src/tests/members/route.test.ts`)

## Code Style Guidelines

### Imports
- Use ES6 module imports
- Group imports: 3rd-party libs → project imports

### Formatting
- Follow Prettier defaults (via Next.js ESLint config)
- 2-space indentation
- Max line length: 100 characters

### Types
- Use TypeScript strictly
- Add types for all function parameters and return values
- Avoid `any` type

### Naming Conventions
- Components: PascalCase (e.g. `MemberForm`)
- Functions/Variables: camelCase (e.g. `formatDate`)
- Interfaces/Types: PascalCase (e.g. `MemberData`)
- API routes: kebab-case (e.g. `[memberId]_[meetingId]`)

### Error Handling
- Use try/catch blocks for async operations
- Handle API errors with appropriate status codes
- Avoid silent failures

### Best Practices
- Use Prisma for database access
- Follow Next.js API route patterns
- Prefer functional components with hooks
- Keep components small and focused

### Testing
- Tests located in `src/tests/`
- Use Jest testing framework
- Test files mirror source file structure