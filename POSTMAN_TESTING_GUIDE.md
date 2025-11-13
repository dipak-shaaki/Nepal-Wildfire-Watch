# Postman Testing Guide for Forest Fire Prediction API

This guide provides comprehensive testing instructions for all API endpoints using Postman.

**Base URL:** `http://localhost:8000` (or your deployed server URL)

---

## 📋 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Manual Fire Prediction](#manual-fire-prediction)
3. [Fire Statistics & Historical Data](#fire-statistics--historical-data)
4. [Fire Reports](#fire-reports)
5. [Contact Form](#contact-form)
6. [Admin Endpoints](#admin-endpoints)
7. [Forest Scanning](#forest-scanning)
8. [Alerts Management](#alerts-management)
9. [Test/MongoDB Endpoints](#testmongodb-endpoints)

---

## 🔐 Authentication Endpoints

### 1. Root Endpoint (Health Check)
**GET** `/`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
{
  "message": "API is running!"
}
```

---

### 2. User Registration
**POST** `/register`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "user@example.com",
  "username": "testuser",
  "nid": "1234567890123",
  "password": "SecurePass123!"
}
```
- **Expected Response:**
```json
{
  "message": "Registration successful. Please check your email for the OTP to verify your account.",
  "email": "user@example.com"
}
```

---

### 3. Verify OTP (Email Verification)
**POST** `/verify-otp`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
- **Expected Response:**
```json
{
  "message": "Email verified successfully! You can now log in."
}
```

---

### 4. Resend OTP
**POST** `/resend-otp`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "user@example.com"
}
```
- **Expected Response:**
```json
{
  "message": "New OTP sent to your email."
}
```

---

### 5. User Login
**POST** `/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):** (Can use email OR username as identifier)
```json
{
  "identifier": "user@example.com",
  "password": "SecurePass123!"
}
```
OR
```json
{
  "identifier": "testuser",
  "password": "SecurePass123!"
}
```
- **Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "role": "user"
}
```
- **Note:** Save the `access_token` for authenticated requests!

---

### 6. Admin Signup (First Admin Only)
**POST** `/admin/signup`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
```
- **Expected Response:**
```json
{
  "msg": "Admin created"
}
```
- **Note:** Only works if no admin exists in the database.

---

### 7. Admin Login
**POST** `/admin/login`
- **Headers:**
  - `Content-Type: application/x-www-form-urlencoded`
- **Body (form-data):**
  - `username`: `admin@example.com`
  - `password`: `AdminPass123!`
- **Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```
- **Note:** Admin uses OAuth2 form-data format!

---

### 8. Forgot Password
**POST** `/forgot-password`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "user@example.com"
}
```
- **Expected Response:**
```json
{
  "message": "If your email is registered, a password reset OTP will be sent."
}
```

---

### 9. Reset Password
**POST** `/reset-password`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "user@example.com",
  "otp": "654321",
  "new_password": "NewSecurePass123!"
}
```
- **Expected Response:**
```json
{
  "message": "Password reset successful! You can now log in with your new password."
}
```

---

### 10. Debug User Status (Admin Only)
**GET** `/debug/user/{email}`
- **Headers:**
  - `Authorization: Bearer {admin_access_token}`
- **URL Parameters:**
  - Replace `{email}` with actual email: `/debug/user/user@example.com`
- **Expected Response:**
```json
{
  "exists": true,
  "email": "user@example.com",
  "username": "testuser",
  "role": "user",
  "is_verified": true,
  "is_approved": false,
  "has_verification_token": false
}
```

---

## 🔥 Manual Fire Prediction

### 11. Manual Fire Prediction
**POST** `/predict-manual`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "latitude": 27.7172,
  "longitude": 85.3240,
  "temperature": 35.5,
  "humidity": 45.0,
  "wind_speed": 15.2,
  "precipitation": 0.0,
  "elevation": 1400.0
}
```
- **Expected Response:**
```json
{
  "fire_occurred": 1,
  "risk_level": "High",
  "confidence": "High confidence",
  "probability": 0.85,
  "input": {
    "latitude": 27.7172,
    "longitude": 85.3240,
    "temperature": 35.5,
    "humidity": 45.0,
    "wind_speed": 15.2,
    "precipitation": 0.0,
    "elevation": 1400.0,
    "vpd": 2.345
  },
  "risk_message": "High fire risk! Take precautions."
}
```

---

## 📊 Fire Statistics & Historical Data

### 12. Get Live Fires (NASA FIRMS API)
**GET** `/fires`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
{
  "fires": [
    {
      "latitude": "27.5",
      "longitude": "85.3",
      "confidence": "high",
      ...
    }
  ]
}
```
- **Note:** Requires valid NASA EarthData credentials.

---

### 13. Yearly Fire Counts
**GET** `/fires/yearly`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
{
  "2020": 150,
  "2021": 200,
  "2022": 180,
  ...
}
```

---

### 14. Monthly Fire Counts
**GET** `/fires/monthly`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
{
  "January": 45,
  "February": 60,
  "March": 80,
  ...
}
```

---

### 15. Confidence Level Counts
**GET** `/fires/confidence`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
{
  "high": 120,
  "moderate": 150,
  "low": 80
}
```

---

### 16. Fire Counts by Elevation
**GET** `/fires/elevation`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
{
  "0-500": 50,
  "500-1000": 80,
  "1000-1500": 100,
  ...
}
```

---

### 17. Top Districts with Fires
**GET** `/fires/top-districts`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
{
  "Makwanpur": 45,
  "Chitwan": 38,
  "Bardiya": 32,
  ...
}
```

---

### 18. Year-Month Heatmap Data
**GET** `/fires/heatmap`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
{
  "2020": {
    "January": 15,
    "February": 20,
    ...
  },
  ...
}
```

---

### 19. Geo Sample Data
**GET** `/fires/geo-sample`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
[
  {
    "latitude": 27.5,
    "longitude": 85.3,
    "district": "Kathmandu",
    ...
  }
]
```

---

## 📝 Fire Reports

### 20. Create Fire Report
**POST** `/reports/`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "province": "Bagmati",
  "district": "Kathmandu",
  "location_details": "Near Shivapuri National Park",
  "fire_date": "2024-03-15",
  "description": "Saw smoke and flames in the forest area",
  "lat": 27.7172,
  "lon": 85.3240,
  "status": "new",
  "resolved": false
}
```
- **Expected Response:**
```json
{
  "message": "Fire report submitted",
  "id": "507f1f77bcf86cd799439011"
}
```

---

### 21. List All Fire Reports
**GET** `/reports/`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "province": "Bagmati",
    "district": "Kathmandu",
    ...
  }
]
```

---

### 22. Get Single Fire Report
**GET** `/reports/{report_id}`
- **Headers:** None required
- **URL Parameters:**
  - Replace `{report_id}` with actual ID: `/reports/507f1f77bcf86cd799439011`
- **Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  ...
}
```

---

### 23. Update Report Status (Resolve)
**PUT** `/reports/{report_id}/resolve`
- **Headers:**
  - `Content-Type: application/json`
- **URL Parameters:**
  - Replace `{report_id}` with actual ID
- **Body (JSON):**
```json
{
  "resolved": true
}
```
- **Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "resolved": true,
  ...
}
```

---

### 24. Delete Fire Report
**DELETE** `/reports/{report_id}`
- **Headers:** None required
- **URL Parameters:**
  - Replace `{report_id}` with actual ID
- **Expected Response:**
```json
{
  "message": "Report deleted"
}
```

---

## 📧 Contact Form

### 25. Submit Contact Message
**POST** `/contact`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Question about fire predictions",
  "message": "How accurate are the fire predictions?"
}
```
- **Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Question about fire predictions",
  "message": "How accurate are the fire predictions?"
}
```

