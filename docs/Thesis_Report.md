## Chapter 1: Introduction

### 1.1 Introduction
Nepal Wildfire Watch is an AI-enabled decision-support system that provides real-time wildfire monitoring, risk prediction, and alerting across Nepal. The system integrates satellite detections, weather and elevation data, and machine learning models to estimate wildfire risk at any point location. A React frontend delivers interactive maps, dashboards, and admin tools; a FastAPI backend serves prediction, statistics, and alerting APIs backed by MongoDB.

### 1.2 Problem Statement
Wildfires in Nepal threaten lives, biodiversity, and infrastructure. Early situational awareness and risk estimation are limited by fragmented data, manual analysis, and delayed reporting. There is a need for an integrated platform that combines real-time detections with localized environmental conditions to provide actionable wildfire risk insights for citizens and authorities.

### 1.3 Objectives
- Predict localized wildfire risk using environmental factors and ML models.
- Visualize live and historical fire activity for situational awareness.
- Enable reporting and alert dissemination with role-based access.
- Provide an extensible architecture for future models and data sources.

### 1.4 Scope and Limitation
Scope includes Nepal’s geography, live hotspot visualization, localized risk prediction, historical analytics, and admin-driven bulk scanning. Limitations include dependence on external API availability, model generalization to unseen conditions, and potential data latency/quality issues (e.g., cloud cover affecting satellite detections, sparse sensors).

### 1.5 Development Methodology
An iterative, incremental approach was used: requirements discovery, data acquisition and enrichment, model prototyping, API design, frontend integration, and user feedback cycles. Experiments were carried out with notebooks for feature engineering and model training, followed by productionization with `joblib` artifacts and FastAPI endpoints.

### 1.6 Report Organization
Chapter 1 introduces the project. Chapter 2 covers background and related work. Chapter 3 analyzes requirements and feasibility. Chapter 4 presents design. Chapter 5 details implementation and testing. Chapter 6 concludes and proposes future work.

## Chapter 2: Background Study and Literature Review

### 2.1 Background Study
- Wildfire science: risk increases with high temperature, low humidity, low precipitation, higher vapor pressure deficit (VPD), wind-driven spread, and topography.
- Remote sensing: NASA FIRMS provides near-real-time active fire detections.
- Environmental modeling: VPD computed from temperature and humidity correlates with vegetation dryness.

### 2.2 Literature Review
- Empirical and ML approaches (Random Forest, Naive Bayes, logistic regression) have been used for fire risk mapping with meteorological and topographic inputs.
- FIRMS-based monitoring is common for situational awareness; combining with local weather improves localization.

## Chapter 3: System Analysis

### 3.1 Requirement Analysis
Functional requirements:
- Predict fire risk given a location and environmental inputs.
- Display live fire hotspots and historical statistics.
- Allow users to submit fire reports and view public alerts.
- Admins manage alerts, view reports/messages, and trigger bulk scans.

Non-functional requirements:
- Responsive UI and clear visualizations.
- Secure JWT-based authentication for admin routes.
- Robustness against API failures (graceful errors, fallbacks where possible).

### 3.1.2 Feasibility Analysis
- Technical: Feasible with FastAPI, React, MongoDB, and well-documented external APIs (FIRMS, weather, elevation). ML models packaged via `joblib`.
- Operational: Web-based access reduces deployment friction; admins operate scans and alerts.
- Economic: Uses free/open tiers for data sources; cloud costs manageable at modest scale.
- Schedule: Iterative delivery enables early value with incremental enhancements.

### 3.1.3 Analysis Approach
Object-oriented domain modeling is used at the backend (users, alerts, fire reports). Data processing follows functional service boundaries for stats, weather, elevation, and scans. Key processes include prediction flow, stats aggregation, and admin scan workflow.

## Chapter 4: System Design

### 4.1 Design Overview
- Backend: FastAPI with modular routers (`fire_routes`, `auth_routes`, `admin_routes`, `contact_routes`, `fire_report_routes`), services (`fire_stats`, `weather`, `scan`), and models (`user`, `fire_report`, `admin`). MongoDB stores operational data. CORS configured for the frontend.
- Frontend: React + Vite + Tailwind + Leaflet. Pages for Live Map, Predict, Stats, Alerts, Contact, Auth flows. Context for auth state and service layer for API calls.
- ML: Random Forest for user predictions with `scaler.pkl` for feature scaling; Naive Bayes for admin bulk scans with its own scaler.

### 4.2 Algorithm Details (see Algorithms_and_Data.md for mathematical derivations)
- VPD computed from temperature and humidity; included as a predictive feature.
- Random Forest outputs probability; thresholds map to risk categories with confidence messaging.
- Naive Bayes classifies bulk forest entries using scaled meteorological attributes.

## Chapter 5: Implementation and Testing

### 5.1 Implementation
Tools Used:
- Backend: FastAPI, Pandas, Joblib, Pydantic, fastapi_jwt_auth.
- Frontend: React (Vite), Tailwind, Leaflet, Axios.
- Database: MongoDB.

Implementation Details of Modules:
- Prediction (`POST /predict-manual` in `backend/main.py`):
  - Computes VPD from inputs, assembles features, applies scaler and Random Forest, returns probability, risk level, and confidence text.
- Live Fires and Stats (`backend/routes/fire_routes.py` + `services/fire_stats.py`):
  - Fetches FIRMS data; serves yearly, monthly, confidence, elevation, and geo aggregates based on local CSVs.
- Admin Scan (`GET /scan-forests` in `backend/main.py`):
  - Loads `forest_dataset.csv`, scales selected columns with the Naive Bayes scaler, predicts categorical risk, returns results.
- Auth & Admin (`auth_routes.py`, `admin_routes.py`, `models/admin.py`):
  - JWT configuration and initial admin creation on startup; CRUD for alerts/messages.

### 5.2 Testing
- Unit tests in `backend/tests/` validate core endpoints and health.
- Manual testing via frontend and Postman for end-to-end flows.

### 5.3 Result Analysis
- Model outputs probability and risk categories that align qualitatively with environmental conditions (e.g., high temp/low humidity → higher risk). Historical stats match expected seasonal patterns.

## Chapter 6: Conclusion and Future Recommendations

### 6.1 Conclusion
The system demonstrates a practical pipeline from data acquisition and enrichment to ML-driven fire risk estimation and user-facing visualization for Nepal. Modular design enables future extension to new features and models.

### 6.2 Future Recommendations
- Expand features (vegetation indices, drought indices), improve calibration and uncertainty.
- Add automated alerting pipelines, notifications, and stronger resilience (caching, retries).
- CI/CD, observability, and advanced role-based dashboards.


