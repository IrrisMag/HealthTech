# API Usage Examples

## Authentication

First, obtain a JWT token (implementation depends on your auth service):

```bash
# Example token request (adjust based on your auth implementation)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

Use the token in all subsequent requests:

```bash
export TOKEN="your-jwt-token-here"
```

## Basic Usage Examples

### 1. Check Service Health

```bash
curl -X GET http://localhost:8002/health \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Quick Optimization

```bash
curl -X GET "http://localhost:8002/optimize/quick?blood_type=O_POSITIVE" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Full Optimization

```bash
curl -X POST http://localhost:8002/optimize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "optimization_method": "linear_programming",
    "forecast_horizon_days": 30,
    "constraints": {
      "max_storage_capacity": 1000,
      "min_safety_stock_days": 7,
      "budget_constraint": 100000.0
    }
  }'
```

### 4. Get Active Recommendations

```bash
curl -X GET "http://localhost:8002/recommendations/active?priority=emergency" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Execute Recommendation

```bash
curl -X POST http://localhost:8002/recommendations/rec-001/execute \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Get Optimization Reports

```bash
curl -X GET "http://localhost:8002/reports?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Performance Analytics

```bash
curl -X GET "http://localhost:8002/analytics/optimization-performance?days=30" \
  -H "Authorization: Bearer $TOKEN"
```

## Python Client Example

```python
import requests
import json

class OptimizationClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def optimize_inventory(self, method="linear_programming", days=30):
        url = f"{self.base_url}/optimize"
        data = {
            "optimization_method": method,
            "forecast_horizon_days": days
        }
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()
    
    def get_recommendations(self, priority=None):
        url = f"{self.base_url}/recommendations/active"
        params = {"priority": priority} if priority else {}
        response = requests.get(url, params=params, headers=self.headers)
        return response.json()

# Usage
client = OptimizationClient("http://localhost:8002", "your-token")
report = client.optimize_inventory()
recommendations = client.get_recommendations("emergency")
```

## JavaScript/Node.js Example

```javascript
const axios = require('axios');

class OptimizationAPI {
    constructor(baseURL, token) {
        this.client = axios.create({
            baseURL,
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    async optimizeInventory(method = 'linear_programming', days = 30) {
        const response = await this.client.post('/optimize', {
            optimization_method: method,
            forecast_horizon_days: days
        });
        return response.data;
    }

    async getRecommendations(priority = null) {
        const params = priority ? { priority } : {};
        const response = await this.client.get('/recommendations/active', { params });
        return response.data;
    }

    async executeRecommendation(recommendationId) {
        const response = await this.client.post(`/recommendations/${recommendationId}/execute`);
        return response.data;
    }
}

// Usage
const api = new OptimizationAPI('http://localhost:8002', 'your-token');
api.optimizeInventory().then(report => console.log(report));
```