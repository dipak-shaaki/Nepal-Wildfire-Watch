# Nepal Wildfire Watch 

Nepal Wildfire Watch is a **MERN (MongoDB, Express, React, Node.js)** web application with **AI/ML integration** via a FastAPI backend.  
It provides **real-time wildfire risk prediction and alerting for Nepal**, leveraging satellite data, weather APIs, and custom-trained machine learning models.

<<<<<<< HEAD
## Requirements

- Python 3.9+
- FastAPI, Uvicorn, Requests, Pandas, Joblib, Random forest
=======
---

## 📖 Overview
- Real-time fire monitoring across Nepal  
- AI/ML-driven fire risk prediction  
- Alerts and safety information for users  
- Historical statistics & trend analysis  

---

## ✨ Features
>>>>>>> 0469cd0 (fixed forest Scan)

### 1. Homepage
- Introduction to wildfire risk in Nepal  
- News bulletin & informational content  

### 2. Live Map
- Real-time fire hotspot visualization (NASA FIRMS API)  
- Selectable time window (current / past 7 days)  
- Interactive map of Nepal showing ongoing fires  

![Live Map Screenshot](/frontend/public/images/live_map.png)

### 3. Predict
- Interactive map for selecting any location in Nepal  
- Automatic fetching of weather & elevation data  
- Manual parameter adjustment:  
  `latitude, longitude, temperature, humidity, wind speed, precipitation, elevation, VPD`  
- Fire risk prediction using a **Random Forest model trained from scratch**  
- Results display: **risk level + model probability**  

![Prediction UI](/frontend/public/images/predict1.png)
![Prediction UI](/frontend/public/images/predict2.png)

### 4. Stats
- Historical fire statistics & trends  
- Yearly & monthly fire counts  
- Detection confidence bands  
- Top districts by fire count  
- Geographic distribution of fire incidents  

### 5. Contact
- User contact form  
- FAQs & support information  

### 6. Alerts
- Public alerts issued by admins  
- Safety tips & emergency contacts  

### 7. Login & Role-Based Access
- User registration & login  
- Role-based dashboards (Admin & User)  
- OTP verification, password reset  

---

## 👥 Roles & Permissions

### Admin
- View/respond to user messages & fire reports  
- Mark alerts as resolved  
- Run full forest scans using **Naive Bayes**  
- Auto-create alerts for high-risk forests  
- Manage alerts (CRUD), contact forms, and fire reports  

### User (Registered)
- Submit wildfire reports  
- Access prediction, live map, stats, contact, and alerts  

### Visitor
- Access prediction, live map, stats, contact, and alerts  
- Cannot submit fire reports  

---

## 🔮 Prediction System
**Parameters Used:**  
`latitude, longitude, acq_date, temperature, humidity, wind_speed, precipitation, elevation, VPD`

**Model:**  
- Custom Random Forest (Python, trained from scratch)  

**Workflow:**  
1. User selects a location  
2. Weather & elevation data auto-fetched  
3. Data sent to backend  
4. Model predicts fire risk  

---

## 🛠 Technology Stack
- **Frontend:** React (Vite), Leaflet (maps), Axios (API calls)  
- **Backend:** FastAPI (Python), Joblib (model loading), Pandas (data processing)  
- **ML Models:** Random Forest (Prediction), Naive Bayes (admin scan)  
- **Database:** MongoDB (alerts, reports, messages)  
- **External APIs:** NASA FIRMS, OpenWeatherMap, Open-Elevation  

---

## 📡 API Endpoints
```http
POST /predict-manual       # Predict fire risk (manual input)
GET  /fires                # Real-time fire hotspots
GET  /fires/yearly         # Yearly fire statistics
GET  /fires/monthly        # Monthly fire statistics
GET  /fires/confidence     # Confidence levels
POST /reports/             # Submit wildfire report
GET  /admin/public/alerts  # Public alerts
POST /admin/alerts         # Admin alerts (CRUD)
POST /admin/scan-nepal     # Full forest scan (admin only)

Usage
1. Clone Repository
git clone https://github.com/dipak-shaaki/Forest_Fire_Prediction.git

2. Backend Setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

3. Frontend Setup
cd frontend
npm install
npm run dev

4. Access Application

Open in browser: http://localhost:5173

<<<<<<< HEAD
fastapi
=======
📊 Model Training

Refer to:

fire-predict.ipynb
>>>>>>> 0469cd0 (fixed forest Scan)

Fire_Predict_RF.ipynb

Model Files:

random_forest_final_model.pkl

scaler.pkl

<<<<<<< HEAD
=======
📂 File Structure
frontend/   # React app (pages, components, config)
backend/    # FastAPI app (routes, services, models)
model/      # ML model files
>>>>>>> 0469cd0 (fixed forest Scan)

🤝 Contributing

Fork the repository

Create a feature branch

Submit a Pull Request
