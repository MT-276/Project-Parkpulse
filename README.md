<!-- prettier-ignore -->
<div align="center">

<img src="https://parkpulse.meitsant.dev/assets/ParkPlus-Logo-Transparent-NoText-nY_y1J6m.png" alt="ParkPulse logo" align="center" height="96" />

# ParkPulse

**Skip the lines. Stop circling. Park instantly.**

[![Live demo](https://img.shields.io/badge/Live_demo-parkpulse.meitsant.dev-862fe7?style=flat-square)](https://parkpulse.meitsant.dev)
![Python](https://img.shields.io/badge/Python-%3E%3D3.10-3776ab?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![React 18](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite 5](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-WAL-003b57?style=flat-square&logo=sqlite&logoColor=white)
![Arduino](https://img.shields.io/badge/Arduino-UNO_R4_WiFi-00878f?style=flat-square&logo=arduino&logoColor=white)

[Overview](#overview) • [Features](#features) • [Getting started](#getting-started) • [Hardware](#hardware) • [API](#api-reference) • [Deployment](#deployment)

</div>

ParkPulse is an IoT smart parking system. Drivers reserve a bay from the browser, tap an RFID card when they arrive, and ultrasonic sensors confirm that a car is actually parked there. Arduino edge hardware reports to a **FastAPI** backend, which stores state in **SQLite**. A **React** dashboard shows every bay's live status.



## Overview

Drivers in busy commercial areas often spend 15–30 minutes circling for a free space. That adds congestion, wastes fuel and increases emissions. Ticket kiosks slow down entry and exit even more, and drivers can't tell whether a bay is really free until they get there.

ParkPulse connects physical sensors to a web booking flow:

1. **Reserve ahead.** Pick a bay, choose a time window and pay. The bay is held for you.
2. **Tap to check in.** Your registered RFID card is your ticket. Tapping the bay reader starts your session.
3. **Sensor-verified presence.** Ultrasonic sensors confirm that a car is in the bay, so occupancy doesn't depend on users reporting it.
4. **Automatic checkout.** When the car leaves, the reservation closes and the bay becomes available again.


The project has three parts:

- **Edge hardware.** Two Arduinos in an I2C master/slave setup. The UNO R3 only times the sonar sensors, which need microsecond precision. The UNO R4 WiFi reads RFID cards, drives the buzzer and LEDs, and sends events to the API.
- **Backend** (`backend/`). A FastAPI app using raw `sqlite3` with no ORM. It handles email OTP login, cookie sessions, the reservation state machine, hardware ingestion and transactional emails sent through Brevo.
- **Frontend** (`frontend/`). A React 18 SPA built with Vite. It includes a marketing landing page, OTP sign-in/sign-up, the live dashboard, a 3-step checkout, and an admin hardware simulator. The background is a Three.js shader canvas.

## Features

- **Live bay grid.** Three bays with status colours: `AVAILABLE`, `HOLD`, `OCCUPIED` and `WRONG_SPOT`. The dashboard refreshes about every 1.5 seconds.
- **Passwordless auth.** Sign in with a 6-digit email OTP. Sessions last 7 days and use an `httponly` cookie.
- **Reservation engine.** Bookings start within the next 24 hours and last 1 to 12 hours. Each user can have **one active reservation** at a time.
- **Tiered pricing.** ₹20 for the first hour, then ₹5 for each additional hour.
- **10-minute hold.** A new reservation holds the bay for 10 minutes. If you don't check in by then, the hold expires automatically and you get an email.
- **3-step checkout.** Schedule → Review → UPI/QR payment, with a 15-minute payment countdown. The payment step is simulated for demos.
- **RFID check-in and wrong-spot detection.** A matching card activates the reservation. A different card, or a car with no reservation, puts the bay in `WRONG_SPOT`, writes an audit log entry and emails the user.
- **Transactional emails.** Branded HTML emails for OTP, registration, booking, cancellation, check-in, checkout, hold expiry and wrong-spot alerts.
- **Admin tools.** A Dev Console that simulates distance, occupancy and RFID taps; a live hardware audit log; a one-click **Reset Spots** button; and a **Bypass Checkout** toggle for instant one-click reservations during demos.

## Getting started

### Prerequisites

- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/) with npm
- A [Brevo](https://www.brevo.com/) account and API key, used to send OTP and notification emails

### Run locally

On Windows, start both servers in one step from the repository root:

```bat
run.bat
```

To start them manually instead, use two terminals:

```bash
# Terminal 1: backend on http://localhost:1654
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 1654
```

```bash
# Terminal 2: frontend on http://localhost:1147
cd frontend
npm install
npm run dev
```

Then open:

| URL | What it is |
| --- | --- |
| http://localhost:1147 | Web app (Vite dev server, proxies `/api` to `:1654`) |
| http://localhost:1654/docs | Interactive Swagger API docs |
| http://localhost:1654/api/health | Health check |

The SQLite database (`backend/parkpulse.db`) is created and seeded with three bays the first time the backend starts.

### Configuration

There is no `.env` loading yet, so configuration lives in the source code:

| Setting | Location |
| --- | --- |
| Brevo API key and sender | [`backend/app/email_service.py`](backend/app/email_service.py) |
| Admin accounts (`ADMIN_EMAILS`) | [`backend/app/main.py`](backend/app/main.py) |
| CORS origins | [`backend/app/main.py`](backend/app/main.py) |
| Dev server port and API proxy | [`frontend/vite.config.js`](frontend/vite.config.js) |

To get admin features (Dev Console, logs, reset, checkout bypass), add your email to `ADMIN_EMAILS` and sign in with it.



## How it works

A reservation moves through these states as hardware events arrive:

1. **Reserve.** The user signs in, picks a bay and completes checkout. The bay changes to `HOLD`.
2. **Arrive.** The driver parks and taps their RFID card. The R4 reads the card UID and asks the R3 for the distance reading. A reading under 15 cm counts as occupied.
3. **Check in.** The backend matches the UID to the reservation. The reservation becomes `ACTIVE`, `checkin_time` is recorded, and the bay shows `OCCUPIED`.
4. **Depart.** When the sensor stops detecting a car, the reservation is marked `COMPLETED` and the bay goes back to `AVAILABLE`.

For the full ER diagram and table definitions, see [`backend/db_schema_design.md`](backend/db_schema_design.md).

## Hardware

| Component | Role |
| --- | --- |
| Arduino UNO R4 WiFi | I2C master. Reads RFID, drives the buzzer and LEDs, and POSTs events to the API |
| Arduino UNO R3 | I2C slave. Runs only the sonar timing loops |
| HC-SR04 ultrasonic sensor ×3 | One per bay. Detects whether a car is present |
| RC522 RFID reader (13.56 MHz, SPI) | Reads the driver's card or fob |
| Piezo buzzer and LEDs | Give feedback at the bay, e.g. an alarm for an unauthorised car |

> [!NOTE]
> Sonar timing is handled on a separate microcontroller because Wi-Fi and HTTP calls on the R4 can block long enough to break the microsecond timing the HC-SR04 needs.

The gateway sends this JSON to `POST /api/hardware/update` on every state change:

```json
{
  "spot_id": 1,
  "distance_cm": 8.4,
  "is_occupied": true,
  "rfid_uid": "A1B2C3D4"
}
```

### Simulating hardware

Admins can drive the full lifecycle from the **Dev Console** on the dashboard. You can also call the endpoint directly:

```bash
# Car arrives at Spot 1 and taps a card
curl -X POST http://localhost:1654/api/hardware/update \
  -H "Content-Type: application/json" \
  -d '{"spot_id": 1, "distance_cm": 8.4, "is_occupied": true, "rfid_uid": "A1B2C3D4"}'

# Car leaves
curl -X POST http://localhost:1654/api/hardware/update \
  -H "Content-Type: application/json" \
  -d '{"spot_id": 1, "distance_cm": 120, "is_occupied": false}'
```

## API reference

Full interactive docs are available at `/docs` when the backend is running.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | – | Health check |
| `POST` | `/api/auth/send-otp` | – | Send a 6-digit OTP for sign-in or sign-up |
| `POST` | `/api/auth/verify-otp` | – | Verify the OTP and set the session cookie |
| `GET` | `/api/auth/me` | Session | Return the current user |
| `POST` | `/api/auth/logout` | Session | End the session |
| `GET` | `/api/spots` | – | List bays with their active reservations |
| `POST` | `/api/spots/reserve` | Session | Create a 10-minute `HOLD` reservation |
| `POST` | `/api/spots/cancel` | Session | Cancel a `HOLD` reservation |
| `POST` | `/api/hardware/update` | – | Receive sensor and RFID events from the gateway |
| `GET` / `POST` | `/api/users` | Admin | List or create users |
| `GET` | `/api/logs` | Admin | Hardware audit log |
| `POST` | `/api/admin/reset` | Admin | Reset all bays to `AVAILABLE` |
| `POST` | `/api/test-email` | Admin | Send a test notification email |

## Project structure

```
Server-Side/
├── run.bat                  # Starts backend and frontend (Windows)
├── Schematic.png            # Hardware wiring diagram
├── backend/
│   ├── requirements.txt
│   ├── db_schema_design.md  # ER diagram and schema reference
│   └── app/
│       ├── main.py          # All routes, auth and the reservation state machine
│       ├── database.py      # Schema, migrations and seeding
│       ├── schemas.py       # Pydantic models
│       └── email_service.py # Brevo integration and HTML templates
└── frontend/
    ├── vite.config.js       # Port 1147, /api proxy
    └── src/
        ├── App.jsx          # History API router and global canvas background
        ├── index.css        # Design tokens and all component styles
        ├── pages/           # Landing, SignIn, SignUp, Dashboard, Checkout
        └── components/      # Dashboard UI, modals, landing sections, reactbits/
```

## Deployment

In production, Nginx serves the static frontend build and reverse-proxies API calls to Uvicorn:

```bash
cd frontend && npm install && npm run build   # outputs frontend/dist/
cd ../backend && pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 1654
```

```nginx
server {
    server_name parkpulse.example.com;
    root /path/to/Server-Side/frontend/dist;

    location /api/ {
        proxy_pass http://127.0.0.1:1654;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

> [!IMPORTANT]
> Add your production domain to the CORS `allow_origins` list in `main.py`. Never delete or reset `parkpulse.db` on a live server, because it holds all users and reservations.

## Roadmap

These features are on the roadmap but not implemented yet. The `users.strikes` column already exists in the schema.

- **Grace-period enforcement.** Give unauthorised or wrong-spot parkers 15 minutes to move, with automated warning emails.
- **5-strike policy.** Record strikes against offenders, suspend accounts that reach 5 strikes, and expire strikes on a rolling 30-day window.
- **WebSockets.** Push updates from the server instead of polling over HTTP.
- **Boom barriers and express lanes.** Control access at the lot entrance.
- **Demand-based pricing.** Adjust rates based on occupancy and time of day.


