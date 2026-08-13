# Unnati Charitable Trust

A full-stack donation platform for Unnati Charitable Trust. Donors can browse causes, see fundraising progress, and make secure payments via Cashfree.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Payments | Cashfree Payment Gateway |

## Project Structure

```
Unnati Charitable/
├── frontend/     # React app
├── backend/      # Express API + Prisma
└── README.md
```

## Donation Categories

- Food for Needy People
- Stationery for Schools
- Orphanage Donations
- Winter Essentials

## Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted — e.g. Neon, Supabase)
- Cashfree sandbox account ([cashfree.com](https://www.cashfree.com))

## Setup

### 1. Database

Create a PostgreSQL database named `unnati_charitable`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and Cashfree credentials
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/unnati_charitable"
CASHFREE_APP_ID="your_cashfree_app_id"
CASHFREE_SECRET_KEY="your_cashfree_secret_key"
CASHFREE_BASE_URL="https://sandbox.cashfree.com/pg"
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:5000"
PORT=5000
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_CASHFREE_MODE=sandbox
```

For production, set `CASHFREE_BASE_URL` to `https://api.cashfree.com/pg` and `VITE_CASHFREE_MODE` to `production`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/categories` | List all donation categories with stats |
| GET | `/api/categories/:slug` | Single category with stats |
| POST | `/api/donations/create-order` | Create donation + Cashfree order |
| POST | `/api/donations/webhook` | Cashfree payment webhook |
| GET | `/api/donations/:id/status` | Get/poll donation status |

## Payment Flow

1. User selects a cause and fills the donation form
2. Backend creates a pending donation and Cashfree order
3. Cashfree checkout opens in the browser
4. On success, Cashfree sends a webhook to the backend
5. User is redirected to the success page, which polls for confirmation

## Cashfree Webhook

For local development, expose your backend using a tool like [ngrok](https://ngrok.com) and set the webhook URL in your Cashfree dashboard:

```
https://your-ngrok-url/api/donations/webhook
```

Also set `BACKEND_URL` in `.env` to the public URL.

## License

Private — Unnati Charitable Trust
