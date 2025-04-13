## Project Overview
This project implements a modern web application to manage workgroups, members, meetings, attendances, and logbook entries using Next.js and Prisma.

## Architecture
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (likely, based on common Next.js setups, but confirm if used)
- **Database ORM**: Prisma
- **Database**: SQLite (for development, as indicated by `prisma/dev.db`)
- **API**: Next.js API Routes
- **Testing**: Jest

## API Routes (Components)
Located under `src/app/api/`:
- `/attendances`: Manage meeting attendances.
- `/attendances/[memberId]_[meetingId]`: Manage specific attendances.
- `/docs`: Serves API documentation (likely Swagger).
- `/logbookEntries`: Manage logbook entries.
- `/logbookEntries/[id]`: Manage specific logbook entries.
- `/meetings`: Manage meetings.
- `/meetings/[id]`: Manage specific meetings.
- `/members`: Manage members.
- `/members/[id]`: Manage specific members.
- `/memberships`: Manage workgroup memberships.
- `/memberships/[memberId]_[workgroupId]_[startDate]`: Manage specific memberships.
- `/workgroups`: Manage workgroups.
- `/workgroups/[id]`: Manage specific workgroups.

## Environment Configuration
A `.env` file is required, primarily for the database connection.
- `DATABASE_URL`: Specifies the connection string for the Prisma client (e.g., `file:./dev.db` for local SQLite).

## File Structure
```
.
├── .idx/         # IDX configuration
├── .vscode/      # VSCode settings
├── doc/          # Documentation (Planing.md, prisma_file.txt)
├── prisma/       # Prisma schema, migrations, seed script, dev database
├── public/       # Static assets (images, svgs)
├── src/
│   ├── app/      # Next.js App Router
│   │   ├── api/  # API routes
│   │   ├── docs/ # API documentation page
│   │   ├── *.tsx # Page components (layout, page, favicon)
│   │   └── *.css # Global styles
│   ├── tests/    # Jest tests for API routes
│   └── swagger.ts # Swagger definition setup
├── eslint.config.mjs # ESLint configuration
├── jest.config.js  # Jest configuration
├── next.config.ts  # Next.js configuration
├── package.json    # Project dependencies and scripts
├── postcss.config.mjs # PostCSS configuration (for Tailwind)
├── tsconfig.json   # TypeScript configuration
└── README.md       # Project README
```

## Style Guidelines
- **Language**: TypeScript
- **Linting**: ESLint (configured in `eslint.config.mjs`, likely extending `eslint-config-next`)
- **Formatting**: Consistency enforced by ESLint rules. Consider adding Prettier for automated formatting.
- **Type Safety**: Utilize TypeScript types extensively.
- **API Data Validation**: Zod is used for schema validation (as seen in dependencies).

## Dependencies
Key dependencies from `package.json`:
- **Core**: `next`, `react`, `react-dom`
- **Database**: `@prisma/client`, `prisma`
- **API Docs**: `swagger-ui-express`, `swagger-ui-react`
- **Validation**: `zod`
- **Development**: `typescript`, `ts-node`, `eslint`, `tailwindcss`, `postcss`, `jest`, `@types/*`

## Setup & Running
1.  Install dependencies: `npm install`
2.  Set up database: `npx prisma migrate dev --name init` (or similar)
3.  Seed database (optional): `npm run seed`
4.  Run development server: `npm run dev`
5.  Run tests: `npm run test`
