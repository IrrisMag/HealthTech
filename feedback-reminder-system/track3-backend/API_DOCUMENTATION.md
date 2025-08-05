# Track 3 Backend - AI-Enhanced Blood Bank System API Documentation

## Overview

The Track 3 Backend is a comprehensive AI-Enhanced Blood Bank System designed for Douala General Hospital. It provides real-time inventory management, demand forecasting, and optimization recommendations using advanced algorithms including Linear Programming (PuLP/SciPy) and Reinforcement Learning.

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://your-railway-app.railway.app`

## Authentication
All endpoints (except health checks) require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Core Features

### 🩸 Blood Types Supported
- A+, A-, B+, B-, AB+, AB-, O+, O-

### 🤖 Optimization Methods
- **Linear Programming**: Using PuLP/SciPy for cost minimization
- **Reinforcement Learning**: Q-learning based optimization
- **Hybrid**: Combined LP + RL approach

### 📊 Forecasting Models
- **ARIMA**: AutoRegressive Integrated Moving Average
- **SARIMAX**: Seasonal ARIMA with eXogenous variables
- **Random Forest**: Machine Learning ensemble method

## API Endpoints

### 🏥 Health & Status

#### GET `/`
Root endpoint with comprehensive service information
- **Response**: Service overview, available endpoints, features

#### GET `/health`
Service health check with database connectivity test
- **Response**: Health status, database connection, features list

### 📊 Dashboard & Analytics

#### GET `/dashboard/metrics`
Blood bank overview metrics
- **Response**: Total donors, donations, inventory units, expiring items, blood type distribution

#### GET `/analytics/performance`
Optimization performance analytics
- **Response**: Performance metrics, cost savings, stockout prevention rates

#### GET `/analytics/cost-savings?days=30`
Cost savings analysis from optimization
- **Query Parameters**: `days` (7-365)
- **Response**: Savings breakdown, efficiency metrics, recommendations impact

#### GET `/analytics/supply-demand`
Supply and demand analysis across blood types
- **Response**: Current supply, demand ratios, risk levels, trends

### 🩸 Inventory Management

#### GET `/inventory?skip=0&limit=50`
Get blood inventory with pagination
- **Query Parameters**: `skip`, `limit`
- **Response**: Inventory summary by blood type, availability, expiring items

#### POST `/inventory`
Add new blood inventory item
- **Body**: `BloodInventoryItem` object
- **Response**: Success confirmation with item details

### 👥 Donor Management

#### GET `/donors?skip=0&limit=50&blood_type=A+`
List donors with filtering and pagination
- **Query Parameters**: `skip`, `limit`, `blood_type`
- **Response**: Donor list with demographics and donation history

#### POST `/donors`
Register new blood donor
- **Body**: `DonorRecord` object
- **Response**: Registration confirmation

#### GET `/donors/{donor_id}`
Get specific donor information
- **Path Parameters**: `donor_id`
- **Response**: Detailed donor profile with medical history

#### PUT `/donors/{donor_id}`
Update donor information
- **Path Parameters**: `donor_id`
- **Body**: `DonorRecord` object
- **Response**: Update confirmation

### 🩸 Blood Donations

#### GET `/donations?skip=0&limit=50&status=available`
List blood donations with filtering
- **Query Parameters**: `skip`, `limit`, `donor_id`, `status`
- **Response**: Donation records with collection details

#### POST `/donations`
Record new blood donation
- **Body**: `BloodDonationRecord` object
- **Response**: Recording confirmation with auto-calculated expiry

### 📋 Blood Requests

#### GET `/requests?skip=0&limit=50&urgency_level=high`
List blood requests with filtering
- **Query Parameters**: `skip`, `limit`, `status`, `urgency_level`
- **Response**: Request records with patient and medical details

#### POST `/requests`
Create new blood request
- **Body**: `BloodRequestRecord` object
- **Response**: Request creation confirmation

### 📈 Forecasting

#### GET `/forecast/{blood_type}?periods=7`
Get demand forecast for specific blood type
- **Path Parameters**: `blood_type` (A+, A-, B+, B-, AB+, AB-, O+, O-)
- **Query Parameters**: `periods` (1-30 days)
- **Response**: ARIMA-based forecast with confidence intervals

#### GET `/forecast/batch?periods=7`
Get demand forecast for all blood types
- **Query Parameters**: `periods` (1-30 days)
- **Response**: Batch forecasts for all blood types

#### GET `/forecast/models`
Get information about available forecasting models
- **Response**: Model details, accuracy metrics, best use cases

#### POST `/forecast/clinical-data`
Generate forecast incorporating clinical data factors
- **Body**: Blood type and clinical parameters
- **Response**: Enhanced forecast with clinical insights

#### GET `/forecast/accuracy`
Get forecasting model accuracy metrics
- **Response**: MAE, MSE, MAPE, R² scores by blood type

### 🎯 Optimization

#### GET `/recommendations/active?priority=high&blood_type=O+`
Get active optimization recommendations
- **Query Parameters**: `priority`, `blood_type`, `recommendation_type`
- **Response**: Current recommendations with reasoning and confidence scores

#### POST `/optimize`
Run basic inventory optimization
- **Response**: Optimization results with cost estimates and recommendations

#### POST `/optimize/advanced`
Run advanced optimization with custom constraints
- **Body**: `OptimizationRequest` with method and constraints
- **Response**: Advanced optimization results with detailed analysis

#### GET `/optimization/reports?skip=0&limit=10`
List optimization reports with pagination
- **Query Parameters**: `skip`, `limit`
- **Response**: Historical optimization reports summary

#### GET `/optimization/reports/{report_id}`
Get detailed optimization report by ID
- **Path Parameters**: `report_id`
- **Response**: Comprehensive report with risk assessment and performance metrics

### 🔄 DHIS2 Integration

#### GET `/dhis2/test-connection`
Test DHIS2 connection and authentication
- **Response**: Connection status, server info, user details

#### POST `/dhis2/sync`
Synchronize blood bank data to DHIS2
- **Body**: `DHIS2SyncRequest` with sync parameters
- **Response**: Sync results with data counts and DHIS2 response

#### GET `/dhis2/sync-history?skip=0&limit=10`
Get DHIS2 synchronization history
- **Query Parameters**: `skip`, `limit`
- **Response**: Historical sync records with status and error details

## Data Models

### BloodInventoryItem
```json
{
  "id": "uuid",
  "blood_type": "A+",
  "quantity": 1,
  "expiry_date": "2024-01-15T00:00:00Z",
  "location": "Main Storage",
  "temperature": 4.0,
  "status": "available"
}
```

### DonorRecord
```json
{
  "id": "uuid",
  "name": "John Doe",
  "age": 30,
  "gender": "Male",
  "blood_type": "O+",
  "phone": "+237600000000",
  "email": "john@example.com",
  "eligibility_status": "eligible"
}
```

### OptimizationRequest
```json
{
  "optimization_method": "linear_programming",
  "forecast_horizon_days": 30,
  "constraints": {
    "max_storage_capacity": 1000,
    "budget_constraint": 100000.0,
    "min_safety_stock_days": 7
  },
  "blood_types": ["A+", "O+"]
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "detail": "Error description",
  "status_code": 400,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Rate Limiting

- Standard endpoints: 100 requests/minute
- Optimization endpoints: 10 requests/minute
- DHIS2 sync endpoints: 5 requests/minute

## Support

For technical support or questions about the API, please contact the development team or refer to the comprehensive documentation at `/docs` when the service is running.
