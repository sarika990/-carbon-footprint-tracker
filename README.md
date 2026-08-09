# Carbon Footprint Tracker — Daily Commute & Local Alternatives

A full-stack web application designed to help users log their daily commutes, calculate operational carbon emissions (CO₂), track streaks, earn milestone achievements, and discover eco-friendly transit alternatives.

---

## 🚀 Key Features

*   **Secure Authentication:** JWT-based user signup and login with session persistence.
*   **Commute Logging:** Input transport mode, distance (km), date, and optional start/end locations.
*   **Live Emissions Preview:** Real-time CO₂ calculations and savings predictions shown inside the trip form.
*   **Interactive Dashboard:**
    *   KPI summary cards tracking weekly emissions, total carbon saved, and streaks.
    *   Interactive **Recharts area chart** plotting carbon emissions vs. savings (toggleable between 7 and 30 days).
    *   Donut chart showing transport mode distribution.
*   **Smart Alternatives Engine:** Personal recommendations based on distance thresholds (e.g., suggesting Bicycles for 2–7 km trips).
*   **Gamification System:**
    *   Streak counters tracking consecutive days logged.
    *   Milestone badges (e.g., *First Commute*, *Eco Rookie*, *Consistent Commuter*) that unlock dynamically.
*   **Trip History Logs:** Detailed log page with custom date range and mode filters, sortable layouts, and delete triggers.
*   **Responsive UI:** Sleek, sustainability-focused design with fixed sidebar on desktop and a bottom tab bar on mobile.

---

## 🛠️ Tech Stack

### Frontend
*   **Core:** React (Vite SPA)
*   **Routing:** React Router DOM (v7)
*   **Styling:** Tailwind CSS (v3) & Lucide Icons
*   **Charts:** Recharts
*   **API Client:** Axios

### Backend
*   **Runtime & Server:** Node.js + Express.js
*   **Authentication:** JSON Web Tokens (JWT) & `bcryptjs`
*   **Database & ORM:** SQLite + Sequelize ORM *(Zero-configuration, database runs out of a local file)*

---

## 📋 Prerequisites

Before setting up the project, make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v20.x or higher recommended)
*   [npm](https://www.npmjs.com/) (v10.x or higher)

---

## ⚙️ Project Structure

```
Carbon_Footprint_Tracker/
├── backend/
│   ├── config/            # SQLite connection setup via Sequelize
│   ├── middleware/        # JWT auth middleware
│   ├── models/            # Sequelize models (User, Trip, Badge)
│   ├── routes/            # Express routes (auth, trips, dashboard, user)
│   ├── utils/             # CO2 calculations & badge awarding logic
│   ├── scripts/           # DB Seeding script
│   ├── database.sqlite    # Local SQLite file database (auto-generated)
│   ├── server.js          # Express entrypoint
│   └── package.json
└── frontend/
    ├── public/            # Public static assets (favicon.svg)
    ├── src/
    │   ├── components/    # Navigation (Sidebar, BottomNav), Loading skeletons
    │   ├── context/       # AuthState context, Global Toast manager
    │   ├── pages/         # Dashboard, History, LogTrip, Badges, Landing (Auth)
    │   ├── utils/         # Axios config (`api.js`)
    │   ├── App.jsx        # Routing rules & layout setups
    │   ├── index.css      # Tailwind base and custom animations
    │   └── main.jsx       # DOM mounting point
    ├── vite.config.js     # Dev server & reverse proxy config
    └── package.json
```

---

## 🔧 Setup & Installation

Follow these steps to set up the project locally:

### 1. Clone & Navigate to Root
Clone the repository to your local directory and open the workspace.

### 2. Configure the Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend/` directory:
   ```env
   PORT=5000
   JWT_SECRET=super_secret_key_for_carbon_tracker_123!
   ```
4. Seed the database (this creates tables and populates a default test account):
   ```bash
   npm run seed
   ```

### 3. Configure the Frontend
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🖥️ Running the Project Locally

### Start the Backend
From the `backend/` folder, run:
```bash
npm start
```
The server will start at [http://localhost:5000](http://localhost:5000).

### Start the Frontend
From the `frontend/` folder, run:
```bash
npm run dev
```
Vite will serve the frontend SPA at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Demo Account Credentials

A default account pre-populated with 3 weeks of commute history, streaks, and unlocked badges has been seeded. 

*   **Email:** `demo@carbon.com`
*   **Password:** `Password123`
*   *(Or click **"⚡ Fast Demo Login"** on the login screen to sign in instantly without typing)*

---

## 📡 API Endpoints Summary

All routes under `/api/trips`, `/api/dashboard`, and `/api/user` are protected and require a `Authorization: Bearer <JWT_TOKEN>` header.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/signup` | Register a new user account |
| **POST** | `/api/auth/login` | Login user, returns user stats & JWT |
| **GET** | `/api/user/me` | Fetch authenticated user's profile |
| **GET** | `/api/user/badges` | Fetch list of earned achievements |
| **POST** | `/api/trips` | Log a commute, calculates CO2 & updates streaks/badges |
| **GET** | `/api/trips` | Retrieve logged commutes (supports mode/date range query filters) |
| **DELETE** | `/api/trips/:id` | Delete a specific commute entry |
| **GET** | `/api/dashboard/summary` | Fetch dashboard aggregate metrics, charts datasets & transit share |

---

## 🌿 Emissions Factors Reference

Calculations are computed server-side using standard parameters (kg CO₂ emitted per km):

| Mode of Transport | CO₂ factor (kg/km) |
| :--- | :--- |
| **Car (Petrol, Solo)** | 0.192 |
| **Bike/Motorcycle** | 0.103 |
| **Bus** | 0.105 |
| **Train/Metro** | 0.041 |
| **Carpool (Assume 4 people)** | 0.048 |
| **Bicycle / Walk** | 0.000 |
