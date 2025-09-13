from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import math
from dotenv import load_dotenv
import os
from fastapi_jwt_auth import AuthJWT
from routes import fire,contact_routes, fire_report_routes, fire_routes, admin_routes, test_mongo, auth_routes
from models.admin import ensure_admin_exists




# --- NEW IMPORTS REQUIRED FOR CUSTOM RANDOM FOREST ---
import numpy as np
import sys
from custom_rf import RandomForest
_ = RandomForest

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",   # Vite React frontend
    "http://127.0.0.1:5173"    # sometimes React dev server runs here
]


# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ["http://localhost:5173"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include additional route files
app.include_router(fire_routes.router)
app.include_router(admin_routes.router)
app.include_router(test_mongo.router)  
app.include_router(auth_routes.router)
app.include_router(contact_routes.router)
app.include_router(fire_report_routes.router) 
app.include_router(fire.router)



# ---------------- MODEL LOADING ---------------- #
rf_model = None
scaler = None
nb_model = None

try:
    rf_model = joblib.load("./model/random_forest_final_model.pkl")
    scaler = joblib.load("./model/scaler.pkl")
    print(" Random Forest model and scaler loaded.")
except Exception as e:
    print(f"[ERROR] Could not load RandomForest or scaler: {e}")

try:
    nb_model = joblib.load("./model/naive_bayes.pkl")
    print(" Naïve Bayes model loaded.")
except Exception as e:
    print(f"[ERROR] Could not load Naïve Bayes model: {e}")

# Feature list expected by RandomForest
rf_features = [
    'latitude', 'longitude', 'temperature', 'humidity',
    'wind_speed', 'precipitation', 'elevation', 'vpd'
]

# ---------------- SCHEMAS ---------------- #
class ManualInput(BaseModel):
    latitude: float
    longitude: float
    temperature: float
    humidity: float
    wind_speed: float
    precipitation: float
    elevation: float

class Settings(BaseModel):
    authjwt_secret_key: str = os.getenv("SECRET_KEY")

@AuthJWT.load_config
def get_config():
    return Settings()

# ---------------- ROOT & INIT ---------------- #
@app.get("/")
async def root():
    return {"message": "API is running!"}

@app.on_event("startup")
async def init_app():
    await ensure_admin_exists()

# ---------------- USER PREDICTION ---------------- #
@app.post("/predict-manual")
def predict_manual(data: ManualInput):
    if rf_model is None or scaler is None:
        raise HTTPException(status_code=500, detail="Model or scaler not loaded")

    # Calculate VPD
    try:
        es = 0.6108 * math.exp((17.27 * data.temperature) / (data.temperature + 237.3))
        ea = (data.humidity / 100) * es
        vpd = round(es - ea, 3)
    except Exception:
        vpd = None

    enriched = {
        "latitude": data.latitude,
        "longitude": data.longitude,
        "temperature": data.temperature,
        "humidity": data.humidity,
        "wind_speed": data.wind_speed,
        "precipitation": data.precipitation,
        "elevation": data.elevation,
        "vpd": vpd
    }

    X_input = pd.DataFrame([enriched], columns=rf_features)

    try:
        X_scaled = scaler.transform(X_input)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scaling input: {e}")

    proba = rf_model.predict_proba(X_scaled)[0][1]
    fire_flag = int(proba >= 0.5)

    if proba >= 0.75:
        risk_level = "High"
    elif proba >= 0.40:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    confidence = (
        "High confidence" if proba > 0.75 else
        "Moderate confidence" if proba > 0.50 else
        "Low confidence" if proba > 0.25 else
        "Very low confidence"
    )

    return {
        "fire_occurred": fire_flag,
        "risk_level": risk_level,
        "confidence": confidence,
        "probability": float(proba),
        "input": enriched,
        "risk_message": {
            "High": "🔥 High fire risk! Take precautions.",
            "Moderate": "⚠️ Moderate risk: Be alert.",
            "Low": "✅ Low fire risk. Safe conditions."
        }[risk_level]
    }

# ---------------- ADMIN FULL SCAN ---------------- #
@app.get("/scan-forests")
def scan_forests():
    if nb_model is None:
        raise HTTPException(status_code=500, detail="Naïve Bayes model not loaded")

    try:
        df = pd.read_csv("./model/forest_dataset.csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load dataset: {e}")

    # Load the Naive Bayes scaler
    try:
        nb_scaler = joblib.load("./model/naive_bayes_scaler.pkl")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load Naive Bayes scaler: {e}")

    X = df[["temperature", "humidity", "rainfall", "wind_speed"]]
    X_scaled = nb_scaler.transform(X)
    preds = nb_model.predict(X_scaled)
    df["predicted_risk"] = preds

    results = df[["forest_name", "district", "latitude", "longitude", "predicted_risk"]].to_dict(orient="records")
    return JSONResponse(content=results)
