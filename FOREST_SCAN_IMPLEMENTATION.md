# Forest Fire Scanning Implementation

## Overview
This document describes the implementation of the forest scanning functionality for admin users in the Forest Fire Prediction system. The system allows admins to scan all forest areas in Nepal using the trained Naive Bayes model and create alerts for high-risk areas.

## Changes Made

### Backend Changes

#### 1. Updated `backend/routes/admin_routes.py`
- **Fixed endpoint path**: Changed from `/scan-nepal` to `/admin/scan-nepal` to match the admin router prefix
- **Enhanced response structure**: Added `high_risk_districts` field to match frontend expectations
- **Improved district data**: Added complete Nepal forest districts with proper metadata (province, location_details)
- **Added bulk alert creation**: New endpoint `/admin/alerts/bulk` for creating multiple alerts at once
- **Enhanced alert structure**: Added support for additional fields like forest name, province, weather data, etc.

#### 2. Key Features Implemented
- **Forest Scanning**: Scans 15 major forest areas across Nepal
- **Weather Integration**: Fetches real-time weather data for each location
- **Risk Assessment**: Uses Naive Bayes model to predict fire risk
- **Auto-alert Creation**: Automatically creates alerts for high-risk areas
- **Manual Alert Selection**: Allows admins to select specific areas for alert creation

### Frontend Changes

#### 1. Updated `frontend/src/pages/AdminDashboard.jsx`
- **Fixed API endpoints**: Updated all API calls to use correct admin endpoints
- **Enhanced scan functionality**: Improved the forest scanning interface
- **Bulk alert creation**: Added support for creating multiple alerts from scan results
- **Better error handling**: Improved error messages and user feedback

#### 2. Key UI Improvements
- **Scan Results Table**: Displays forest name, district, location, weather data, and risk level
- **Selection Interface**: Checkbox system for selecting areas to create alerts
- **Reason Input**: Text input for adding custom reasons to alerts
- **Bulk Operations**: Button to create alerts for all selected areas

## API Endpoints

### Forest Scanning
- **POST** `/admin/scan-nepal` - Scan all forest areas for fire risk
  - Returns: `{total_scanned, alerts_created, high_risk_districts, results}`
  - Auto-creates alerts for high-risk areas

### Alert Management
- **GET** `/admin/alerts` - Get all alerts (admin only)
- **POST** `/admin/alerts` - Create single alert
- **POST** `/admin/alerts/bulk` - Create multiple alerts
- **PUT** `/admin/alerts/{id}` - Update alert
- **DELETE** `/admin/alerts/{id}` - Delete alert

### Public Endpoints
- **GET** `/admin/public/alerts` - Get active alerts (public access)

## Forest Areas Covered

The system scans 15 major forest areas across Nepal:

1. **Makwanpur Forest** (Bagmati Province)
2. **Chitwan National Park** (Bagmati Province)
3. **Bardiya National Park** (Lumbini Province)
4. **Shuklaphanta National Park** (Sudurpashchim Province)
5. **Langtang National Park** (Bagmati Province)
6. **Sagarmatha National Park** (Koshi Province)
7. **Rara National Park** (Karnali Province)
8. **Shey Phoksundo National Park** (Karnali Province)
9. **Khaptad National Park** (Sudurpashchim Province)
10. **Banke National Park** (Lumbini Province)
11. **Parsa National Park** (Madhesh Province)
12. **Koshi Tappu Wildlife Reserve** (Koshi Province)
13. **Annapurna Conservation Area** (Gandaki Province)
14. **Manaslu Conservation Area** (Gandaki Province)
15. **Kanchenjunga Conservation Area** (Koshi Province)

## How It Works

### 1. Forest Scanning Process
1. Admin clicks "Scan Nepal Forests" button
2. System fetches weather data for each forest location
3. Naive Bayes model predicts fire risk based on weather conditions
4. Results are displayed in a table with risk levels
5. High-risk areas are automatically flagged

### 2. Alert Creation Process
1. Admin selects areas from scan results
2. Admin adds custom reasons for alerts
3. Admin clicks "Publish Forest Fire Alert(s)"
4. System creates alerts in the database
5. Alerts become visible to public users

### 3. Risk Assessment
- **High Risk**: Probability ≥ 0.60 (Red)
- **Moderate Risk**: Probability 0.30-0.59 (Yellow)
- **Low Risk**: Probability < 0.30 (Green)

## Testing

A test script `backend/test_scan.py` has been created to verify:
- Model loading functionality
- Prediction accuracy
- Forest dataset integrity
- System readiness

## Usage Instructions

### For Admins:
1. Login to the admin dashboard
2. Click "🌲 Scan Nepal Forests" button
3. Wait for scan to complete
4. Review high-risk areas in the results table
5. Select areas you want to create alerts for
6. Add custom reasons for each alert
7. Click "🌲 Publish Forest Fire Alert(s)"
8. Verify alerts are created successfully

### For Public Users:
1. Visit the alerts page
2. View active forest fire alerts
3. See detailed information about risk areas
4. Follow safety precautions provided

## Technical Details

### Model Requirements
- **Naive Bayes Model**: `backend/model/naive_bayes.pkl`
- **Scaler**: `backend/model/scaler.pkl`
- **Forest Dataset**: `backend/model/forest_dataset.csv`

### Weather Data
- Uses OpenWeatherMap API for real-time weather data
- Falls back to simulated data if API is unavailable
- Collects: temperature, humidity, wind speed, precipitation

### Database
- MongoDB for storing alerts
- Collection: `alerts`
- Fields: title, message, latitude, longitude, severity, status, created_at, expires_at, etc.

## Future Enhancements

1. **Real-time Monitoring**: Continuous scanning with scheduled tasks
2. **Historical Data**: Track risk trends over time
3. **Geographic Visualization**: Map-based interface for scan results
4. **Notification System**: Email/SMS alerts for high-risk areas
5. **Machine Learning Improvements**: Retrain models with more data
6. **Multi-language Support**: Support for local languages
7. **Mobile App**: Dedicated mobile application for field workers

## Troubleshooting

### Common Issues:
1. **Model Loading Errors**: Check if model files exist and are accessible
2. **Weather API Failures**: System falls back to simulated data
3. **Database Connection**: Ensure MongoDB is running
4. **Authentication**: Verify admin token is valid

### Debug Steps:
1. Check backend logs for error messages
2. Verify model files are in correct location
3. Test API endpoints using tools like Postman
4. Check frontend console for JavaScript errors
5. Verify database connectivity

## Conclusion

The forest scanning functionality is now fully implemented and ready for use. Admins can efficiently scan all forest areas in Nepal, assess fire risks using the trained Naive Bayes model, and create targeted alerts for high-risk areas. The system provides a comprehensive solution for forest fire prevention and early warning.
