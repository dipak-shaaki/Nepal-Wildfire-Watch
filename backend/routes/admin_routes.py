import datetime
import math
import os
import smtplib
from typing import List, Dict
import joblib
import numpy as np
import pandas as pd
import requests
try:
    from bson import ObjectId
except ImportError:
    # Fallback for in-memory storage
    class ObjectId:
        def __init__(self, value):
            self.value = value
        def __str__(self):
            return str(self.value)
from email.mime.text import MIMEText
from fastapi import APIRouter, HTTPException, Depends
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel, EmailStr

from auth.dependencies import admin_required
from database.mongo import db, alerts_collection

from models.fire_report import UpdateReportStatus

# --------------------------------------------------
# Router
# --------------------------------------------------
router = APIRouter(prefix="/admin", tags=["Admin"])

# --------------------------------------------------
# Email Models
# --------------------------------------------------
class EmailReply(BaseModel):
    to_email: EmailStr
    subject: str
    message: str

class ReportEmailReply(BaseModel):
    report_id: str
    subject: str
    message: str
# --------------------------------------------------
# JSON Sanitizer
# --------------------------------------------------
def _jsonify(value):
    try:
        from bson import ObjectId as _BsonObjectId  # type: ignore
        _has_bson = True
    except Exception:
        _has_bson = False

    if _has_bson and isinstance(value, _BsonObjectId):
        return str(value)
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, dict):
        return {k: _jsonify(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_jsonify(v) for v in value]
    return value


# --------------------------------------------------
# Email Endpoints
# --------------------------------------------------
@router.post("/reply")
def send_reply_email(payload: EmailReply):
    sender = os.getenv("SMTP_SENDER")
    password = os.getenv("SMTP_PASSWORD")
    try:
        msg = MIMEText(payload.message)
        msg['Subject'] = payload.subject
        msg['From'] = sender
        msg['To'] = payload.to_email

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.send_message(msg)

        return {"msg": "Reply sent successfully"}
    except Exception as e:
        raise HTTPException(500, detail=f"Failed to send email: {str(e)}")

@router.post("/reply-report")
async def send_report_reply(payload: ReportEmailReply, user=Depends(admin_required)):
    report_collection = db["fire_reports"]
    try:
        report = await report_collection.find_one({"_id": ObjectId(payload.report_id)})
        if not report:
            raise HTTPException(404, detail="Report not found")
        if not report.get("email"):
            raise HTTPException(400, detail="No email found for this report")

        sender = os.getenv("SMTP_SENDER")
        password = os.getenv("SMTP_PASSWORD")

        msg = MIMEText(payload.message)
        msg['Subject'] = payload.subject
        msg['From'] = sender
        msg['To'] = report['email']

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.send_message(msg)

        return {"msg": "Reply sent successfully to reporter"}
    except Exception as e:
        raise HTTPException(500, detail=f"Failed to send email: {str(e)}")

# --------------------------------------------------
# Load Model (Naïve Bayes)
# --------------------------------------------------
try:
    model = joblib.load("model/naive_bayes.pkl")
    scaler = joblib.load("model/naive_bayes_scaler.pkl")
    print("Naïve Bayes model + scaler loaded")
except Exception as e:
    print(f"Error loading model: {e}")
    model, scaler = None, None

# Features for Naive Bayes model 
nb_features = [
    'temperature', 'humidity', 'rainfall', 'wind_speed'
]

# --------------------------------------------------
# Nepal Districts 
# --------------------------------------------------
NEPAL_DISTRICTS = [
    {"forest": "Makwanpur Forest", "district": "Makwanpur", "province": "Bagmati", "location_details": "Central Nepal", "lat": 27.4167, "lng": 85.0333, "elevation": 467},
    {"forest": "Chitwan National Park", "district": "Chitwan", "province": "Bagmati", "location_details": "Central Nepal", "lat": 27.5170, "lng": 84.4167, "elevation": 415},
    {"forest": "Bardiya National Park", "district": "Bardiya", "province": "Lumbini", "location_details": "Western Nepal", "lat": 28.3833, "lng": 81.3000, "elevation": 200},
    {"forest": "Shuklaphanta National Park", "district": "Kanchanpur", "province": "Sudurpashchim", "location_details": "Far Western Nepal", "lat": 28.8333, "lng": 80.2500, "elevation": 174},
    {"forest": "Langtang National Park", "district": "Rasuwa", "province": "Bagmati", "location_details": "Northern Nepal", "lat": 28.2167, "lng": 85.5167, "elevation": 1000},
    {"forest": "Sagarmatha National Park", "district": "Solukhumbu", "province": "Koshi", "location_details": "Eastern Nepal", "lat": 27.9881, "lng": 86.9250, "elevation": 2845},
    {"forest": "Rara National Park", "district": "Mugu", "province": "Karnali", "location_details": "Northwestern Nepal", "lat": 29.5000, "lng": 82.0833, "elevation": 2990},
    {"forest": "Shey Phoksundo National Park", "district": "Dolpa", "province": "Karnali", "location_details": "Northwestern Nepal", "lat": 29.1667, "lng": 82.8333, "elevation": 2130},
    {"forest": "Khaptad National Park", "district": "Bajhang", "province": "Sudurpashchim", "location_details": "Far Western Nepal", "lat": 29.3333, "lng": 81.1667, "elevation": 1400},
    {"forest": "Banke National Park", "district": "Banke", "province": "Lumbini", "location_details": "Western Nepal", "lat": 28.0000, "lng": 81.7500, "elevation": 200},
    {"forest": "Parsa National Park", "district": "Parsa", "province": "Madhesh", "location_details": "Southern Nepal", "lat": 27.5000, "lng": 84.7500, "elevation": 150},
    {"forest": "Koshi Tappu Wildlife Reserve", "district": "Sunsari", "province": "Koshi", "location_details": "Eastern Nepal", "lat": 26.6667, "lng": 87.0000, "elevation": 100},
    {"forest": "Annapurna Conservation Area", "district": "Kaski", "province": "Gandaki", "location_details": "Central Nepal", "lat": 28.2500, "lng": 83.8333, "elevation": 1000},
    {"forest": "Manaslu Conservation Area", "district": "Gorkha", "province": "Gandaki", "location_details": "Central Nepal", "lat": 28.5833, "lng": 84.5833, "elevation": 1000},
    {"forest": "Kanchenjunga Conservation Area", "district": "Taplejung", "province": "Koshi", "location_details": "Eastern Nepal", "lat": 27.7500, "lng": 87.9167, "elevation": 1500}
]

# --------------------------------------------------
# Helpers
# --------------------------------------------------
def calculate_vpd(temperature, humidity):
    try:
        es = 0.6108 * math.exp((17.27 * temperature) / (temperature + 237.3))
        ea = (humidity / 100) * es
        return round(es - ea, 3)
    except:
        return 1.5

def predict_fire_risk(lat, lng, elevation, temperature, humidity, wind_speed, precipitation):
    if model is None or scaler is None:
        return {"error": "Model not loaded"}
    try:
        # Use precipitation as rainfall for the Naive Bayes model
        rainfall = precipitation
        
        input_data = pd.DataFrame([{
            'temperature': temperature,
            'humidity': humidity,
            'rainfall': rainfall,
            'wind_speed': wind_speed
        }], columns=nb_features)

        X_scaled = scaler.transform(input_data)
        proba = model.predict_proba(X_scaled)[0][1]

        return {
            "probability": float(proba),
            "risk_level": "High" if proba >= 0.60 else "Moderate" if proba >= 0.30 else "Low",
            "fire_flag": int(proba >= 0.5)
        }
    except Exception as e:
        return {"error": str(e)}

def get_real_weather_data(lat, lng):
    API_KEY = os.getenv("OPENWEATHER_KEY", "5341c37b13eb4a2994bda9c8d710103a")
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return {
                "temperature": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "wind_speed": data["wind"]["speed"] * 3.6,
                "precipitation": data.get("rain", {}).get("1h", 0)
            }
        return get_simulated_weather_data(lat, lng)
    except:
        return get_simulated_weather_data(lat, lng)

def get_simulated_weather_data(lat, lng):
    return {
        "temperature": 35 + np.random.normal(0, 5),
        "humidity": 30 + np.random.normal(0, 10),
        "wind_speed": max(2, min(35, 12 + np.random.normal(0, 5))),
        "precipitation": np.random.exponential(0.5),
    }

# --------------------------------------------------
# Scan Nepal 
# --------------------------------------------------
@router.post("/scan-nepal")
async def scan_nepal_fire_risk(user=Depends(admin_required)):
    if model is None or scaler is None:
        raise HTTPException(500, "Model not loaded")

    results = []
    alerts_created = 0
    now = datetime.datetime.utcnow()

    for district in NEPAL_DISTRICTS:
        w = get_real_weather_data(district["lat"], district["lng"])
        pred = predict_fire_risk(district["lat"], district["lng"], district["elevation"],
                                 w["temperature"], w["humidity"], w["wind_speed"], w["precipitation"])
        if "error" not in pred:
            result = {
                "forest": district.get("forest", "Unknown"),
                "district": district["district"],
                "province": district.get("province", "Unknown"),
                "location_details": district.get("location_details", "Nepal"),
                "latitude": district["lat"], 
                "longitude": district["lng"],
                "elevation": district["elevation"],
                "weather_data": w,
                "fire_risk": pred["risk_level"],
                "probability": pred["probability"],
                "fire_flag": pred["fire_flag"]
            }
            results.append(result)

            # Auto-create alert if High risk
            if pred["risk_level"] == "High":
                alert_doc = {
                    "title": f"High Fire Risk in {district['forest']}",
                    "message": f"{district['district']} district has high wildfire risk (score {pred['probability']:.2f})",
                    "latitude": district["lat"],
                    "longitude": district["lng"],
                    "severity": "high",
                    "status": "active",
                    "created_at": now,
                    "expires_at": now + datetime.timedelta(days=3)
                }
                await alerts_collection.insert_one(alert_doc)
                alerts_created += 1

    # Sort all results by probability (highest risk first)
    results.sort(key=lambda x: x["probability"], reverse=True)
    
    # Filter high risk areas for auto-alert creation
    high_risk_districts = [r for r in results if r["fire_risk"] == "High"]
    
    return {
        "total_scanned": len(results),
        "alerts_created": alerts_created,
        "high_risk_districts": results[:10],  # return top 10 areas by risk (all risk levels)
        "results": results[:10]   # return top 10 risky areas
    }

# Test endpoint without authentication for debugging
@router.post("/test-scan-nepal")
async def test_scan_nepal_fire_risk():
    """Test endpoint for scanning Nepal without authentication"""
    if model is None or scaler is None:
        raise HTTPException(500, "Model not loaded")

    results = []
    alerts_created = 0
    now = datetime.datetime.utcnow()

    for district in NEPAL_DISTRICTS:
        w = get_real_weather_data(district["lat"], district["lng"])
        pred = predict_fire_risk(district["lat"], district["lng"], district["elevation"],
                                 w["temperature"], w["humidity"], w["wind_speed"], w["precipitation"])
        if "error" not in pred:
            result = {
                "forest": district.get("forest", "Unknown"),
                "district": district["district"],
                "province": district.get("province", "Unknown"),
                "location_details": district.get("location_details", "Nepal"),
                "latitude": district["lat"], 
                "longitude": district["lng"],
                "elevation": district["elevation"],
                "weather_data": w,
                "fire_risk": pred["risk_level"],
                "probability": pred["probability"],
                "fire_flag": pred["fire_flag"]
            }
            results.append(result)

    # Sort all results by probability (highest risk first)
    results.sort(key=lambda x: x["probability"], reverse=True)
    
    return {
        "total_scanned": len(results),
        "alerts_created": alerts_created,
        "high_risk_districts": results[:10],  # return top 10 areas by risk (all risk levels)
        "results": results[:10]   # return top 10 risky areas
    }

# --------------------------------------------------
# Alerts CRUD
# --------------------------------------------------

@router.post("/test-alerts")
async def create_test_alert(alert_data: dict):
    try:
        now = datetime.datetime.utcnow()
        doc = {
            "title": alert_data.get("title") or "Forest Fire Alert",
            "message": alert_data.get("message") or "High fire risk detected.",
            "latitude": alert_data.get("latitude"),
            "longitude": alert_data.get("longitude"),
            "severity": (alert_data.get("severity") or alert_data.get("risk_level") or "moderate").lower(),
            "duration_days": int(alert_data.get("duration_days") or 3),
            "forest": alert_data.get("forest"),
            "district": alert_data.get("district"),
            "province": alert_data.get("province"),
            "location_details": alert_data.get("location_details"),
            "risk_level": alert_data.get("risk_level") or "Moderate",
            "probability": float(alert_data.get("probability") or 0),
            "weather_data": alert_data.get("weather_data") or {},
            "precautions": alert_data.get("precautions") or "Avoid open flames and report smoke immediately.",
            "reason": alert_data.get("reason") or "Model-indicated risk."
        }
        doc["status"] = "active"
        doc["created_at"] = now
        doc["expires_at"] = now + datetime.timedelta(days=doc["duration_days"])

        result = await alerts_collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        return _jsonify(doc)
    except Exception as e:
        print(f"Error creating test alert: {e}")
        raise HTTPException(500, f"Failed to create test alert: {str(e)}")

@router.get("/alerts")
async def get_all_alerts(user=Depends(admin_required)):
    alerts = await alerts_collection.find().sort("created_at", -1).to_list(100)
    for a in alerts: a["id"] = str(a.pop("_id"))
    return alerts

@router.get("/alerts/{alert_id}")
async def get_alert(alert_id: str, user=Depends(admin_required)):
    doc = await alerts_collection.find_one({"_id": ObjectId(alert_id)})
    if not doc:
        raise HTTPException(404, "Alert not found")
    doc["id"] = str(doc.pop("_id"))
    return _jsonify(doc)

@router.get("/public/alerts")
async def get_public_alerts():
    alerts = await alerts_collection.find({"status": "active"}).sort("created_at", -1).to_list(100)
    for a in alerts: a["id"] = str(a.pop("_id"))
    return alerts


@router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str, user=Depends(admin_required)):
    result = await alerts_collection.delete_one({"_id": ObjectId(alert_id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "Alert not found")
    return {"message": "Alert deleted"}

@router.post("/alerts/bulk")
async def create_bulk_alerts(alerts_data: List[dict], user=Depends(admin_required)):
    """Create multiple alerts at once"""
    try:
        now = datetime.datetime.utcnow()
        created_alerts = []
        
        for alert_data in alerts_data:
            # Add required fields
            alert_doc = {
                "title": alert_data.get("title", "Forest Fire Alert"),
                "message": alert_data.get("message", ""),
                "latitude": alert_data.get("latitude", 0),
                "longitude": alert_data.get("longitude", 0),
                "severity": alert_data.get("severity", "medium"),
                "status": "active",
                "created_at": now,
                "expires_at": alert_data.get("expires_at", now + datetime.timedelta(days=3)),
                # Additional fields from frontend
                "forest": alert_data.get("forest", ""),
                "district": alert_data.get("district", ""),
                "province": alert_data.get("province", ""),
                "location_details": alert_data.get("location_details", ""),
                "risk_level": alert_data.get("risk_level", "Moderate"),
                "probability": alert_data.get("probability", 0),
                "weather_data": alert_data.get("weather_data", {}),
                "precautions": alert_data.get("precautions", ""),
                "reason": alert_data.get("reason", "")
            }
            
            result = await alerts_collection.insert_one(alert_doc)
            alert_doc["id"] = str(result.inserted_id)
            created_alerts.append(alert_doc)
        
        return {"created_alerts": created_alerts, "count": len(created_alerts)}
    except Exception as e:
        raise HTTPException(500, f"Failed to create bulk alerts: {str(e)}")

# --------------------------------------------------
# Single Alert CRUD (to match frontend adminApi)
# --------------------------------------------------

@router.post("/alerts")
async def create_alert(alert_data: dict, user=Depends(admin_required)):
    """Create a single alert document."""
    try:
        now = datetime.datetime.utcnow()
        alert_doc = {
            "title": alert_data.get("title", "Forest Fire Alert"),
            "message": alert_data.get("message", ""),
            "latitude": alert_data.get("latitude", 0),
            "longitude": alert_data.get("longitude", 0),
            "severity": (alert_data.get("severity") or alert_data.get("risk_level") or "moderate").lower(),
            "status": alert_data.get("status", "active"),
            "created_at": now,
            "expires_at": alert_data.get("expires_at", now + datetime.timedelta(days=int(alert_data.get("duration_days") or 3))),
            # Optional meta
            "forest": alert_data.get("forest", ""),
            "district": alert_data.get("district", ""),
            "province": alert_data.get("province", ""),
            "location_details": alert_data.get("location_details", ""),
            "risk_level": alert_data.get("risk_level", "Moderate"),
            "probability": float(alert_data.get("probability", 0)),
            "weather_data": alert_data.get("weather_data", {}),
            "precautions": alert_data.get("precautions", ""),
            "reason": alert_data.get("reason", "")
        }

        result = await alerts_collection.insert_one(alert_doc)
        alert_doc["id"] = str(result.inserted_id)
        return _jsonify(alert_doc)
    except Exception as e:
        raise HTTPException(500, f"Failed to create alert: {str(e)}")


@router.put("/alerts/{alert_id}")
async def update_alert(alert_id: str, data: dict, user=Depends(admin_required)):
    """Update fields of a single alert by id."""
    try:
        update_fields = {k: v for k, v in data.items() if k not in {"_id", "id"}}
        if not update_fields:
            raise HTTPException(400, "No fields to update")

        result = await alerts_collection.update_one({"_id": ObjectId(alert_id)}, {"$set": update_fields})
        if getattr(result, "modified_count", 0) == 0:
            # Could be that nothing changed; still try to read it back
            doc = await alerts_collection.find_one({"_id": ObjectId(alert_id)})
            if not doc:
                raise HTTPException(404, "Alert not found")
        doc = await alerts_collection.find_one({"_id": ObjectId(alert_id)})
        doc["id"] = str(doc.pop("_id"))
        return _jsonify(doc)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to update alert: {str(e)}")


@router.post("/alerts/cleanup")
async def cleanup_expired_alerts(user=Depends(admin_required)):
    """Mark alerts as expired where expires_at < now and status is active."""
    try:
        now = datetime.datetime.utcnow()
        # Update many: status active and expires_at < now -> status expired
        result = await alerts_collection.update_many(
            {"status": "active", "expires_at": {"$lt": now}},
            {"$set": {"status": "expired"}}
        )
        return {"updated": getattr(result, "modified_count", 0)}
    except Exception as e:
        raise HTTPException(500, f"Failed to cleanup alerts: {str(e)}")