---

### 26. Get All Messages
**GET** `/messages`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com",
    ...
  }
]
```

---

### 27. Delete Message
**DELETE** `/messages/{message_id}`
- **Headers:** None required
- **URL Parameters:**
  - Replace `{message_id}` with actual ID
- **Expected Response:**
```json
{
  "message": "Deleted"
}
```

---

## 🌲 Forest Scanning

### 28. Scan Forests (Full Scan)
**GET** `/scan-forests`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
[
  {
    "forest_name": "Makwanpur Forest",
    "district": "Makwanpur",
    "latitude": 27.4167,
    "longitude": 85.0333,
    "predicted_risk": 1
  },
  ...
]
```

---

## 👨‍💼 Admin Endpoints (Require Admin Authentication)

### 29. Send Reply Email
**POST** `/admin/reply`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {admin_access_token}`
- **Body (JSON):**
```json
{
  "to_email": "user@example.com",
  "subject": "Re: Your inquiry",
  "message": "Thank you for your message. We'll get back to you soon."
}
```
- **Expected Response:**
```json
{
  "msg": "Reply sent successfully"
}
```

---

### 30. Send Reply to Fire Report
**POST** `/admin/reply-report`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {admin_access_token}`
- **Body (JSON):**
```json
{
  "report_id": "507f1f77bcf86cd799439011",
  "subject": "Re: Fire Report #123",
  "message": "Thank you for reporting. We're investigating the matter."
}
```
- **Expected Response:**
```json
{
  "msg": "Reply sent successfully to reporter"
}
```

