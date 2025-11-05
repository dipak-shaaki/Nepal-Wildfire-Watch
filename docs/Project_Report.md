## Nepal Wildfire Watch — Project Report

### 1) Introduction
Nepal Wildfire Watch is an AI-enabled web application for real-time wildfire monitoring, risk prediction, and alerting across Nepal. It combines a modern React frontend with a FastAPI backend, integrates external data sources (e.g., NASA FIRMS, weather, elevation), and employs trained machine learning models (Random Forest for prediction, Naive Bayes for bulk scans) to compute fire risk levels.

### 2) Problem Statement and Objectives
- Provide timely insights on potential wildfire risks at specific locations in Nepal.
- Visualize real-time and historical fire activity to support awareness and decision-making.
- Allow users to submit reports and receive alerts; enable admins to run bulk scans and manage alerts.

### 3) Key Features
- Live fire hotspot visualization via NASA FIRMS.
- Interactive prediction: pick a location, auto-fetch weather/elevation, adjust parameters, and get a risk score + confidence.
- Historical statistics: yearly/monthly trends, district rankings, confidence bands, elevation correlations.
- User and admin flows: reporting, alerts, admin scans and management.

### 4) System Architecture Overview
- Frontend (React + Vite + Tailwind + Leaflet): pages and components for map, prediction, stats, alerts, and authentication UI.
- Backend (FastAPI, Python): REST endpoints for prediction, stats, alerts, reports, and authentication; integrates ML models and external APIs.
- Database (MongoDB): stores alerts, reports, messages, users (see `backend/database/mongo.py` and `backend/models/*`).
- ML Models: Random Forest (user prediction) and Naive Bayes (admin scan) loaded via `joblib`.
- External Data: NASA FIRMS for live fires; weather/elevation services for enrichment.

Data flow (high level):
1. User interacts with the React app → submits requests to FastAPI.
2. FastAPI validates/enriches input → loads/scales features → invokes ML model(s).
3. Results returned to frontend → visualized in UI (map, charts, risk panels).
4. Admins can trigger bulk scans and manage alerts via protected routes (JWT).

### 5) Backend Design
- Framework: FastAPI with CORS enabled for the frontend dev origin (`backend/main.py`).
- Modules:
  - `routes/`: API routers such as `fire_routes.py` (FIRMS + stats), `auth_routes.py`, `fire_report_routes.py`, `admin_routes.py`, `contact_routes.py`.
  - `services/`: business logic and integrations, e.g., `fire_stats.py`, `weather.py`, `scan.py`, `model_registry.py`.
  - `models/`: Pydantic and domain models (`user.py`, `fire_report.py`, `admin.py`, `user_message.py`).
  - `database/`: Mongo connection (`mongo.py`).
  - `auth/`: JWT configuration and dependencies.
- ML integration:
  - Models loaded from `backend/model/`: `random_forest_final_model.pkl`, `scaler.pkl`, `naive_bayes.pkl`, `naive_bayes_scaler.pkl`.
  - `POST /predict-manual`: uses Random Forest + scaler to compute probability, risk level, and confidence. VPD is computed from temperature and humidity before inference.
  - `GET /scan-forests`: admin-oriented batch scan using Naive Bayes + its scaler against `forest_dataset.csv` to generate per-forest risk labels.
- Live fires and statistics (`routes/fire_routes.py`):
  - `GET /fires`: fetches real-time fires from NASA FIRMS (basic-auth protected source) for bbox covering Nepal.
  - `GET /fires/yearly`, `/fires/monthly`, `/fires/confidence`, `/fires/elevation`, `/fires/top-districts`, `/fires/heatmap`, `/fires/geo-sample`: serve historical stats derived from local CSVs via `services/fire_stats.py`.
- Security & Auth:
  - JWT via `fastapi_jwt_auth`; secret key configured in `.env` and `auth/jwt_config.py`/settings in `main.py`.
  - `ensure_admin_exists()` on startup guarantees an initial admin (`models/admin.py`).

### 6) Frontend Design
- Stack: React (Vite), Tailwind CSS, Axios, Leaflet for maps.
- Structure: `frontend/src/pages/*` for pages, `frontend/src/components/*` for reusable UI (e.g., `Navbar.jsx`), `context/AuthContext.jsx` for auth state, and `services/fireApi.js` for API calls.
- UX Highlights: interactive map for prediction, live map of FIRMS hotspots, stats dashboards, alerts list, and auth-controlled admin pages.

