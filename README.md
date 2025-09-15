# Hedera Minimalist Wallet – Backend API

## Table of contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Features & Progress](#features--progress)
- [Progress Details](#progress-details)
- [Project Structure](#project-structure)
- [Local Persistence (SQLite)](#local-persistence-sqlite)
- [Setup Instructions](#setup-instructions)
- [Running Tests](#running-tests)
- [Swagger Access](#swagger-access)
- [Author](#author)

## Description

This backend API, built with NestJS and TypeScript, provides minimal wallet functionalities for the Hedera testnet. It supports account creation, HBAR transfers, token issuance and association, HTS token transfers, and HCS topic messaging. 

All operations are executed via Hedera’s SDK and persisted locally using SQLite. The API is fully documented with Swagger and tested in isolation using Jest.

Main features:

- Hedera account management
- HBAR transfers
- Token creation and association
- Token transfers
- Topic creation and messaging via Hedera Consensus Service

---

## Tech Stack

- TypeScript
- pnpm (package manager)
- NestJS (backend framework)
- @hashgraph/sdk (Hedera SDK)
- SQLite (local data storage)
- Jest (unit testing)
- Swagger (API documentation)

---

## Features & Progress

| Feature                                         | Status      |
|-------------------------------------------------|-------------|
| NestJS project initialization                   | Done        |
| Structure folders: accounts, tokens, topics     | Done        |
| Hedera account creation                         | Done        |
| Account info & balance retrieval                | Done        |
| HBAR transfer                                   | Done        |
| Fungible token creation                         | Done        |
| Token association                               | Done        |
| Token transfer                                  | Done        |
| Topic creation (HCS)                            | Done        |
| Topic message publication                       | Done        |
| Topic message retrieval                         | Done        |
| Unit tests with Jest                            | Done        |
| Swagger documentation generation                | Done        |
| README completion                               | Done        |

---

## Progress Details

### Step 1 - Initialization of the NestJS project

Project initialization included scaffolding via pnpm and the NestJS CLI, generating the standard directory structure (src/,tsconfig.json,package.json, etc.). In src/main.ts, the listener call was modified from  

await app.listen(process.env.PORT ?? 3000);

to

await app.listen(3000, '0.0.0.0');

to force listening on all interfaces. The server was started with

pnpm run start

and the root endpoint was verified in Microsoft Edge at http://localhost:3000, returning Hello World!, confirming a working NestJS Baseline

---

### Step 2 - Structure folders

--- 
### Step 2.1 – Structuring the Accounts Module

We generated an accounts module, controller and service via the Nest CLI.  

A CreateAccountDto was created to type incoming payloads.  

In AccountsService, we implemented createAccoun`, leveraging @hashgraph/sdk to:

- generate a key pair,
- send an AccountCreateTransaction with the given initialBalance,
- retrieve the receipt and return { accountId, publicKey, privateKey, initialBalance }.  

We exposed this logic through a POST /accounts endpoint in AccountsController.  
Environment variables are loaded from .env using dotenv/config.  
A final curl test confirmed the JSON response with the four expected fields.

---

### Step 2.2 – Structuring the Tokens Module

We generated the tokens module, service, and controller via the Nest CLI:

- pnpm exec nest generate module tokens
- pnpm exec nest generate service tokens --no-spec
- pnpm exec nest generate controller tokens --no-spec

The src/tokens directory now contains tokens.module.ts, tokens.service.ts, and tokens.controller.ts, establishing the basic structure for future HTS token endpoints.

We added a CreateTokenDto to type POST /tokens requests, with name, symbol, and initialSupply, validated via class-validator.
The createToken() method in TokensService uses Hedera’s SDK to send a TokenCreateTransaction and return { tokenId, name, symbol, initialSupply }.
Validation and injection are wired into the controller via NestJS decorators.

---

### Step 2.3 – Structuring the Topics Module

We generated the topics module, service, and controller via the Nest CLI:

- pnpm exec nest generate module topics
- pnpm exec nest generate service topics --no-spec
- pnpm exec nest generate controller topics --no-spec

The src/topics directory now contains topics.module.ts, topics.service.ts, and topics.controller.ts, setting up the foundation for future HCS topic endpoints.

Two DTOs were created in src/topics/dto:

- CreateTopicDto: optional memo: string for topic creation
- SendMessageDto: required message: string for publishing content
	
---

### Step 3 Account Creation (POST /accounts)

This endpoint creates a new Hedera account with an initial HBAR balance.

Controller definition:

@Post()
create(@Body() dto: CreateAccountDto) {
  return this.accountsService.createAccount(dto);
}

Service logic:

- Uses the Hedera SDK to create an AccountCreateTransaction
- Specifies the initial balance and network parameters
- Signs the transaction with a generated private key
- Executes the transaction and retrieves the receipt

- Returns:

	- accountId
	- publicKey
	- privateKey
	- initialBalance

Required DTO fields:

- initialBalance: number (≥ 0)

Test command:

curl.exe -X POST http://localhost:3000/accounts -H "Content-Type: application/json" -d "{\"initialBalance\":10}"

Sample response:

{
  "accountId": "0.0.6372035",
  "publicKey": "302a3005...c402c55",
  "privateKey": "302e0201...fc705d2e0",
  "initialBalance": 10
}

Outcome:

A new Hedera account was successfully created with an initial balance of 10 HBAR.
The account credentials (ID + key pair) are returned and persisted locally in the SQLite Database.

- Stored via the AccountEntity in hedera-wallet.db
- Inspected visually in the hedra-wallet.db on Visual Code : table accounts

---

### Step 4 – Account Info & Balance Retrieval (GET /accounts/:accountId)

This endpoint retrieves the current HBAR balance and status of a Hedera account.

Controller definition:

@Get(':accountId')
getAccountInfo(@Param('accountId') accountId: string) {
  return this.accountsService.getAccountInfo(accountId);
}

Service logic:

- Uses the Hedera SDK to:

	- Build an AccountInfoQuery
	- Set accountId as the target
	- Execute the query on the testnet

- Parses and returns:

	- accountId
	- balance
	- status
	
Test command:

curl.exe http://localhost:3000/accounts/0.0.6372035

Sample response:

{
  "accountId": "0.0.6372035",
  "balance": 10,
  "status": "ACTIVE"
}

Outcome:

The account information for 0.0.6372035 was successfully retrieved.
The HBAR balance reflects the latest state on the Hedera testnet

This retrieval does not create a new row in SQLite, but can be cross-checked against existing entries in hedera-wallet.db

---

### Step 5 HBAR Transfer (POST /accounts/transfer)

This endpoint transfers HBAR from one Hedera account to another.

Controller definition:

@Post('transfer')
transfer(@Body() dto: TransferHbarDto) {
  return this.accountsService.transferHbar(dto);
}

Service logic:

- Uses the Hedera SDK to create a TransferTransaction
- Debits the sender account (senderAccountId)
- Credits the recipient (receiverAccountId)
- Signs the transaction with the sender’s private key
- Executes the transaction and retrieves the receipt
- Returns:
	- status
	- transactionId
	- from
	- to
	- amount

Required DTO fields:

- senderAccountId: string
- senderPrivateKey: string
- receiverAccountId: string
- amount: number (≥ 0)

Test command:

curl.exe -X POST http://localhost:3000/accounts/transfer -H "Content-Type: application/json" -d "{\"senderAccountId\":\"0.0.6372035\",\"senderPrivateKey\":\"302e0201...fc705d2e0\",\"receiverAccountId\":\"0.0.6092520\",\"amount\":20}"

Sample response:

{
  "status": "SUCCESS",
  "transactionId": "0.0.6372035@1752897107.714651438",
  "from": "0.0.6372035",
  "to": "0.0.6092520",
  "amount": 20
}

Outcome:

20 HBAR were successfully transferred from account 0.0.6372035 to account 0.0.6092520.
The transaction was finalized on the Hedera testnet and logged in the TransferEntity table in hedera-wallet.db
It - Can be inspected via VS Code SQLite Viewer in transfer_entity table

---

### Step 6 Token Creation (POST /tokens)

This endpoint creates a new fungible HTS token on the Hedera testnet.

Controller definition:

@Post()
create(@Body() dto: CreateTokenDto) {
  return this.tokensService.createToken(dto);
}

Service logic:

- Uses the Hedera SDK to create a TokenCreateTransaction
- Sets token metadata:
	- name, symbol, initialSupply, decimals, adminKey, etc.
- Signs the transaction with the operator key
- Executes the transaction and retrieves the receipt
- Returns:

	- tokenId
	- name
	- symbol
	- initialSupply

Required DTO fields:
- name: string
- symbol: string
- initialSupply: number (≥ 0)

Test command:

curl.exe -X POST http://localhost:3000/tokens -H "Content-Type: application/json" -d "{\"name\":\"MyToken\",\"symbol\":\"MTK\",\"initialSupply\":1000}"

Sample respnse:

{
  "tokenId": "0.0.6371281",
  "name": "MyToken",
  "symbol": "MTK",
  "initialSupply": 1000
}

Outcome:

A new HTS token MTK was successfully created on the Hedera testnet.
Its assigned token ID is 0.0.6371281 and the initial supply is allocated to the treasury account.
It´s stored in the SQLite database via TokenEntity and inspectable in VS Code in table tokens

---

### Step 7 Token association 

This endpoint allows a Hedera account to associate itself with a specific HTS token.
Association is required before the account can receive or hold the token.

Controller definition:

@Post('associate')
associate(@Body() dto: AssociateTokenDto) {
  return this.tokensService.associateToken(dto);
}

Service logic:

- Uses the Hedera SDK to create a TokenAssociateTransaction
- Sets the target accountId and tokenId
- Signs the transaction with the private key of the target account
- Executes the transaction and retrieves the receipt
- Returns:

	- status
	- accountId
	- tokenId

Required DTO fields:

- accountId: string
- privateKey: string
- tokenId: string

Test command:

curl.exe -X POST http://localhost:3000/tokens/associate -H "Content-Type: application/json" -d "{\"accountId\":\"0.0.6372035\",\"privateKey\":\"302e0200506032b......d2e0\",\"tokenId\":\"0.0.6371281\"}"

Sample response:

{
  "status": "SUCCESS",
  "accountId": "0.0.6372035",
  "tokenId": "0.0.6371281"
}

Outcome:

The token 0.0.6371281 was successfully associated with account 0.0.6372035.
The account is now eligible to receive and hold this token.

---

### Step 8 Transfer HTS Tokens (POST /tokens/transfer)

This endpoint transfers a specified amount of a fungible HTS token from one account to another.

Controller definition:

@Post('transfer')
transfer(@Body() dto: TransferTokenDto) {
  return this.tokensService.transferToken(dto);
}

Service logic:

- Uses the Hedera SDK to create a TransferTransaction
- Debits the sender account and credits the recipient
- Signs the transaction with the sender’s private key
- Executes the transaction and retrieves the receipt
- Returns:

	- status
	- transactionId
	- from
	- to
	- tokenId
	- amount

Required DTO fields:

- fromAccountId: string
- fromPrivateKey: string
- toAccountId: string
- tokenId: string
- amount: number (≥ 0)

Test command:

curl.exe -X POST http://localhost:3000/tokens/transfer -H "Content-Type: application/json" -d "{\"fromAccountId\":\"0.0.6106565\",\"fromPrivateKey\":\"302e020100300506032b657004220420e7eb4d09...ac74\",\"toAccountId\":\"0.0.6372035\",\"tokenId\":\"0.0.6371281\",\"amount\":100}"

Sample response:

{
  "status": "SUCCESS",
  "transactionId": "0.0.6106565@1752834587.930207316",
  "from": "0.0.6106565",
  "to": "0.0.6372035",
  "tokenId": "0.0.6371281",
  "amount": 100
}

Outcome:

The token 0.0.6371281 was successfully transferred from account 0.0.6106565 to account 0.0.6372035.
The transaction was accepted and finalized on the Hedera testnet.

The transfer is executed on-chain via Hedera’s testnet, and simultaneously persisted in SQLite via TokenTransferEntity.
Each transaction stores: fromAccountId, toAccountId, tokenId, amount, transactionId, and createdAt.
Verification performed manually in VS Code confirms the row’s presence

---

### Step 9 Topic Creation (POST /topics)

This endpoint creates a new HCS topic on the Hedera testnet, optionally setting a memo, and persists its ID and memo in SQLite.

Controller definition :

@Post()
create(@Body() dto: CreateTopicDto) {
  return this.topicsService.createTopic(dto);
}

Service logic

- Build a TopicCreateTransaction via Hedera SDK
- If provided, set the memo from the DTO
- Execute the transaction and retrieve the receipt
- Extract the topicId
- Save a new TopicEntity (with topicId and memo) in SQLite
- Return { topicId, memo }

Required DTO fields

- memo?: string

Test command:

curl.exe -X POST http://localhost:3000/topics \
  -H "Content-Type: application/json" \
  -d '{"memo":"Project updates"}'

Sample response:

{
  "topicId": "0.0.6381812",
  "memo": "Project updates"
}

Outcome:

A new HCS topic is created on Hedera testnet and persisted in the topic_entity table which is viewable in VS Code’s SQLite Viewer.

---

### Step 10 - Topic Message Publication (POST /topics/:topicId/messages)

This endpoint sends a message to an existing Hedera Consensus Service (HCS) topic and stores a copy in the local SQLite database.

Controller definition:

@Post(':topicId/messages')
sendMessage(@Param('topicId') topicId: string, @Body() dto: SendMessageDto) {
  return this.topicsService.sendMessage(topicId, dto);
}

Service logic:

- Validates the provided topicId
- Constructs a TopicMessageSubmitTransaction using Hedera SDK
- Submits the transaction to the testnet and retrieves the transactionId	
- Persists the message locally in MessageEntity via messageRepo.save
	- Stored fields: topicId, message, transactionId, createdAt

- Returns:

	- topicId
	- message
	- transactionId
	- createdAt

Required DTO fields

- message: string

Test command:

curl.exe -X POST http://localhost:3000/topics/0.0.6381812/messages -H "Content-Type: application/json" -d "{\"message\":\"message test\"}"

Sample response:

{
  "topicId": "0.0.6381812",
  "message": "message test",
  "transactionId": "0.0.6106565@1752946959.548320564",
  "createdAt": "2025-07-19T17:42:47.446Z"
}

Outcome: 

A message was successfully sent to Hedera topic 0.0.6381812, and a copy was stored in the message_entity table of the SQLite database (hedera-wallet.db), confirming persistence.

---

### Step 11 – Topic Message Retrieval (GET /topics/:topicId/messages)

This endpoint retrieves all messages previously submitted to a given Hedera Consensus Service (HCS) topic and stored in the local SQLite database.

Controller definition:

@Get(':topicId/messages')
getMessages(@Param('topicId') topicId: string): Promise<MessageEntity[]> {
  return this.topicsService.getMessages(topicId);
}

Service logic:

- Validates the provided topicId

- Queries the local SQLite database via messageRepo.find({ where: { topicId } })

- Throws a NotFoundException if no messages are found

- Returns an array of persisted MessageEntity objects

Returned fields per message:

- id

- topicId

- message

- transactionId

- createdAt

Test command:

curl.exe -X GET http://localhost:3000/topics/0.0.6850099/messages -H "accept: */*"

Sample response :

[
  {
    "id": 6,
    "topicId": "0.0.6850099",
    "message": "string",
    "transactionId": "0.0.6106565@1757930120.351338335",
    "createdAt": "2025-09-15T09:55:28.119Z"
  }
]

Outcome:

Messages previously submitted to Hedera topic 0.0.6850099 were successfully retrieved from the message_entity table in the SQLite database (hedera-wallet.db). This confirms both persistence and retrievability via public API.

---

## Project Structure

This structure reflects the acttual GitHub repository contents, excluding sensitive and build-specific artifacts

```plaintext
react-hedera-wallet-bakkar_mohamed\
├── test/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── app.controller.spec.ts
│   ├── main.ts
│   ├── accounts/
│   ├── tokens/
│   ├── topics/
│   └── hedera/
├── README.md
├── package.json
├── tsconfig.json
├── jest.config.js
├── pnpm-lock.yml
├── .gitignore
```

---

## Local Persistence (SQLite)

This backend uses SQLite to persist Hedera-related entities locally.  
The database file hedera-wallet.db is automatically created at the root of the project.

---

### ORM: TypeORM  

Entities are defined using TypeORM decorators and synchronized on startup.

### Current Entities

| Entity               | Purpose                                                       |
|----------------------|----------------------------------------------------------------|
| AccountEntity        | Stores created Hedera accounts locally                        |
| TokenEntity          | Stores created HTS fungible tokens                            |
| AssociationEntity    | Tracks token associations per account                         |
| TransferEntity       | Logs native HBAR transfers                                    |
| TokenTransferEntity  | Persists HTS token transfers executed via API                 |
| TopicEntity          | Stores created HCS topics                                     |
| MessageEntity        | Stores messages published to HCS topics                       |

### Storage Location 
 
The database file is located at:  
./hedera-wallet.db

### Configuration  

Configured in app.module.ts using TypeOrmModule.forRoot() with:

{
  type: 'sqlite',
  database: 'hedera-wallet.db',
  entities: [AccountEntity],
  synchronize: true
}

Repository Injection:

Repositories are injected using @InjectRepository() in services.

Example:

After creating a Hedera account via the SDK, the account is stored locally:

await this.accountRepo.save({
  accountId: '0.0.123456',
  publicKey: '...',
  privateKey: '...',
  initialBalance: 1000
});

Development Verification (VS Code):

To inspect the database during development:

- Install the SQLite Viewer extension in VS Code.
- Right-click on hedera-wallet.db in the file explorer.
- Select "Open with SQLite Viewer".
- Browse the relevant table (accounts, tokens, topics, etc.) to confirm persisted rows.

Each row includes:

- Entity-specific fields (e.g. accountId, tokenId, topicId)
- Metadata (e.g. initialBalance, symbol, memo)
- CreatedAt 

This method applies to all future entities stored in SQLite

---

## Prerequisites

- Node.js >= 16.x
- pnpm >= 7.x

---

## Setup Instructions

pnpm install
pnpm run start

---

## curl.exe Quick Reference (Windows CMD)

GET requests:

curl.exe http://localhost:3000/accounts/0.0.6368522

POST requests (must specify method and headers):
curl.exe -X POST http://localhost:3000/accounts ^
  -H "Content-Type: application/json" ^
  -d "{\"initialBalance\":10}"

General syntax:

curl.exe -X <METHOD> <URL> -H "Content-Type: application/json" -d "<JSON payload>"

---

## Running Tests

Jest is configured for unit testing the backend modules (AccountsService, TokensService, TopicsService) using the NestJS testing tools.

Installation was done via pnpm:

pnpm add -D jest ts-jest @types/jest @nestjs/testing

pnpm exec ts-jest config:init

The generated file jest.config.js serves as the base configuration.
Jest runs in TypeScript mode with auto-discovery of .spec.ts files.

Available commands:

pnpm run test       // Runs all test suites

pnpm run test:cov   // Runs all tests and generates coverage report

The coverage report includes detailed metrics per file, function, branch, and line.
It is stored in /coverage/lcov-report/index.html after execution.

Tests will be structured per service using .spec.ts files under src/.
Coverage confirms execution paths for each feature listed

### Unit Testing – AccountsService

A dedicated file src/accounts/accounts.service.spec.ts covers the main logic of the AccountsService independently from the Hedera SDK and SQLite.

Structure:

- Segmented using Jest’s describe() blocks per method:

	createAccount(), getAccountInfo(), and transferHbar()
- SDK calls are fully mocked via jest.mock('@hashgraph/sdk'), including Hbar, PrivateKey, AccountCreateTransaction, etc.
- No network or database dependency is required to run the tests

Error coverage:

- createAccount() throws if receipt.accountId is null → explicitly tested
- getAccountInfo() throws if the Hedera SDK fails → simulated and captured

Execution:

pnpm run test

Outcome: 

6 unit tests passed successfully. The service behavior is reproducible and stable in isolation. Only errors explicitly handled in code are covered.

Coverage:

Jest coverage confirms full execution of accounts.service.ts (100% statements, branches, functions, and lines). The file is fully tested in isolation.

### Unit Testing – TokensService

A dedicated file src/tokens/tokens.service.spec.ts covers the full business logic of the TokensService, including creation, association, and transfer functionalities.

Structure:

- Segmented using Jest’s describe() blocks per method: createToken(), associateToken(), and transferToken()
- SDK calls are fully mocked via jest.mock('@hashgraph/sdk'), including TokenCreateTransaction, TokenAssociateTransaction, TransferTransaction, PrivateKey, etc.
- No network or database dependency is required to run the tests

Error coverage:

- createToken() throws if receipt.tokenId is null → explicitly tested
- associateToken() handles SDK error code 194 (token already associated) → simulated and validated
- Transfer paths are tested with mock status responses

Execution:

pnpm run test

Outcome: 

5 unit tests passed successfully. The service behavior is reproducible and stable in isolation. Only errors explicitly handled in code are covered.
The HTS token transfer via the API is also stored locally in SQLite via TokenTranferEntity table.

Coverage:

Jest reports near-full execution of tokens.service.ts: 100% statements, 100% branches, 100% functions, and 100% lines. All functional paths, conditional branches, and SDK responses are explicitly covered.

### Unit Testing – TopicsService

A dedicated file src/topics/topics.service.spec.ts covers the main logic of the TopicsService, including topic creation and message publication, independently from the Hedera SDK and SQLite.

Structure:

- Segmented using Jest’s describe() blocks for each method: createTopic() and sendMessage()
- SDK calls are fully mocked via jest.mock('@hashgraph/sdk'), including TopicCreateTransaction, TopicMessageSubmitTransaction, and transactionId handling
- Repositories (topicRepo, messageRepo) are mocked via NestJS getRepositoryToken

Error coverage:

- createTopic() throws an error if receipt.topicId is null → explicitly tested and captured

- createTopic() handles conditional memo injection (branch line 30) → covered via dedicated test

- sendMessage() simulates message delivery and persistence with mocked receipt

Execution:

pnpm run test

Outcome:

4 unit tests passed successfully. The TopicsService behaves deterministically and reproduces both success and error scenarios without external dependencies.

Coverage:

Jest reports full execution of topics.service.ts:
100% statements, 100% functions, 100% lines, and 100% branches.
All conditional paths, including memo injection and error handling, are explicitly covered. The service logic is stable, predictable, and thoroughly validated in isolation

---

## Swagger Access

This step adds an interactive documentation layer to the backend API using Swagger.
All REST endpoints are now accessible via a browser-based interface at http://localhost:3000/api.

Integration:

- Installed required packages:

pnpm add @nestjs/swagger swagger-ui-express

- Configured main.ts:

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const app = await NestFactory.create(AppModule);

const config = new DocumentBuilder()
  .setTitle('Hedera Wallet API')
  .setDescription('Backend minimalist for Hedera wallet operations')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup('api', app, document);

### Accounts Module Coverage:

The following endpoints — POST /accounts, GET /accounts/:accountId, and POST /accounts/transfer — are documented via Swagger with:

- @ApiTags('accounts') for logical grouping
- @ApiBody() and @ApiParam() decorators referencing:

	- CreateAccountDto (initialBalance)
	- TransferHbarDto (senderAccountId, senderPrivateKey, receiverAccountId, amount)
	- @ApiParam('accountId') for path variable in GET requests

- @ApiResponse() annotations aligned per route:

	- 201: success for account creation and HBAR transfer
	- 200: success for balance retrieval
	- 400: validation errors or Hedera SDK exceptions (e.g. invalid accountId, insufficient HBAR)

- DTO fields annotated with @ApiProperty() for Swagger schema generation

- Integrated with class-validator for runtime payload validation (@IsString(), @IsInt(), @Min(0))

All returned responses expose consistent fields:

- Creation: accountId, publicKey, privateKey, initialBalance
- Info retrieval: accountId, balance, status
- HBAR transfer: status, transactionId, from, to, amount

Outcome:

The Swagger interface presents a dedicated Accounts section accessible at:
http://localhost:3000/api

This section enables:

- Form-based interaction for creating accounts and sending HBAR
- Path-based queries for checking balance and status
- Runtime validation via DTO schemas and class-validator rules
- Backed by SQLite persistence in AccountEntity and TransferEntity

### Tokens Module Coverage:

The following endpoints — POST /tokens, POST /tokens/associate, and POST /tokens/transfer — are documented via Swagger with:

- @ApiTags('tokens') for logical grouping
- @ApiBody() decorators referencing:	
	
	- CreateTokenDto (name, symbol, initialSupply)
	- AssociateTokenDto (accountId, privateKey, tokenId)
	- TransferTokenDto (fromAccountId, toAccountId, tokenId, amount)

- @ApiResponse() annotations aligned per route:

	- 201: success for creation, association, and transfer
	- 400: validation errors or Hedera SDK exceptions (e.g. insufficient token balance, invalid signatures)

- DTO fields annotated with @ApiProperty() for Swagger schema generation
- Integrated with class-validator for runtime payload validation (@IsString(), @IsInt(), @Min(1))

All returned responses expose consistent fields:

- Creation: tokenId, name, symbol, initialSupply
- Association: status, accountId, tokenId
- Transfer: status, transactionId, from, to, tokenId, amount

Outcome:

The Swagger interface provides a structured Tokens section accessible at:
http://localhost:3000/api

This section enables:


- Form-based testing for each token operation
- Runtime validation via DTO + validator annotations
- Schema traceability for all token actions
- Backed by SQLite persistence in TokenEntity and AssociationEntity (for creation and association)

### App Module Coverage:

The root route — GET / — exposed by AppController serves as a lightweight health check for the backend. It confirms that the NestJS server is running and responsive.

- Documented via Swagger with:

	- @ApiTags('app') for section visibility
	- @ApiOperation({ summary: 'Default API route – verifies backend is reachable' })
	- @ApiResponse({ status: 200, description: 'Returns confirmation string from backend' })

- Returns a static string: "Welcome to Hedera Wallet API by M. Bakkar"
- Does not interact with Hedera SDK or SQLite
- Useful for early-stage testing, container checks, or API monitoring

Outcome:

The Swagger interface includes a minimal "App" section for connectivity validation.
This route ensures that the backend is accessible before engaging with Hedera 

### Topics Module Coverage:

The following endpoints — POST /topics and POST /topics/:topicId/messages — are documented via Swagger with:

- @ApiTags('topics') for logical grouping
- @ApiBody() and @ApiParam() decorators referencing:

	- CreateTopicDto (optional memo field)
	- SendMessageDto (required message field)
	- @ApiParam('topicId') for dynamic path

- @ApiResponse() annotations aligned per route:

	- 201: success for topic creation and message submission
	- 400: validation errors or SDK exceptions (e.g. invalid topicId)

- DTOs annotated with @ApiProperty() for Swagger schema generation
- Combined with class-validator decorators (@IsString(), @IsOptional()) for payload enforcement

All returned responses expose consistent fields:

- Topic creation: topicId, memo
- Message submission: topicId, message, transactionId, createdAt

Outcome:

The Swagger interface provides a dedicated Topics section accessible at:
http://localhost:3000/api

This section enables:

- Form-based creation of HCS topics with optional metadata
- Submission of string messages to active topics via typed payloads
- Persistence confirmed locally via TopicEntity and MessageEntity
(visible in SQLite and verifiable during development)

---

## Notes

- All code is strictly typed and structured for testability.
- Modules are isolated by responsibility (accounts, tokens, topics, etc.).
- SQLite is used for lightweight storage during development.

---

## Author

Developped by Mohamed Bakkar  


