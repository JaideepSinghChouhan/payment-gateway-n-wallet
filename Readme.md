# Payment Gateway & N-Wallet

A full-stack payment gateway and digital wallet platform for managing user balances, top-ups, peer-to-peer transfers, and payment confirmations.

It uses transactional ledger updates, idempotency keys, and webhook-based payment confirmation to keep money movement reliable and consistent.

## Tech Stack

### Backend
- TypeScript
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
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

- **Idempotency**: Top-up and transfer endpoints require an `idempotency-key` header to prevent duplicate processing.
- **ACID-safe money movement**: Wallet transfers and top-ups run inside database transactions with wallet locking to avoid race conditions and keep balances consistent.
- **Webhook verification flow**: Payment status is confirmed through the webhook flow before updating transaction and order status.
- **Ledger-based accounting**: Every money movement creates matching debit/credit ledger entries.
- **Wallet locking**: Wallet rows are locked during balance updates to prevent concurrent modification issues.
- **System wallets**: Bank and platform wallets are seeded automatically on startup.

## Installation / Setup

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

### Run everything
If the project is configured as a monorepo, start the backend and frontend in separate terminals.

## Environment Variables

Create a `.env` file in the backend with values similar to these:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/payment_gateway"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
PORT=3000
```

Depending on your payment provider integration, you may also need:

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

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/` | Health check / server status |
| POST | `/auth/*` | Authentication routes |
| GET | `/wallet/balance` | Get the authenticated user’s wallet balance |
| POST | `/wallet/topup` | Add money to the wallet using an idempotency key |
| POST | `/wallet/transfer` | Transfer money to another user using an idempotency key |
| GET | `/transaction/transactions` | Get all transactions for the authenticated user |
| GET | `/transaction/transactions/:id` | Get a transaction by ID |
| POST | `/transaction/transactions/:id/refund` | Refund a transaction |
| POST | `/webhooks/*` | Payment webhook endpoints |
| POST | `/payment/*` | Payment-related routes |
| POST | `/merchant/*` | Merchant-related routes |
| POST | `/admin/*` | Admin-related routes |

## Usage Examples for Endpoints

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

### Fetch transactions
```bash
curl -X GET http://localhost:3000/transaction/transactions \
  -H "Authorization: Bearer <token>"
```

## Architecture Flow

```text
Frontend (React)
   |
   |-- login / auth
   |-- fetch balance
   |-- top-up / transfer with idempotency-key
   v
Backend API (Express + TypeScript)
   |
   |-- Auth middleware
   |-- Rate limiting
   |-- Transaction / Wallet / Payment routes
   v
Service Layer
   |
   |-- Idempotency check
   |-- Wallet locking
   |-- Ledger entry creation
   |-- Transaction status updates
   |-- Webhook confirmation
   v
PostgreSQL + Prisma
   |
   |-- Wallet balances
   |-- Transactions
   |-- Ledger entries
   |-- Idempotency records
   |-- Payment orders
```

## How It Works

1. The frontend sends authenticated requests to the backend.
2. For top-ups and transfers, the backend first checks the `idempotency-key`.
3. Wallet rows are locked before balance updates to prevent double spending.
4. Debit and credit ledger entries are created inside the same transaction.
5. Payment webhooks confirm pending payments and update transaction/order status.
6. The UI refreshes wallet balance and recent transactions after each successful operation.

## Notes

- The backend starts a settlement job on startup.
- The app seeds required system wallets automatically.
- The project uses a wallet + ledger model for reliable balance tracking.