### 7) Machine Learning Overview
- Random Forest (primary risk predictor):
  - Inputs: latitude, longitude, temperature, humidity, wind_speed, precipitation, elevation, VPD (Vapor Pressure Deficit computed from temperature and humidity).
  - Output: probability of fire → thresholded to produce risk level (High/Moderate/Low) and a confidence message.
- Naive Bayes (admin bulk scan):
  - Inputs: temperature, humidity, rainfall, wind_speed (scaled with `naive_bayes_scaler.pkl`).
  - Output: categorical risk for each forest entry in `forest_dataset.csv`.
- Model artifacts: stored under `backend/model/`. Notebooks in repo (e.g., `Fire_Predict_RF.ipynb`, `fire-predict.ipynb`) document training and experimentation.

### 8) Data Sources
- NASA FIRMS: live fire detections (used for `/fires`).
- Weather API: for temperature, humidity, precipitation, wind (used in prediction enrichment).
- Elevation API: for elevation enrichment.
- Local CSV datasets: historical fires and forest datasets for statistics and admin scans.

### 9) Database
- MongoDB is used for persisting alerts, fire reports, user messages, and users.
- Connection and helpers in `backend/database/mongo.py`; schema/models in `backend/models/*` and related Pydantic schemas under `backend/schemas/*` (e.g., `schemas/fire_alerts.py`).

### 10) API Summary (selected)
User/General:
- `GET /` → health message.
- `POST /predict-manual` → predict risk from manual/auto-enriched inputs.
- `GET /fires` → live FIRMS hotspots in Nepal.
- `GET /fires/yearly` | `/fires/monthly` | `/fires/confidence` | `/fires/elevation` | `/fires/top-districts` | `/fires/heatmap` | `/fires/geo-sample` → stats endpoints.
- `GET /admin/public/alerts` → list public alerts.

Admin (JWT protected):
- `GET /scan-forests` → bulk risk scan across forests.
- Additional CRUD for alerts, fire reports, and contact messages via `admin_routes.py`, `fire_report_routes.py`, `contact_routes.py`.

### 11) Security Considerations
- JWT-based authentication for protected routes; secret managed via environment variables.
- CORS restricted to development origins; tighten in production.
- External API credentials (e.g., NASA Earthdata) must not be hard-coded in production; use secrets management.

### 12) Local Development and Setup
Prerequisites: Python 3.10+, Node.js 18+, MongoDB, and a `.env` file with required keys (e.g., `SECRET_KEY`, API keys).

Backend
1. `cd backend`
2. `pip install -r ../requirements.txt` (or the backend-specific requirements if separated)
3. `uvicorn main:app --reload`

Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Access the app at `http://localhost:5173`.

### 13) Deployment Notes
- Containerize backend and frontend; configure CORS and environment variables for production.
- Use a managed MongoDB instance.
- Add HTTPS termination (e.g., reverse proxy with Nginx or a cloud load balancer).
- Set up background jobs or schedulers if periodic scans or alerting are required.

### 14) Testing and Quality
- Backend tests under `backend/tests/` (e.g., `test_main.py`).
- Linting: frontend ships with ESLint; enforce formatting and type checks as needed.

### 15) Limitations
- FIRMS endpoint in the sample code uses placeholder basic-auth; real credentials and error handling are needed.
- Model generalization depends on training data; continuous retraining and evaluation recommended.
- Rate limits and latency from external APIs can affect UX; consider caching and retries.

### 16) Future Enhancements
- Role-based UI refinements; comprehensive admin dashboards.
- Automated alert creation from live predictions; SMS/Email push notifications.
- Offline-tolerant map tiles and client-side caching for resilience.
- Expand models with additional environmental/vegetation features; uncertainty estimation.
- Add CI/CD, automated tests, and observability (metrics/logging/tracing).

### 17) Repository Structure (high level)
```
backend/        # FastAPI app (routes, services, models, auth, db)
frontend/       # React app (pages, components, assets, config)
model/          # Trained ML artifacts (.pkl, scalers, datasets)
docs/           # Documentation (this report)
notebooks/      # Jupyter notebooks (training/EDA) — various *.ipynb in root
```

### 18) References
- FIRMS: NASA Fire Information for Resource Management System.
- FastAPI documentation: fastapi.tiangolo.com
- React + Vite documentation: vitejs.dev


