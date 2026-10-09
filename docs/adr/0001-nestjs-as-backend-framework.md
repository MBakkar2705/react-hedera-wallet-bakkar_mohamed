# ADR 0001: NestJS as the backend framework

- Status: Accepted
- Date: 2026-10-09

## Context

The backend has four functional areas: accounts, tokens, topics and the Hedera client. It uses `@hashgraph/sdk`, Swagger, SQLite through TypeORM and Jest.

The criteria used to choose the framework:

- **Hedera SDK compatibility:** the framework must run the official `@hashgraph/sdk` package without workarounds.
- **TypeScript support:** first-class TypeScript support, with DTOs and typed classes.
- **Ecosystem maturity:** documented and maintained integrations for what the backend needs: Swagger, a database through TypeORM, and unit tests with Jest.
- **Modular architecture:** a structure that matches the functional areas (accounts, tokens, topics, Hedera client).

This record covers the framework. The runtime (Node.js) and the package manager (pnpm) are not covered.

## Decision

The backend is built with NestJS, in TypeScript, on its default HTTP adapter (Express, through `@nestjs/platform-express`).

How it meets the criteria:

1. **Modules.** NestJS organizes the code in modules made of a controller and a service. This matches the areas of the backend: `AccountsModule`, `TokensModule`, `TopicsModule` and the Hedera module. Each one can be developed and tested on its own.
2. **Dependency injection.** The container provides the services and the shared objects to the classes that need them, so a test can replace a dependency with a mock without changing the class.
3. **TypeScript first.** DTOs and typed classes are the normal way of writing a NestJS application, not an addition.
4. **Ecosystem.** Swagger (`@nestjs/swagger`), TypeORM (`@nestjs/typeorm`) and the testing tools (`@nestjs/testing`) are official packages with documentation.
5. **Hedera SDK.** NestJS runs on Node.js, which is the runtime of `@hashgraph/sdk`, so the SDK is used in the services as a normal dependency.

## Alternatives considered

- **Express alone.** Rejected on the modular architecture criterion. Express is light and well known, but it gives no structure. With several functional areas, the code could become hard to maintain. NestJS gives a structure from the start, and it runs on Express anyway.
- **Fastify.** Rejected on the ecosystem and familiarity criteria. Fastify has a better HTTP throughput than Express, but its conventions differ from NestJS and it is less familiar to the author. NestJS can use Fastify as its HTTP adapter if performance becomes a problem, without rewriting the application code.
- **TypeScript without a framework.** Rejected on the modular architecture criterion. Dependency injection, the module organization and the middleware would have to be written by hand. This is work that does not bring anything to the project.

## Consequences

- The code follows NestJS conventions: decorators, modules, providers, DTOs. A new feature is a module with a controller and a service.
- The structure is more demanding than a few Express routes for an application of this size.
- Swagger, TypeORM and Jest tests are integrated through the official NestJS packages.
- Changing the HTTP adapter to Fastify is possible according to the NestJS documentation, but it has not been done here.

## Verification

### Proven

- `backend/package.json` declares `@nestjs/core` and `@nestjs/common` `^11.1.4`, `@nestjs/platform-express`, `@nestjs/swagger`, `@nestjs/typeorm`, `@hashgraph/sdk` and, in the dev dependencies, `@nestjs/testing`.
- `backend/src/` contains the folders `accounts`, `tokens`, `topics` and `hedera`, each with a module file (`*.module.ts`).
- `pnpm test` runs 4 suites and 20 tests (reported by the author after the reorganization, see ADR 0012).
- The backend starts and serves Swagger at `/api` (observed by the author after the reorganization, see ADR 0012).

### Not proven

- That the HTTP adapter can be changed to Fastify without changes: this is stated by the NestJS documentation and was not tried here.
