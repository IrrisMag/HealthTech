# Blood Bank Inventory Optimization Service

AI-Enhanced Blood Bank Inventory Optimization System for Douala General Hospital - Track 3

## Overview

This microservice provides intelligent inventory optimization for blood bank management, using AI-driven forecasting and optimization algorithms to generate optimal ordering recommendations while considering delivery cycles, safety stock, wastage rates, and cost implications.

## Features

- **AI-Powered Optimization**: Linear programming, reinforcement learning, and hybrid optimization methods
- **Real-time Inventory Tracking**: Monitor blood inventory levels across all blood types
- **Demand Forecasting Integration**: Connects with forecasting service for predictive analytics
- **Cost Optimization**: Minimize costs while maintaining adequate safety stock
- **Risk Assessment**: Comprehensive risk analysis for inventory decisions
- **Performance Analytics**: Track optimization performance over time
- **RESTful API**: Complete REST API with authentication

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Forecasting   │    │   Optimization   │    │   Ingestion     │
│   Service       │◄──►│   Service        │◄──►│   Service       │
│   (Port 8001)   │    │   (Port 8002)    │    │   (Port 8000)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   MongoDB    │
                       │   Database   │
                       └──────────────┘
```

## Installation

### Prerequisites

- Python 3.9+
- MongoDB 4.4+
- Git

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd blood-bank-optimization
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Start the service**
```bash
python main.py
```

The service will be available at `http://localhost:8002`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb+srv://farelrick22:inventory_optimization@cluster0.tgggfrc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0` |
| `DATABASE_NAME` | Database name | `inventory_optimization` |
| `JWT_SECRET_KEY` | JWT signing secret | Required |
| `FORECASTING_SERVICE_URL` | Forecasting service URL | `http://localhost:8001` |
| `INGESTION_SERVICE_URL` | Ingestion service URL | `http://localhost:8000` |
| `OPTIMIZATION_MODEL` | Default optimization method | `linear_programming` |

### Sample .env file

```bash
MONGODB_URL=mongodb+srv://farelrick22:inventory_optimization@cluster0.tgggfrc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_NAME=inventory_optimization
JWT_SECRET_KEY=your-super-secret-jwt-key
FORECASTING_SERVICE_URL=http://localhost:8001
INGESTION_SERVICE_URL=http://localhost:8000
OPTIMIZATION_MODEL=linear_programming
```

## API Documentation

### Authentication

All endpoints require JWT authentication via Bearer token:

```bash
Authorization: Bearer <your-jwt-token>
```

### Base URL

