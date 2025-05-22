# Hospital Bed Management System (HBMS)

A full‑stack web application that allows hospital staff to manage beds and patients while utilising a machine‑learning model to predict each patient’s expected length of stay (LoS).

---

## Features

| Module                | Capability                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Bed management**    | List, assign, extend, discharge, and set beds to maintenance.                                                               |
| **Patient registry**  | Admit new patients, record comorbidities & labs, edit details, view readmission history.                                    |
| **LoS prediction**    | Random‑Forest model served by a lightweight Flask micro‑service; prediction stored in the database and displayed in the UI. |
| **Role‑based access** | Passport session auth with roles *Admin*, *BedManager*, *Nurse*.                                                            |
| **Audit trail**       | Server logs record every state transition (admission, discharge, bed status change).                                        |

---

## Architecture

```
Browser ──▶ Express / Node.js  ──► MySQL
                    ▲               ▲
                    │               │
                    └─────Axios─────┘
                          Flask API (predictAPI.py)
```

* **Node** handles all UI, routing, validation, DB access (Sequelize).
* **Flask** holds the pickled Random‑Forest model and exposes `/predict`.
* Components run side‑by‑side via `npm start` (uses `concurrently`).

---

## Prerequisites

* Node.js ≥ 18
* Python ≥ 3.9
* MySQL ≥ 8.0
* Git, npm, pip

---

## Quick start

```bash
# 1. clone repo
$ git clone https://github.com/Jojojokster/Hospital-Bed-Management-System.git
$ cd Hospital-Bed-Management-System

# 2. install Node deps
$ npm install

# 3. install Python deps
$ pip install -r requirements.txt  # contains Flask, pandas, scikit‑learn, joblib

# 4. configure DB & secrets
$ cp .env.example .env
$ nano .env   # adjust values

# 5. create schema
$ mysql -u root -p < scripts/create_db.sql

# 6. launch both services
$ npm start    # runs  node app.js  +  python predictAPI.py

# 7. open browser
http://localhost:3000
```

---

## Environment variables (`.env`)

| Key              | Example                 | Notes                   |
| ---------------- | ----------------------- | ----------------------- |
| `DB_HOST`        | `127.0.0.1`             | MySQL address           |
| `DB_USER`        | `hbms`                  | DB user                 |
| `DB_PASS`        | `strongpassword`        |                         |
| `DB_NAME`        | `hbms_db`               |                         |
| `PORT`           | `3000`                  | Express port            |
| `SESSION_SECRET` | `change_me`             | Passport session secret |
| `ML_SERVICE_URL` | `http://localhost:5000` | Flask base URL          |

---

## Project structure

```
├─ app.js                # Express entry point
├─ config/               # DB + passport config
├─ models/               # Sequelize models (Users, Patients, Beds, ReadmissionLogs)
├─ routes/
│   ├─ moderator.route.js# protected CRUD & bed ops
│   └─ auth.route.js     # login/logout
├─ public/
│   └─ predictLOS.js     # Axios helper
├─ views/                # EJS templates
├─ predictAPI.py         # Flask micro‑service
└─ scripts/create_db.sql # schema
```

---

## Key npm scripts

| Command       | Purpose                                                    |
| ------------- | ---------------------------------------------------------- |
| `npm start`   | `concurrently "py predictAPI.py" "node app.js"` (dev mode) |
| `npm run pm2` | Launch both services with PM2 (production)                 |
| `npm test`    | Mocha/Chai unit tests                                      |

---

## API outline (moderator routes)

| Method & path                       | Role       | Action                  |
| ----------------------------------- | ---------- | ----------------------- |
| GET  `/moderator/patients`          | BedManager | List active patients    |
| POST `/moderator/patientregister`   | BedManager | Admit / readmit patient |
| POST `/moderator/assign-bed`        | BedManager | Occupy bed              |
| POST `/moderator/extend-stay`       | BedManager | Extend stay             |
| POST `/moderator/discharge-patient` | BedManager | Discharge               |

See `routes/moderator.route.js` for the full set.

---

## Prediction service

* **Endpoint**: `POST /predict`
  Body: JSON feature object
  Response: `{ "predicted_length_of_stay": <int> }`
* **Model**: RandomForestRegressor trained on Kaggle *Hospital Length of Stay* + local data.
* **Health check**: `GET /health` returns `{"status":"ok"}`.

---

## Testing scenario

1. Bulk‑add 10 beds via *Manage Beds → Add Beds*.
2. Admit a patient; check dashboard shows bed as **occupied** and LoS prediction.
3. Extend stay; verify `expected_availability` advances.
4. Discharge patient; bed flips to **maintenance**, then to **available** when maintenance concluded.
5. Re‑admit same patient; `rcount` increments and a `ReadmissionLog` entry appears.

Database queries confirm each state change, and log lines in the console provide an audit trail.

---

## Scaling notes

Node is stateless beyond the session store, so multiple instances can run behind a load‑balancer. `predictAPI.py` is also stateless; additional replicas can be spawned to reduce ML latency. Database connection pooling is handled by Sequelize.

---