---

### 31. Scan Nepal (Admin - Creates Alerts)
**POST** `/admin/scan-nepal`
- **Headers:**
  - `Authorization: Bearer {admin_access_token}`
- **Body:** None
- **Expected Response:**
```json
{
  "total_scanned": 15,
  "alerts_created": 3,
  "high_risk_districts": [...],
  "results": [...]
}
```

---

### 32. Test Scan Nepal (No Auth Required)
**POST** `/admin/test-scan-nepal`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
{
  "total_scanned": 15,
  "alerts_created": 0,
  "high_risk_districts": [...],
  "results": [...]
}
```

---

## 🚨 Alerts Management

### 33. Create Test Alert (No Auth)
**POST** `/admin/test-alerts`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "title": "High Fire Risk Alert",
  "message": "High fire risk detected in Makwanpur district",
  "latitude": 27.4167,
  "longitude": 85.0333,
  "severity": "high",
  "duration_days": 3,
  "forest": "Makwanpur Forest",
  "district": "Makwanpur",
  "province": "Bagmati",
  "risk_level": "High",
  "probability": 0.85
}
```
- **Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "title": "High Fire Risk Alert",
  "message": "High fire risk detected in Makwanpur district",
  "status": "active",
  ...
}
```

---

### 34. Get All Alerts (Admin Only)
**GET** `/admin/alerts`
- **Headers:**
  - `Authorization: Bearer {admin_access_token}`
- **Body:** None
- **Expected Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "title": "High Fire Risk Alert",
    "status": "active",
    ...
  }
]
```

---

### 35. Get Single Alert (Admin Only)
**GET** `/admin/alerts/{alert_id}`
- **Headers:**
  - `Authorization: Bearer {admin_access_token}`
- **URL Parameters:**
  - Replace `{alert_id}` with actual ID
- **Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "title": "High Fire Risk Alert",
  ...
}
```

---

### 36. Get Public Alerts
**GET** `/admin/public/alerts`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "title": "High Fire Risk Alert",
    "status": "active",
    ...
  }
]
```

---

### 37. Create Alert (Admin Only)
**POST** `/admin/alerts`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {admin_access_token}`
- **Body (JSON):**
```json
{
  "title": "Moderate Fire Risk",
  "message": "Moderate fire risk in Chitwan district",
  "latitude": 27.5170,
  "longitude": 84.4167,
  "severity": "moderate",
  "status": "active",
  "duration_days": 3,
  "forest": "Chitwan National Park",
  "district": "Chitwan",
  "province": "Bagmati",
  "risk_level": "Moderate",
  "probability": 0.55
}
```
- **Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "title": "Moderate Fire Risk",
  ...
}
```

---