```
http://localhost:8002
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service information |
| GET | `/health` | Health check |
| POST | `/optimize` | Full inventory optimization |
| GET | `/optimize/quick` | Quick optimization |
| GET | `/recommendations/active` | Get active recommendations |
| POST | `/recommendations/{id}/execute` | Execute recommendation |
| GET | `/reports` | List optimization reports |
| GET | `/reports/{id}` | Get specific report |
| GET | `/analytics/optimization-performance` | Performance analytics |
| GET | `/analytics/cost-savings` | Cost savings analysis |

## API Reference

### 1. Service Information

**GET** `/`

Returns basic service information and available endpoints.

**Response:**
```json
{
  "service": "blood_bank_inventory_optimization",
  "status": "running",
  "version": "1.0.0",
  "description": "AI-Enhanced Blood Bank Inventory Optimization System - Track 3",
  "hospital": "Douala General Hospital",
  "optimization_methods": ["linear_programming", "reinforcement_learning", "hybrid"],
  "endpoints": {
    "optimization": ["/optimize", "/optimize/quick"],
    "recommendations": ["/recommendations/active", "/recommendations/{id}/execute"],
    "reports": ["/reports", "/reports/{id}"],
    "analytics": ["/analytics/optimization-performance", "/analytics/cost-savings"],
    "health": ["/health"]
  }
}
```

### 2. Health Check

**GET** `/health`

Check service health and dependencies.

**Response:**
```json
{
  "status": "healthy",
  "service": "blood_bank_inventory_optimization",
  "version": "1.0.0",
  "database": "connected",
  "forecasting_service": "connected",
  "optimization_methods": ["linear_programming", "reinforcement_learning", "hybrid"],
  "timestamp": "2024-01-15T10:30:45.123456"
}
```

### 3. Full Inventory Optimization

**POST** `/optimize`

Generate comprehensive optimization recommendations.

**Request Body:**
```json
{
  "optimization_method": "linear_programming",
  "forecast_horizon_days": 30,
  "constraints": {
    "max_storage_capacity": 1000,
    "min_safety_stock_days": 7,
    "max_order_frequency_days": 3,
    "budget_constraint": 100000.0,
    "emergency_cost_multiplier": 2.5,
    "wastage_penalty_factor": 1.5,
    "shelf_life_buffer_days": 5
  }
}
```

**Parameters:**
- `optimization_method`: `linear_programming` | `reinforcement_learning` | `hybrid`
- `forecast_horizon_days`: 7-90 days
- `constraints`: Optional optimization constraints

**Response:**
```json
{
  "report_id": "550e8400-e29b-41d4-a716-446655440000",
  "generated_at": "2024-01-15T10:30:45.123456",
  "total_recommendations": 8,
  "total_estimated_cost": 45750.0,
  "budget_utilization": 0.4575,
  "recommendations": [
    {
      "recommendation_id": "rec-001",
      "blood_type": "O+",
      "current_stock_level": "low",
      "recommendation_type": "emergency_order",
      "recommended_order_quantity": 50,
      "priority_level": "emergency",
      "cost_estimate": 6250.0,
      "expected_delivery_date": "2024-01-18T10:30:45.123456",
      "reasoning": "URGENT: Current stock (15) is below safety level (25).",
      "confidence_score": 0.9,
      "created_at": "2024-01-15T10:30:45.123456"
    }
  ],
  "risk_assessment": {
    "overall_risk_score": 0.35,
    "supply_risk": 0.125,
    "cost_risk": 0.4575,
    "wastage_risk": 0.08,
    "emergency_orders_count": 1,
    "risk_level": "low"
  },
  "performance_metrics": {
    "optimization_score": 0.82,
    "service_level": 0.875,
    "cost_efficiency": 1.91,
    "average_confidence": 0.85,
    "budget_utilization": 0.4575
  }
}
```

### 4. Quick Optimization

**GET** `/optimize/quick`

Fast optimization with default settings.

**Query Parameters:**
- `blood_type`: Optional blood type filter
- `method`: Optimization method (default: `linear_programming`)

**Example:**
```
GET /optimize/quick?blood_type=O_POSITIVE&method=linear_programming
```

**Response:**
```json
{
  "blood_type": "O+",
  "recommendations": [
    {
      "recommendation_id": "rec-quick-001",
      "blood_type": "O+",
      "current_stock_level": "critical",
      "recommendation_type": "emergency_order",
      "recommended_order_quantity": 75,
      "priority_level": "emergency",
      "cost_estimate": 9375.0,
      "reasoning": "URGENT: Current stock (5) is below safety level (20).",
      "confidence_score": 0.95
    }
  ],
  "total_cost": 9375.0,
  "optimization_method": "linear_programming",
  "generated_at": "2024-01-15T10:30:45.123456"
}
```

### 5. Active Recommendations

**GET** `/recommendations/active`

Get active recommendations from the latest optimization.

**Query Parameters:**
- `priority`: Filter by priority (`low`, `medium`, `high`, `emergency`, `critical`)
- `blood_type`: Filter by blood type
- `recommendation_type`: Filter by type (`emergency_order`, `routine_order`, etc.)

**Response:**
```json
{
  "recommendations": [
    {
      "recommendation_id": "rec-001",
      "blood_type": "O+",
      "current_stock_level": "critical",
      "recommendation_type": "emergency_order",
      "recommended_order_quantity": 50,
      "priority_level": "emergency",
      "cost_estimate": 6250.0,
      "reasoning": "URGENT: Current stock (15) is below safety level (25)."
    }
  ],
  "total_count": 1,
  "report_generated_at": "2024-01-15T10:30:45.123456",
  "report_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 6. Execute Recommendation

**POST** `/recommendations/{recommendation_id}/execute`

Execute a specific recommendation by creating a purchase order.

**Response:**
```json
{
  "order_id": "order-550e8400-e29b-41d4-a716-446655440001",
  "status": "created",
  "message": "Purchase order created successfully",
  "recommendation_executed": "rec-001"
}
```

### 7. Optimization Reports

**GET** `/reports`

List optimization reports with pagination.

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 10, max: 100)

**GET** `/reports/{report_id}`

Get specific optimization report by ID.

### 8. Analytics

**GET** `/analytics/optimization-performance`

Get optimization performance metrics over time.

**Query Parameters:**
- `days`: Number of days to analyze (7-365, default: 30)

**GET** `/analytics/cost-savings`

Analyze cost savings from optimization recommendations.

## Data Models

### Blood Types
- `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`

### Priority Levels
- `low`, `medium`, `high`, `emergency`, `critical`

### Stock Levels
- `critical`, `low`, `adequate`, `optimal`, `excess`

### Recommendation Types
- `emergency_order`, `routine_order`, `hold_order`, `reduce_order`, `redistribute`

### Optimization Methods
- `linear_programming`: Traditional linear programming optimization
- `reinforcement_learning`: AI-based reinforcement learning
- `hybrid`: Combination of both methods

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "detail": "Error description",
  "error_code": "OPTIMIZATION_FAILED",
  "timestamp": "2024-01-15T10:30:45.123456"
}
```

## Testing

### Using Postman

1. **Set up authentication**
   - Add `Authorization: Bearer <token>` header
   - Or use Postman's Auth tab with Bearer Token

2. **Test endpoints**
   - Start with `/health` to verify service
   - Use `/optimize/quick` for fast testing
   - Try `/optimize` for full optimization

### Sample Test Scripts

```javascript
// Postman Test Script
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has optimization data", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('recommendations');
    pm.expect(jsonData.recommendations).to.be.an('array');
});
```

## Deployment

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8002

CMD ["python", "main.py"]
```

### Production Considerations

1. **Environment Variables**: Use secure secret management
2. **Database**: Use MongoDB Atlas or managed MongoDB
3. **Monitoring**: Implement logging and monitoring
4. **Load Balancing**: Use reverse proxy (nginx/Apache)
5. **SSL/TLS**: Enable HTTPS in production

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB is running
   - Verify connection string in `.env`

2. **Authentication Errors**
   - Verify JWT secret key is set
   - Check token format and expiration

3. **Import Errors**
   - Ensure all dependencies are installed
   - Check Python version compatibility

4. **Optimization Failures**
   - Verify forecasting service is running
   - Check database has inventory data

### Logs

Check application logs for detailed error information:

```bash
# View logs
tail -f app.log

# Or if running directly
python main.py
```


## License

Copyright © 2024 Douala General Hospital. All rights reserved.

## Support

For technical support, contact the development team or create an issue in the repository.