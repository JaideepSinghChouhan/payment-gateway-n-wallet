# Payment Gateway & N-Wallet

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A modern payment gateway and digital wallet platform for secure money movement, balance tracking, and transaction management.

It combines idempotent APIs, ACID-safe database transactions, and verified webhook processing to keep financial operations reliable.

## Overview

This project is built for developers who want a practical reference for:
- wallet-based payment flows
- top-up and transfer APIs
- transaction ledger design
- webhook-driven payment confirmation
- safe, transactional money movement

## Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt
- cookie-parser
- cors
- express-rate-limit

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Key Features

- **Idempotency**: Top-up and transfer requests use an `idempotency-key` header to prevent duplicate processing.
- **ACID-safe transactions**: Wallet operations run inside database transactions to ensure consistency.
- **Webhook verification**: Payment updates are confirmed through webhook flows before final state changes are applied.
- **Ledger-based accounting**: Every balance movement is recorded with matching debit and credit entries.
- **Wallet locking**: Concurrent updates are controlled by row-level locking to avoid race conditions.
- **Authentication**: Protected routes require valid user authentication.
- **Operational safety**: Rate limiting and server-side validation help protect the API.

## Screenshots

> Add your UI screenshots here to make the project more portfolio-ready.

| Screen | Preview |
|---|---|
| Dashboard | `./docs/screenshots/dashboard.png` |
| Wallet Balance | `./docs/screenshots/wallet-balance.png` |
| Transfer Flow | `./docs/screenshots/transfer-flow.png` |
| Transaction History | `./docs/screenshots/transactions.png` |

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/` | Health check endpoint |
| POST | `/auth/*` | Authentication-related endpoints |
| GET | `/wallet/balance` | Fetch the authenticated user’s wallet balance |
| POST | `/wallet/topup` | Add funds to the wallet using an idempotency key |
| POST | `/wallet/transfer` | Transfer funds to another user using an idempotency key |
| GET | `/transaction/transactions` | List the authenticated user’s transactions |
| GET | `/transaction/transactions/:id` | Fetch a transaction by ID |
| POST | `/transaction/transactions/:id/refund` | Refund a transaction |
| POST | `/payment/*` | Payment initiation and related routes |
| POST | `/webhooks/*` | Payment webhook endpoints |
| POST | `/merchant/*` | Merchant-related routes |
| POST | `/admin/*` | Admin and management routes |

## Architecture Flow

```text
User
  |
  v
React Frontend
  |
  |-- login / session handling
  |-- wallet actions
  |-- transfer / top-up requests
  v
Express API
  |
  |-- auth middleware
  |-- validation
  |-- rate limiting
  |-- route handlers
  v
Service Layer
  |
  |-- idempotency checks
  |-- wallet locking
  |-- ledger entry creation
  |-- transaction state updates
  |-- webhook verification
  v
PostgreSQL + Prisma
  |
  |-- users
  |-- wallets
  |-- transactions
  |-- ledger entries
  |-- idempotency records
  |-- payment orders
```

## How It Works

1. The frontend sends authenticated requests to the backend.
2. Top-up and transfer requests are guarded by an `idempotency-key`.
3. The backend validates the request and starts a database transaction.
4. Wallet rows are locked before balances are updated.
5. Ledger entries are written in the same transaction.
6. Webhooks confirm payment status and finalize pending operations.
7. The frontend refreshes wallet and transaction state after success.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL

### Backend setup
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### Environment variables

Backend example:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/payment_gateway"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
PORT=3000
```

If required by your payment provider integration:
```env
PAYMENT_PROVIDER_KEY="your_provider_key"
WEBHOOK_SECRET="your_webhook_secret"
```

## Folder Structure

```text
.
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── package.json
└── Readme.md
```

## Example API Usage

### Get wallet balance
```bash
curl -X GET http://localhost:3000/wallet/balance \
  -H "Authorization: Bearer <token>"
```

### Top up wallet
```bash
curl -X POST http://localhost:3000/wallet/topup \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "idempotency-key: topup-123" \
  -d '{"amount":1000}'
```

### Transfer money
```bash
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "idempotency-key: transfer-123" \
  -d '{"recipientId":"user_2","amount":500}'
```

### View transactions
```bash
curl -X GET http://localhost:3000/transaction/transactions \
  -H "Authorization: Bearer <token>"
```

## Why This Project Stands Out

- Demonstrates real-world payment flow design
- Shows how to protect balance updates with transactions and locks
- Highlights idempotent API design for financial systems
- Includes webhook-based state confirmation
- Suitable for backend portfolio, fintech demos, and engineering interviews

## Roadmap

- Add richer dashboard analytics
- Expand webhook event coverage
- Improve test coverage and CI automation
- Add more merchant tooling and settlement visibility

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## License

This project is licensed under the MIT License.
