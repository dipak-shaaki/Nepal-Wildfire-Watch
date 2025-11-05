## Algorithms, Mathematical Formulations, and Data Preparation

### 1) Data Collection and Enrichment
- Live Fire Detections: NASA FIRMS via `/fires` endpoint in `backend/routes/fire_routes.py` (bbox covering Nepal). Requires Earthdata credentials.
- Weather Data: Example utility `backend/utils/enrich.py` uses Open-Meteo (daily max temperature, max relative humidity, max wind speed, precipitation sum). Alternative `services/weather.py` shows OpenWeather usage pattern.
- Elevation Data: OpenTopodata (SRTM90) in `enrich.py` and a test dataset in `utils/elevation.py`.
- Synthetic Forest Dataset: `backend/ml/forest_dataset_builder.py` constructs `forest_dataset.csv` with features and a rule-based risk label for experimentation and admin scans.

Data Enrichment Flow (point-level):
1. Fetch weather (temperature T in °C, relative humidity RH in %, wind speed W, precipitation P).
2. Fetch elevation E.
3. Compute Vapor Pressure Deficit (VPD) from T and RH (see below).
4. Assemble feature vector for prediction.

### 2) Feature Engineering and Formulas

2.1 Saturation Vapor Pressure and VPD
- Saturation vapor pressure (Tetens approximation):
  es(T) = 0.6108 × exp((17.27 × T) / (T + 237.3))  [kPa]
- Actual vapor pressure:
  ea(T, RH) = es(T) × RH / 100
- Vapor pressure deficit:
  VPD(T, RH) = es(T) − ea(T, RH)

Used in `backend/main.py` and `backend/utils/enrich.py` to compute dryness—higher VPD implies drier conditions and elevated fire risk potential.

2.2 Standardization (Feature Scaling)
Given a fitted scaler (mean μ_j, std σ_j for feature j):
  z_j = (x_j − μ_j) / σ_j
This is applied before inference for the Random Forest (`scaler.pkl`) and Naive Bayes (`naive_bayes_scaler.pkl`).

2.3 Random Forest Classification
- Ensemble of decision trees {T_b} trained on bootstrapped samples with random feature subspacing.
- For a sample x, each tree outputs class probability p_b(y=1|x). The forest average is:
  p(y=1|x) = (1/B) Σ_{b=1..B} p_b(y=1|x)
- Splits typically optimize impurity reduction, e.g., Gini impurity:
  Gini(S) = 1 − Σ_k p_k^2, where p_k is class proportion in node S.
- Inference in this project: the probability is thresholded to categories:
  - High: p ≥ 0.75
  - Moderate: 0.40 ≤ p < 0.75
  - Low: p < 0.40
Confidence text is mapped from probability ranges (see `POST /predict-manual`).

2.4 Naive Bayes Classification (Admin Bulk Scan)
- Gaussian Naive Bayes with features X = (temperature, humidity, rainfall, wind_speed).
- Class-conditional likelihood:
  p(x_j | y=k) = N(x_j; μ_{jk}, σ_{jk}^2)
- Posterior (up to proportionality):
  p(y=k | x) ∝ p(y=k) Π_j p(x_j | y=k)
- Decision rule:
  y* = argmax_k p(y=k | x)
Features are scaled with `naive_bayes_scaler.pkl` before classification.

### 3) Parameter Calculations in Prediction Endpoint
Endpoint: `POST /predict-manual` (`backend/main.py`)
1. Compute VPD from inputs T, RH.
2. Build feature vector: [latitude, longitude, temperature, humidity, wind_speed, precipitation, elevation, VPD].
3. Apply `scaler.pkl` to obtain standardized vector.
4. Predict with `random_forest_final_model.pkl` to get p(y=1|x).
5. Map p to risk level and confidence message; return JSON with probability and inputs.

### 4) Data Cleaning and Preparation
- Spatial bounding: Ensure coordinates fall within Nepal’s bbox (approx 80–89 E, 26–31 N) for FIRMS and user inputs.
- Units harmonization: Temperature in °C, humidity in %, precipitation in mm (per day/hour depending on source), wind speed in consistent units (convert m/s ↔ km/h if needed). The OpenWeather example returns metric; Open-Meteo returns daily aggregates.
- Missing data handling:
  - If weather or elevation fetch fails, either retry or drop the sample; endpoint returns an error for critical failures during prediction scaling.
  - For historical CSVs, drop rows with invalid coordinates or impute simple missing values based on domain knowledge.
- Deduplication: Remove duplicate FIRMS records if present when generating aggregates.
- Feature integrity checks: enforce valid ranges, e.g., 0 ≤ RH ≤ 100, reasonable VPD bounds, temperature plausible for the region.

### 5) Model Training Notes
- Random Forest: trained on curated/engineered datasets (see notebooks like `Fire_Predict_RF.ipynb`, `fire-predict.ipynb`). Save artifacts: `random_forest_final_model.pkl`, `scaler.pkl`.
- Naive Bayes: trained on `forest_dataset.csv` derived from `forest_dataset_builder.py`, with `naive_bayes.pkl` and `naive_bayes_scaler.pkl` saved.
- Suggested evaluation metrics: Accuracy, Precision/Recall, ROC-AUC, calibration (reliability plots). Perform cross-validation and holdout validation.

### 6) End-to-End Flow Summaries

6.1 User Prediction
User selects a point → weather/elevation fetched → VPD computed → features scaled → RF probability → risk level and confidence returned.

6.2 Admin Bulk Scan
Load `forest_dataset.csv` → scale (NB scaler) → Naive Bayes predicts per-forest risk → results returned as tabular JSON.

### 7) Assumptions and Limitations
- Weather/elevation APIs may return nulls or have latency; implement retries/caching for production.
- FIRMS detections have spatial/temporal uncertainty; bbox limits are used for Nepal focus.
- Synthetic datasets are useful for prototyping but should be complemented by real historical labeled data for production models.


