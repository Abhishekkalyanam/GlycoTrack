# GlycoTrack – Blood Glucose Tracker

> **Your glucose. Your health. Your insights.**

A modern, full-stack healthcare web application designed for diabetic and pre-diabetic patients to track, manage, and analyze daily blood glucose levels. Built with robust validations, user data isolation, and comprehensive reporting.

Developed for the **Kenpath Junior Full Stack Developer Technical Assessment**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Architecture](#project-architecture)
5. [Prerequisites](#prerequisites)
6. [PostgreSQL Database Setup](#postgresql-database-setup)
7. [Environment Configuration](#environment-configuration)
8. [Installation Instructions](#installation-instructions)
9. [Starting the Application](#starting-the-application)
   - [Starting Backend](#how-to-start-backend)
   - [Starting Frontend](#how-to-start-frontend)
10. [Running Automated Tests](#how-to-run-tests)
11. [Demo Credentials](#demo-credentials)
12. [Validation & Business Rules](#validation--business-rules)
13. [Reports Overview](#reports-overview)
14. [UI & Screenshots](#screenshots-section)
15. [Assumptions and Limitations](#assumptions-and-limitations)
16. [Future Improvements](#future-improvements)

---

## Project Overview

**GlycoTrack** is a responsive web application tailored for glycemic self-monitoring. Patients can record blood sugar measurements across four standardized daily time slots, view trends, detect abnormal levels, and review structured reports (Daily, Month-to-date, and Previous Month).

> **Disclaimer:** GlycoTrack is a tracking and self-monitoring tool and does not provide medical diagnoses or treatment advice. Always consult a physician for health concerns.

---

## Features

- **Authentication & Security:**
  - Secure registration and login using JWT tokens and `bcrypt` password hashing (salt rounds: 10).
  - Protected backend API routes with Bearer token authentication.
  - Strict user data isolation: each patient accesses only their own readings and reports.
- **Reading Management:**
  - Add, view, edit, and delete glucose readings.
  - Filter readings by date with real-time feedback.
  - 4 standardized slots: *Morning (fasting)*, *After breakfast*, *After lunch*, *After dinner*.
  - Strict double-layer validation (frontend and backend).
  - Confirmation modal prior to deleting any reading.
- **Comprehensive Reports:**
  - **Daily Report:** Highest, lowest, average (rounded to 1 decimal), total readings count, slot comparison bar chart, and detailed slot breakdown.
  - **Month-to-Date Report:** From the 1st of the month to the selected date, calculating peak, trough, rounded average, total count, and a chronological trend curve.
  - **Previous Month Report:** Complete previous calendar month retrospective with daily averages and stats.
  - Friendly empty states for dates or periods with no readings.
- **Modern Minimal SaaS & Wellness Dashboard:**
  - Distinctive light-theme aesthetic: Off-white background (`#F7F8F5`), white rounded-3xl cards, and deep black sidebar (`#101310`).
  - Vibrant neon lime green accents (`#C5F53C`) for active navigation, completion rings, and primary actions.
  - Spacious 3-column dashboard layout inspired by premium health tracking dashboards.
  - Prominent black **Glucose Overview Card** with circular completion ring, today's average, and slot pills.
  - Dedicated right-hand **"My Daily Readings"** panel tracking the 4 meal slots (*Morning*, *After breakfast*, *After lunch*, *After dinner*) with quick inline logging.
  - Interactive Recharts line & area curves with neon lime gradients and custom dark tooltips.
  - Dark toast notifications for successes and errors.

---

## Technology Stack

### Frontend
- **Framework:** React.js 19 with Vite
- **Language:** JavaScript (ESNext)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (CommonJS)
- **Framework:** Express.js 5
- **Database ORM:** Prisma ORM 6
- **Database:** Local PostgreSQL
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing:** `bcrypt`
- **CORS:** Enabled for cross-origin client requests

### Testing
- **Test Runner:** Jest
- **API Testing:** Supertest

---

## Project Architecture

```
GlycoTrack-Blood-Glucose-Tracker/
├── client/                     # Frontend React application
│   ├── public/
│   │   └── favicon.svg         # Healthcare activity icon
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── EditReadingModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/            # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/              # Application pages
│   │   │   ├── AddReading.jsx
│   │   │   ├── DailyReport.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MonthToDateReport.jsx
│   │   │   ├── PreviousMonthReport.jsx
│   │   │   ├── ReadingHistory.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios client with JWT interceptor
│   │   ├── App.jsx             # Main routing and protection
│   │   ├── index.css           # Tailwind CSS imports
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Express API
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma data model & PostgreSQL mappings
│   │   └── seed.js             # Seed script for demo user & sample readings
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js          # Environment configuration
│   │   │   └── prisma.js       # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── readingController.js
│   │   │   └── reportController.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT authentication middleware
│   │   │   ├── errorHandler.js # Global error handler
│   │   │   └── notFound.js     # 404 handler
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── readingRoutes.js
│   │   │   └── reportRoutes.js
│   │   ├── utils/
│   │   │   └── validators.js   # Centralized validation rules
│   │   ├── app.js              # Express app definition
│   │   └── index.js            # Server entry point
│   ├── tests/                  # Automated integration tests
│   │   ├── auth.test.js
│   │   ├── readings.test.js
│   │   └── reports.test.js
│   ├── .env                    # Environment secrets
│   ├── .env.example            # Template for environment variables
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Ensure the following tools are installed on your machine:
- **Node.js:** v18.x or higher (tested on Node.js v24.x)
- **npm:** v9.x or higher
- **PostgreSQL:** v14.x or higher (running locally on port 5432)

---

## PostgreSQL Database Setup

1. Start your local PostgreSQL server instance.
2. Connect to PostgreSQL and create the `sweety` database:
   ```bash
   psql -U postgres -h localhost -c "CREATE DATABASE sweety;"
   ```
3. Verify your connection credentials (default user: `postgres`).

---

## Environment Configuration

The server expects a `.env` file inside the `server/` directory.

Create `server/.env` based on `server/.env.example`:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:root@localhost:5432/sweety?schema=public"
JWT_SECRET="sweety_super_secret_jwt_key_2026_kenpath_assessment"
NODE_ENV=development
```

*(Replace the PostgreSQL password with your local database credentials if different).*

---

## Installation Instructions

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Push Database Schema & Generate Client
```bash
npm run db:push
```

### 3. Seed Demo Data
```bash
npm run db:seed
```

### 4. Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## Starting the Application

### How to Start Backend

From the `server/` directory:
```bash
npm run dev
```
The server will start listening at: `http://localhost:5000`.
Health endpoint: `http://localhost:5000/api/health`.

### How to Start Frontend

In a separate terminal, from the `client/` directory:
```bash
npm run dev
```
The Vite development server will start at: `http://localhost:3000`.
Open `http://localhost:3000` in your browser.

---

## How to Run Tests

The backend test suite is built with **Jest** and **Supertest** covering:
- User registration and validation
- Login and password verification
- Authentication failure handling and token expiration
- Adding valid readings
- Glucose value boundary validations (40 - 600 mg/dl)
- Duplicate slot enforcement per day
- Maximum 4 readings per day limit
- Future date rejection
- Editing readings without counting the edited entry against the 4 limit
- Deleting readings
- Complete tenant/user data isolation
- Daily, Month-to-date, and Previous Month statistical calculations (highest, lowest, rounded average, count)
- Friendly empty states

Run all tests from the `server/` directory:
```bash
cd server
npm test
```

Expected output:
```text
PASS tests/readings.test.js
PASS tests/reports.test.js
PASS tests/auth.test.js

Test Suites: 3 passed, 3 total
Tests:       35 passed, 35 total
Snapshots:   0 total
```

---

## Demo Credentials

The database seeder automatically creates a sample user populated with rich historical readings:

| Role | Email | Password |
|---|---|---|
| **Demo Patient** | `demo@sweety.com` | `Password123!` |
| **Isolated Test User** | `sarah@sweety.com` | `Password123!` |

> *Tip: On the frontend Login page, click the **"Auto-fill"** button in the top banner to immediately populate the demo credentials.*

---

## Validation & Business Rules

Validation is strictly enforced on **both frontend and backend**:

| Rule | Requirement | Exact Error Message |
|---|---|---|
| **1. Required Value** | Glucose value must not be empty or null | `Please enter a glucose value.` |
| **2. Allowed Range** | Whole integer between 40 and 600 mg/dl | `Value must be between 40 and 600 mg/dl.` |
| **3. Unique Slot** | Only one reading per slot per day per user | `You already have an [slot] reading for this date.` |
| **4. Max Limit** | Maximum 4 readings per day per user | `You can add only 4 readings per day.` |
| **5. Past Dates Only** | Future measurement dates are prohibited | `Date cannot be in the future.` |

**PostgreSQL Concurrency Protection:**
- PostgreSQL unique constraint: `@@unique([userId, date, timeSlot], name: "user_date_slot_unique")`.
- Prisma database transactions (`prisma.$transaction`) are used when creating and updating readings to eliminate race conditions.
- When editing a reading, the existing reading is excluded from the daily count (`id: { not: currentId }`) so edits on days with 4 readings succeed without false errors.

---

## Reports Overview

### A. Daily Report (`/reports/daily`)
- Displays statistics for any selected date (defaults to today).
- Highest reading, Lowest reading, Average reading (rounded to 1 decimal place).
- Total readings count (e.g. `3 / 4`).
- Visual bar chart comparing values across time slots.
- List of all readings for that day.
- Friendly empty state when no readings exist for the date.

### B. Month-to-Date Report (`/reports/month-to-date`)
- Calculates summary statistics from the **1st of the month** through the **selected date**.
- Displays highest, lowest, average (rounded to 1 decimal), and total count.
- Interactive line curve charting chronological readings.
- Complete tabular log of all readings in the period.
- Friendly empty state when no readings exist.

### C. Previous Month Report (`/reports/previous-month`)
- Calculates complete retrospective for the entire **previous calendar month** (e.g., October 1st - October 31st when viewed in November).
- Displays monthly peak, trough, average, and total measurements.
- Daily distribution histogram.
- Tabular log of historical readings.
- Friendly empty state when no readings exist.

---

## Screenshots Section

### 1. Dashboard Overview
*Clean, light-blue healthcare interface showing today's metric cards, quick trend curve, and recent readings.*

### 2. Add Glucose Reading
*Structured form with date limits, slot selector, and real-time validation warnings.*

### 3. Reading History with Filters
*Searchable diary table with date picker filter, health status tags (Normal, Elevated, Low), and edit/delete actions.*

### 4. Delete Confirmation Dialog
*Safe confirmation modal displaying reading details before permanent deletion.*

### 5. Daily, MTD, and Previous Month Reports
*Visual reports with Recharts data visualization, rounded averages, and empty state fallbacks.*

---

## Assumptions and Limitations

1. **Units:** Blood glucose values are recorded and reported in `mg/dl` (milligrams per deciliter), which is the standard healthcare unit in the assessment specification.
2. **Time Zones:** Dates are stored as PostgreSQL `DATE` types (`YYYY-MM-DD`) normalized to UTC midnight to avoid local timezone drift across server and browser.
3. **Medical Disclaimer:** The application provides tracking and data visualization only and does not diagnose diabetes or provide insulin dosage advice.

---

## Future Improvements

- PDF / CSV report export for sharing with physicians.
- HbA1c estimation calculation from 90-day average glucose.
- Insulin dose, medication, and carbohydrate intake logging alongside glucose entries.
- Automated email or SMS reminders for missing meal slots.
- Multi-language support (i18n).
- Dark mode toggle.

