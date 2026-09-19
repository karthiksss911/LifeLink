#  LifeLink

> **Real-Time Emergency Blood Donation & Dispatch Platform**

LifeLink is a modern, high-reliability web application engineered to bridge the critical gap between emergency blood requesters and nearby eligible blood donors. Powered by PostGIS geospatial matching, real-time automated dispatching, transaction-safe request deduplication, and privacy-protected contact exchange, LifeLink delivers fast and safe donor-requester matching when every minute counts.

---

##  Key Features

- * Emergency Blood Dispatching**: Requesters can dispatch urgent blood requests with automatic GPS location detection, hospital details, required blood units, and urgency levels (`LOW`, `NORMAL`, `HIGH`, `CRITICAL`).
- * PostGIS Spatial Matching**: Intelligent geospatial algorithms automatically calculate proximity using PostgreSQL/PostGIS (`geography` & `ST_SetSRID`), scanning compatible blood groups within a 25 km radius.
- ** Idempotent Request Protection**: Concurrency-safe backend transaction locking (`pg_advisory_xact_lock`) and frontend guards prevent duplicate submissions on rapid clicks.
- ** Privacy-Protected Contact Exchange**: Donor contact details remain locked until a donor explicitly accepts a match, protecting user privacy.
- ** Donor Management & Dashboard**: Donors can track donation history, update availability status, log completed donations, and respond to live emergency alerts.
- ** Notification System**: Automated real-time notifications alert eligible donors immediately when a compatible emergency request is created nearby.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19 + Vite
- **UI & Styling**: Vanilla CSS with custom Editorial design tokens, Space Grotesk & IBM Plex Mono typography, glassmorphism, and responsive layouts.
- **Icons**: Lucide React (`lucide-react`)
- **HTTP Client**: Native Fetch API wrapper (`api.js`)

### **Backend**
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL with PostGIS Spatial Extension
- **Validation**: Zod schema validation
- **Authentication**: JSON Web Tokens (JWT) & bcrypt password hashing
- **Concurrency Control**: PostgreSQL Advisory Transaction Locks (`pg_advisory_xact_lock`)

---

## 📁 Repository Structure

```text
lifelink/
├── client/                     # Frontend React SPA (Vite)
│   ├── src/
│   │   ├── components/        # UI Components (Navbar, Modals, Cards, Buttons)
│   │   ├── context/           # React AuthContext
│   │   ├── pages/             # Requesters, Donors & Auth Pages
│   │   ├── services/          # API Service Layer
│   │   └── index.css          # Main Design System & CSS Rules
│   ├── index.html
│   └── package.json
│
├── server/                     # Backend Express API Server
│   ├── src/
│   │   ├── controllers/       # Request, Match, User & Auth Controllers
│   │   ├── db/                # Postgres Connection Pool & Migration Scripts
│   │   ├── middleware/        # JWT Authentication & RBAC Middleware
│   │   ├── routes/            # Express API Routes
│   │   └── services/          # Matching Algorithm & Notification Services
│   ├── .env                   # Environment Variables (Config)
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **PostgreSQL**: v14+ with **PostGIS** extension enabled

---

### 1. Database Setup

Ensure PostgreSQL is running, then execute:

```sql
CREATE DATABASE lifelink;
\c lifelink
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

### 2. Backend Setup (`server`)

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in `server/.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres:password@localhost:5432/lifelink
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The API server will run at `http://localhost:5000`.

---

### 3. Frontend Setup (`client`)

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 🛡️ Anti-Duplicate & Concurrency Safeguards

To prevent accidental double-clicks from creating multiple duplicate blood requests, LifeLink implements multi-tiered idempotency:

1. **Frontend Guard**:
   - `isSubmitting` state disables the button immediately on submission.
   - Text changes dynamically to `MATCHING DONORS...` with a rotating spinner.
   - Pointer events are disabled to prevent rapid multi-click events.

2. **Backend Advisory Transaction Locks**:
   - `pg_advisory_xact_lock` locks execution per user during the creation transaction.
   - If a similar request is submitted within 30 seconds, the server detects the duplicate and returns the existing request without creating a duplicate row or re-running matching operations.

---

## 🧪 Production Build

To build the client for production:

```bash
cd client
npm run build
```

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
