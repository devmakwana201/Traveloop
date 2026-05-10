# Traveloop – Personalized Travel Planning Made Easy

> Plan trips collaboratively with interactive maps, budgets, and real-time sync.

---

## ✨ Features

- 🗺️ **Interactive Maps** – Google Places, routes & clustering
- ⚡ **Real-Time Sync** – Plan together via WebSocket
- 💰 **Budget Tracking** – Categories, charts & per-person costs
- 👥 **Collaboration** – Multi-user trips with shared itineraries
- 📦 **Packing Lists** – Categories, progress & templates
- 🗒️ **Trip Notes** – Journal entries per day or stop
- 🧾 **Expense Invoice** – Itemized billing with PDF export
- 🌐 **Community** – Share trip experiences with other travelers
- 🏨 **Reservations** – Flights, hotels, restaurants & more
- 📄 **Documents** – Upload & manage trip documents
- 🔔 **Smart Notifications** – In-app trip reminders

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Custom CSS |
| Backend | Node.js + Express |
| Database | SQLite (travel.db) |
| Maps | Leaflet / Mapbox |
| Auth | JWT + MFA (TOTP) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Development

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Start both servers
# Terminal 1 — Frontend (port 5173)
cd client && npm run dev

# Terminal 2 — Backend (port 3001)
cd server && npm run dev
```

### Production (Docker)

```bash
docker run -d --name traveloop \
  -p 3000:3000 \
  -v /opt/traveloop/data:/app/data \
  -v /opt/traveloop/uploads:/app/uploads \
  traveloop/app:latest
```

---

## 🔑 Admin Access

| Field | Value |
|---|---|
| Email | `admin@traveloop.com` |
| Password | `Traveloop@123` |

---

## 📱 Screens (14 Total)

| # | Screen | Route |
|---|---|---|
| 1 | Login | `/login` |
| 2 | Registration | `/register` |
| 3 | Main Dashboard | `/dashboard` |
| 4 | Create Trip | `/dashboard` (modal) |
| 5 | Build Itinerary | `/trips/:id` |
| 6 | Trip Listing | `/dashboard` |
| 7 | User Profile | `/settings` |
| 8 | Activity/City Search | `/trips/:id` → Places tab |
| 9 | Itinerary + Budget | `/trips/:id` → Budget tab |
| 10 | Community | `/community` |
| 11 | Packing Checklist | `/trips/:id` → Lists tab |
| 12 | Admin Panel | `/admin` |
| 13 | Trip Notes/Journal | `/notes` |
| 14 | Expense Invoice | `/invoice` |

---

## 📁 Project Structure

```
TREK/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/           # 14 route-level pages
│   │   ├── components/      # Reusable components
│   │   │   ├── Admin/       # Admin panel tabs
│   │   │   ├── Budget/      # Budget & expense tracking
│   │   │   ├── Collab/      # Real-time collaboration
│   │   │   ├── Dashboard/   # Widgets (currency, timezone)
│   │   │   ├── Layout/      # Navbar, BottomNav, banners
│   │   │   ├── Map/         # Leaflet + Mapbox layers
│   │   │   ├── Packing/     # Packing list panel
│   │   │   ├── Planner/     # Day plan, places, reservations
│   │   │   ├── Settings/    # Account, display, integrations
│   │   │   └── shared/      # Toast, ConfirmDialog, etc.
│   │   ├── store/           # Zustand state stores
│   │   ├── api/             # API client (client.ts)
│   │   ├── i18n/            # 15 language translations
│   │   └── hooks/           # Custom React hooks
│   └── public/              # Static assets & icons
│
├── server/                  # Node.js + Express backend
│   └── src/
│       ├── routes/          # REST API endpoints
│       ├── middleware/       # Auth, upload guards
│       ├── services/        # Business logic
│       └── db/              # SQLite schema & migrations
│
└── data/                    # travel.db (SQLite database)
```

---

## 🌍 Supported Languages

English, Deutsch, Français, Español, Italiano, Nederlands, Polski, Čeština, Magyar, Русский, 中文, 繁體中文, العربية, Bahasa Indonesia, Português

---