### 38. Create Bulk Alerts (Admin Only)
**POST** `/admin/alerts/bulk`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {admin_access_token}`
- **Body (JSON):**
```json
[
  {
    "title": "Alert 1",
    "message": "First alert",
    "latitude": 27.5,
    "longitude": 85.3,
    "severity": "high"
  },
  {
    "title": "Alert 2",
    "message": "Second alert",
    "latitude": 28.0,
    "longitude": 84.0,
    "severity": "moderate"
  }
]
```
- **Expected Response:**
```json
{
  "created_alerts": [...],
  "count": 2
}
```

---

### 39. Update Alert (Admin Only)
**PUT** `/admin/alerts/{alert_id}`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {admin_access_token}`
- **URL Parameters:**
  - Replace `{alert_id}` with actual ID
- **Body (JSON):**
```json
{
  "status": "expired",
  "severity": "low"
}
```
- **Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "status": "expired",
  ...
}
```

---

### 40. Delete Alert (Admin Only)
**DELETE** `/admin/alerts/{alert_id}`
- **Headers:**
  - `Authorization: Bearer {admin_access_token}`
- **URL Parameters:**
  - Replace `{alert_id}` with actual ID
- **Expected Response:**
```json
{
  "message": "Alert deleted"
}
```

---

### 41. Cleanup Expired Alerts (Admin Only)
**POST** `/admin/alerts/cleanup`
- **Headers:**
  - `Authorization: Bearer {admin_access_token}`
- **Body:** None
- **Expected Response:**
```json
{
  "updated": 5
}
```

---

## 🧪 Test/MongoDB Endpoints

### 42. Test MongoDB Insert
**GET** `/test/mongo/insert`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
{
  "inserted_id": "507f1f77bcf86cd799439015"
}
```

---

### 43. Test MongoDB Read
**GET** `/test/mongo/read`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439015",
    "title": "Test Alert",
    ...
  }
]
```

---

### 44. Test MongoDB Update
**GET** `/test/mongo/update/{doc_id}`
- **Headers:** None required
- **URL Parameters:**
  - Replace `{doc_id}` with actual ID
- **Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439015",
  "title": "Updated title",
  ...
}
```

---

### 45. Test MongoDB Delete
**GET** `/test/mongo/delete/{doc_id}`
- **Headers:** None required
- **URL Parameters:**
  - Replace `{doc_id}` with actual ID
- **Expected Response:**
```json
{
  "deleted": 1
}
```

---

## 📌 Postman Collection Setup Tips

### 1. Environment Variables
Create a Postman environment with:
- `base_url`: `http://localhost:8000`
- `user_token`: (will be set after login)
- `admin_token`: (will be set after admin login)

### 2. Auto-extract Tokens
Add this to your login request's **Tests** tab:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("user_token", jsonData.access_token);
}
```

### 3. Authorization Header Setup
For protected endpoints, use:
- **Type:** Bearer Token
- **Token:** `{{user_token}}` or `{{admin_token}}`

### 4. Pre-request Scripts
Add common headers:
```javascript
pm.request.headers.add({
    key: 'Content-Type',
    value: 'application/json'
});
```

---

## 🔑 Authentication Flow Summary

1. **User Registration:** `POST /register`
2. **Verify Email:** `POST /verify-otp`
3. **Login:** `POST /login` → Save token
4. **Use Token:** Add `Authorization: Bearer {token}` header for protected routes

**Admin Flow:**
1. **Admin Signup (First Time):** `POST /admin/signup`
2. **Admin Login:** `POST /admin/login` → Save admin token
3. **Use Admin Token:** Add `Authorization: Bearer {admin_token}` header

---

## ⚠️ Important Notes

1. **JWT Tokens:** Most admin endpoints require a valid JWT token in the Authorization header
2. **OTP Expiry:** OTPs expire after 10 minutes
3. **Email Required:** Registration and password reset require valid email configuration (SMTP settings)
4. **Date Format:** Fire report dates should be in `YYYY-MM-DD` format
5. **MongoDB ObjectIds:** When using IDs in URLs, use the full MongoDB ObjectId string

---

## 🎯 Quick Test Checklist

- [ ] Health check endpoint works
- [ ] User registration and OTP verification
- [ ] User login and token generation
- [ ] Manual fire prediction
- [ ] Fire statistics endpoints
- [ ] Fire report CRUD operations
- [ ] Contact form submission
- [ ] Admin login
- [ ] Admin scan Nepal
- [ ] Alert creation and management
- [ ] Public alerts endpoint

---


