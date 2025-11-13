﻿# Nepal Wildfire Watch 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 14+](https://img.shields.io/badge/node.js-14+-green.svg)](https://nodejs.org/)

Nepal Wildfire Watch is a **full-stack web application** with **AI/ML integration** that provides **real-time wildfire risk prediction and alerting for Nepal**. It combines satellite data, weather APIs, and custom-trained machine learning models to help prevent and monitor forest fires.

**Tech Stack:**  (MongoDB, React) + FastAPI (Python Backend)

---

## 📑 Table of Contents

- [Screenshots](#-screenshots)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [API Documentation](#-api-endpoints)
- [Model Training](#-model-training)
- [Project Structure](#-project-structure)
- [Roles & Permissions](#-roles--permissions)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📸 Screenshots

### Homepage
**Introduction to wildfire risk in Nepal • News bulletin & informational content**

![Homepage](./screenshots/Homepage.png)

---

### Live Map
**Real-time fire hotspot visualization (NASA FIRMS API) • Interactive map of Nepal showing ongoing fires • Selectable time window (current / past 7 days)**

![Live Map](./screenshots/live_map.png)

---

### Predict
**Interactive map for selecting any location in Nepal • Automatic fetching of weather & elevation data • Manual parameter adjustment (temperature, humidity, wind speed, etc.) • Fire risk prediction using Random Forest model • Results display: risk level + model probability**

![Predict](./screenshots/predict.png)

---

### Statistics
**Historical fire statistics & trends • Yearly & monthly fire counts • Detection confidence bands • Top districts by fire count • Geographic distribution of fire incidents**


---

### Alerts
**Public alerts issued by admins • Safety tips & emergency contacts**


---

### Contact
**User contact form • FAQs & support information**

![Contact](./screenshots/contact.png)

---

## ✨ Features

### 🏠 Homepage
- Introduction to wildfire risk in Nepal  
- News bulletin & informational content  

### 🗺️ Live Map
- Real-time fire hotspot visualization (NASA FIRMS API)  
- Selectable time window (current / past 7 days)  
- Interactive map of Nepal showing ongoing fires  

### 🔮 Predict
- Interactive map for selecting any location in Nepal  
- Automatic fetching of weather & elevation data  
- Manual parameter adjustment:  
  - `latitude, longitude, temperature, humidity, wind speed, precipitation, elevation, VPD`  
- Fire risk prediction using a **Random Forest model trained from scratch**  
- Results display: **risk level + model probability**  

### 📊 Statistics
- Historical fire statistics & trends  
- Yearly & monthly fire counts  
- Detection confidence bands  
- Top districts by fire count  
- Geographic distribution of fire incidents  

### 📞 Contact
- User contact form  
- FAQs & support information  

### 🚨 Alerts
- Public alerts issued by admins  
- Safety tips & emergency contacts  

### 🔐 Authentication & Authorization
- User registration & login  
- Role-based dashboards (Admin & User)  
- OTP verification, password reset  
- JWT-based authentication  

---

## 👥 Roles & Permissions

### 👑 Admin
- View/respond to user messages & fire reports  
- Mark alerts as resolved  
- Run full forest scans using **Naive Bayes** model  
- Auto-create alerts for high-risk forests  
- Manage alerts (CRUD), contact forms, and fire reports  

### 👤 Registered User
- Submit wildfire reports  
- Access prediction, live map, stats, contact, and alerts  

### 👀 Visitor
- Access prediction, live map, stats, contact, and alerts  
- Cannot submit fire reports  

---

## 🤖 Prediction System

**Input Parameters:**
```
latitude, longitude, temperature, humidity, wind_speed, precipitation, elevation, VPD
```

**Models:**
- **Random Forest** (Custom implementation for prediction)
- **Naive Bayes** (Used for admin full forest scans)

**Workflow:**
1. User selects a location or provides manual inputs
2. Weather data auto-fetched from OpenWeatherMap
3. Elevation data retrieved from Open-Elevation API
4. Data scaled and normalized
5. Random Forest model predicts fire risk
6. Risk level categorized as: Low, Moderate, or High

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React (Vite), Tailwind CSS, Leaflet (maps), Axios |
| **Backend** | FastAPI, Uvicorn, FastAPI-JWT-Auth, Joblib |
| **ML/AI** | Scikit-learn, Pandas, NumPy, Random Forest, Naive Bayes |
| **Database** | MongoDB, Mongoose |
| **External APIs** | NASA FIRMS, OpenWeatherMap, Open-Elevation |
| **DevOps** | Vercel (Frontend), Render (Backend) |

---

## 📋 Requirements

### Backend
- Python 3.9+
- FastAPI, Uvicorn
- Pandas, NumPy, Scikit-learn
- Joblib, Requests
- python-dotenv
- fastapi-jwt-auth
- MongoDB

### Frontend
- Node.js 14+
- React 18+
- Vite
- Tailwind CSS
- Leaflet

---

## 🚀 Installation

### 1. Clone Repository
```bash
git clone https://github.com/dipak-shaaki/Forest_Fire_Prediction.git
cd Forest_Fire_Prediction
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key_here
OPENWEATHERMAP_API_KEY=your_api_key_here
```

Start the backend server:
```bash
uvicorn main:app --reload
```
Backend will run on: `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend will run on: `http://localhost:5173`

### 4. Access Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🔌 API Endpoints

### Public Endpoints
```http
GET  /                          # API status
POST /predict-manual            # Predict fire risk (manual input)
GET  /fires                     # Real-time fire hotspots
GET  /fires/yearly              # Yearly fire statistics
GET  /fires/monthly             # Monthly fire statistics
GET  /fires/confidence          # Confidence levels
POST /contact                   # Submit contact form
GET  /alerts                    # Get public alerts
```

### Admin Endpoints (Protected)
```http
POST /admin/alerts              # Create/manage alerts (CRUD)
GET  /admin/alerts              # Get all alerts
PUT  /admin/alerts/{id}         # Update alert
DELETE /admin/alerts/{id}       # Delete alert
GET  /scan-forests              # Full forest scan (Naive Bayes)
GET  /admin/reports             # View fire reports
POST /admin/reports/{id}/resolve # Mark report as resolved
```

### Authentication Endpoints
```http
POST /auth/register             # User registration
POST /auth/login                # User login
POST /auth/verify-otp           # OTP verification
POST /auth/reset-password       # Password reset
```

---

## 🧠 Model Training

Pre-trained models are included in the repository. To retrain:

### Jupyter Notebooks Available:
- `fire-predict.ipynb` - Model exploration and training
- `Fire_Predict_RF.ipynb` - Random Forest implementation
- `Last Model RF.ipynb` - Final model refinement

### Pre-trained Model Files:
- `backend/model/random_forest_final_model.pkl` - Random Forest model
- `backend/model/scaler.pkl` - StandardScaler for RF
- `backend/model/naive_bayes.pkl` - Naive Bayes model
- `backend/model/naive_bayes_scaler.pkl` - StandardScaler for NB

---

## 📁 Project Structure

```
Forest_Fire_Prediction/
 frontend/                   # React.js frontend
    public/                # Static assets
    src/
       components/        # Reusable components
       pages/             # Page components
       utils/             # Utility functions
       App.jsx            # Main app component
    package.json           # Frontend dependencies
    vite.config.js         # Vite configuration

 backend/                   # FastAPI backend
    main.py                # Main app entry point
    custom_rf.py           # Custom Random Forest implementation
    requirements.txt       # Python dependencies
    .env                   # Environment variables
    auth/                  # Authentication logic
    models/                # Database models
    routes/                # API route handlers
    services/              # Business logic
    utils/                 # Utility functions
    database/              # Database connection
    ml/                    # ML utilities
    model/                 # ML model files
    tests/                 # Unit tests

 docs/                      # Documentation
    Project_Report.md      # Full project report
    Thesis_Report.md       # Thesis documentation
    Algorithms_and_Data.md # Algorithm explanations

 dataset/                   # Training datasets
    fire_dataset_enriched.csv
    fire_test_dataset.csv

 README.md                  # This file
 requirements.txt           # Root dependencies
```

---

## 🌐 Deployment

### Frontend Deployment (Vercel)
```bash
npm run build
# Deploy to Vercel via CLI or GitHub integration
```
**Live Frontend:** https://forest-fire-prediction-otpw.vercel.app/

### Backend Deployment (Render)
```bash
# Deploy via Render with environment variables configured
```
**Live Backend:** https://forest-fire-prediction-kym9.onrender.com/

---

## ⚙️ Configuration

### Environment Variables

**Backend `.env`:**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Authentication
SECRET_KEY=your_super_secret_jwt_key_here

# Weather API
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com
```

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
pytest tests/
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Guidelines
- Follow PEP 8 for Python code
- Use meaningful commit messages
- Include tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

**Dipak Shaaki**
- GitHub: [@dipak-shaaki](https://github.com/dipak-shaaki)

---

## 💬 Support & Questions

For issues, questions, or suggestions:
- Open an [Issue](https://github.com/dipak-shaaki/Forest_Fire_Prediction/issues)
- Contact via the application's contact form

---

## 🙏 Acknowledgments

- **NASA FIRMS** for satellite fire data
- **OpenWeatherMap** for weather data
- **Open-Elevation** for elevation data
- **MongoDB** for database services
- **Vercel & Render** for hosting services

---

**Last Updated:** November 2025
