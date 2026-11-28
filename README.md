# SmartAgri AI

SmartAgri AI is a full-stack agricultural intelligence platform built with **React 19 + Vite 8**, **FastAPI**, and **Neon PostgreSQL**. It provides farmer authentication, market price intelligence, Karnataka APMC reference tracking, statistical price-trend forecasting, an AI agronomy assistant, and farm operations persistence.

---

## Features

- **Authentication & Security**: User registration, login, `bcrypt` password hashing, JWT Bearer token authentication, and protected user-scoped endpoints (`/auth/register`, `/auth/login`, `/auth/me`).
- **Market Intelligence**: Crop catalog, multi-state mandi prices, Karnataka APMC reference dashboard, nearest-market Haversine search, historical price trends, and moving-average buy/sell/hold advisories (`/api/market/*`).
- **Price Forecasting Baseline**: 7-day and 30-day statistical linear-trend price projections with confidence bounds (`/api/prediction/*`).
- **AI Agronomy Assistant**: Database-grounded crop and market Q&A in English and Kannada (`/api/market/chat`), with optional Groq LLM integration when `GROQ_API_KEY` is configured.
- **Farm & Marketplace Persistence**: PostgreSQL-backed endpoints for agricultural products, delivery orders, farm profile settings, irrigation schedules, fertilizer logs, crop plans, and disease scan logs (`/api/*`).

> **Data Transparency Note**: Market rates and historical trends seeded by `backend/app/services/seed_data.py` are labeled `data_source: "reference_dataset"` (demo/baseline data) and are not claimed to be live real-time APMC feeds. Price forecasts use a transparent linear-trend statistical baseline (`linear_trend_baseline`).

---

## Technology Stack

- **Frontend**: React 19, Vite 8, React Router 7, Recharts, Leaflet / React-Leaflet, Lucide Icons
- **Backend**: Python, FastAPI, Uvicorn, SQLAlchemy 2, Alembic, PyJWT, bcrypt
- **Database**: Neon Cloud PostgreSQL (`psycopg` / `pg8000` with SSL & connection pooling)
- **Deployment**: Render (Backend) + Vercel (Frontend)

---

## Project Architecture & Folder Structure

```text
SmartAgri-Ai/
├── backend/
│   ├── alembic/                  # Alembic migration environment & version scripts
│   ├── app/
│   │   ├── models/               # SQLAlchemy models (User, Product, Market, Farm)
│   │   ├── routes/               # FastAPI routers (auth, market, prediction, farm)
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/             # Idempotent reference data seeder
│   │   ├── config.py             # Environment-based settings
│   │   ├── database.py           # Neon PostgreSQL engine, pooling & health check
│   │   ├── main.py               # FastAPI app, CORS, lifespan & /health
│   │   └── security.py           # bcrypt hashing & JWT Bearer auth
│   ├── alembic.ini
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── public/                   # Static assets & crop images
│   ├── src/
│   │   ├── components/           # Layout, Navbar, Sidebar, ProtectedRoute
│   │   ├── context/              # AuthContext
│   │   ├── pages/                # Dashboard, Market, KarnatakaMarket, PricePrediction, etc.
│   │   └── services/api.js       # Centralized fetch client using VITE_API_BASE_URL + JWT
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json               # SPA routing rewrites for Vercel
│   └── vite.config.js
├── .gitignore
├── render.yaml                   # Render backend deployment blueprint
└── README.md
```

---

## Local Setup

### 1. Environment Variables

**Backend (`backend/.env`)**:
Copy `backend/.env.example` to `backend/.env` and set your Neon PostgreSQL connection string:
```env
DATABASE_URL=postgresql://USER:PASSWORD@ep-your-project.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET_KEY=your-long-random-secret-key
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ENVIRONMENT=development
```

**Frontend (`frontend/.env`)**:
Copy `frontend/.env.example` to `frontend/.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 2. Backend Setup & Database Migrations

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

FastAPI interactive docs will be available at `http://127.0.0.1:8000/docs` and health check at `http://127.0.0.1:8000/health`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## API Overview

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Server & Neon PostgreSQL health check |
| `POST` | `/auth/register` | Public | Register user & return JWT access token |
| `POST` | `/auth/login` | Public | Authenticate user & return JWT access token |
| `GET` | `/auth/me` | Bearer | Get current authenticated user |
| `GET` | `/api/market/crops` | Public | List crops metadata |
| `GET` | `/api/market/prices` | Public | Filter market prices by commodity/state/district |
| `GET` | `/api/market/karnataka-crops` | Public | Karnataka APMC reference crops |
| `GET` | `/api/market/karnataka-locations` | Public | Karnataka districts and markets |
| `GET` | `/api/market/nearest` | Public | Nearest markets by Haversine distance |
| `GET` | `/api/market/historical-trends` | Public | Historical price series |
| `GET` | `/api/market/ai-recommendation` | Public | Moving-average SELL/HOLD/MONITOR advisory |
| `POST` | `/api/market/chat` | Public | AI agronomy assistant (EN/KN) |
| `GET` | `/api/prediction/full` | Public | Full 7d/30d price forecast baseline |
| `GET` | `/api/prediction/tomorrow` | Public | Tomorrow's predicted price |
| `GET` | `/api/prediction/7days` | Public | 7-day forecast series |
| `GET` | `/api/prediction/30days` | Public | 30-day forecast series |
| `GET` | `/api/prediction/recommendation` | Public | Forecast recommendation |
| `GET` | `/api/products` | Public | List agricultural products |
| `GET/POST` | `/api/orders` | Bearer | List or create delivery orders |
| `GET/PUT` | `/api/settings` | Bearer | Get or update farm profile settings |
| `GET/POST/DELETE` | `/api/irrigation/schedules` | Bearer | Manage irrigation schedules |
| `GET/POST` | `/api/fertilizer/logs` | Bearer | Manage fertilizer & soil logs |
| `GET/POST` | `/api/crop-plans` | Bearer | Manage started crop plans |
| `GET/POST` | `/api/disease-scans` | Bearer | Log crop disease scans |

---

## Deployment

### Backend on Render
1. Push repository to GitHub (verify `.env` files are excluded).
2. Create a new **Web Service** on Render (or use `render.yaml`):
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Pre-Deploy Command**: `alembic upgrade head`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
3. Set environment variables in Render: `DATABASE_URL` (Neon URL), `JWT_SECRET_KEY`, `CORS_ORIGINS` (your Vercel frontend URL, e.g. `https://smartagri-ai.vercel.app`), `ENVIRONMENT=production`.

### Frontend on Vercel
1. Import the GitHub repository in Vercel.
2. Set **Root Directory** to `frontend`.
3. **Build Command**: `npm run build` | **Output Directory**: `dist`.
4. Add environment variable `VITE_API_BASE_URL` pointing to your Render backend URL (e.g. `https://smartagri-ai-backend.onrender.com`).
5. `frontend/vercel.json` is included for SPA client-side routing.
