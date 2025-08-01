# Clinical Data Integration Guide

Your Blood Demand Forecasting API now supports **clinical data analysis and predictions**! This guide explains how to use the clinical data features to make data-driven decisions about blood supply management.

## 🩸 What Clinical Data Can Do

Your API can now analyze clinical donor data to:

- **Predict blood supply** based on donor eligibility and clinical factors
- **Assess supply-demand balance** by combining clinical data with ARIMA forecasts
- **Identify risk factors** affecting blood collection
- **Generate actionable recommendations** for donor recruitment and retention
- **Create comprehensive reports** for strategic planning

## 📊 Clinical Data Format

### Donor Clinical Data Structure

Each donor record should include:

```json
{
  "donor_id": "D001",
  "eligibility_status": "eligible",
  "blood_type": "O+",
  "medical_history": "No significant medical history",
  "screening_results": {
    "hemoglobin": 14.5,
    "blood_pressure": "120/80",
    "temperature": 98.6
  },
  "last_updated": "2025-07-31T10:00:00"
}
```

### Eligibility Status Options

- `eligible` - Donor can donate
- `ineligible` - Donor cannot donate (permanent)
- `temporarily_deferred` - Temporary deferral (illness, medication, etc.)
- `permanently_deferred` - Permanent deferral
- `pending_review` - Under medical review

## 🚀 API Endpoints

### 1. Clinical Data Analysis

**Endpoint**: `POST /clinical/analyze`

Analyze clinical data and get summary statistics.

```bash
curl -X POST "http://localhost:8000/clinical/analyze" \
     -H "Content-Type: application/json" \
     -d '{
       "donors": [
         {
           "donor_id": "D001",
           "eligibility_status": "eligible",
           "blood_type": "O+",
           "medical_history": "Regular donor",
           "screening_results": {"hemoglobin": 14.5},
           "last_updated": "2025-07-31T10:00:00"
         }
       ],
       "collection_timestamp": "2025-07-31T10:00:00"
     }'
```

**Returns**:
- Blood type distribution
- Eligibility status distribution
- Data quality metrics

### 2. Blood Supply Prediction

**Endpoint**: `POST /clinical/predict-supply`

Predict blood supply based on clinical data.

```bash
curl -X POST "http://localhost:8000/clinical/predict-supply" \
     -H "Content-Type: application/json" \
     -d '{
       "clinical_data": {
         "donors": [...],
         "collection_timestamp": "2025-07-31T10:00:00"
       },
       "prediction_horizon_days": 14,
       "include_time_series_forecast": true,
       "confidence_level": 0.95
     }'
```

**Returns**:
- Supply predictions by blood type
- Risk assessment (LOW/MEDIUM/HIGH)
- Integration with demand forecasts
- Actionable recommendations

### 3. Comprehensive Clinical Report

**Endpoint**: `POST /clinical/comprehensive-report`

Generate a comprehensive analysis report.

```bash
curl -X POST "http://localhost:8000/clinical/comprehensive-report?prediction_horizon=21" \
     -H "Content-Type: application/json" \
     -d '{
       "donors": [...],
       "collection_timestamp": "2025-07-31T10:00:00"
     }'
```

**Returns**:
- Complete clinical analysis
- Supply predictions with risk scoring
- Key insights and recommendations
- Strategic planning guidance

### 4. Supply-Demand Analysis

**Endpoint**: `POST /clinical/supply-demand-analysis`

Analyze supply-demand balance using clinical data + ARIMA forecasts.

```bash
curl -X POST "http://localhost:8000/clinical/supply-demand-analysis?prediction_days=7" \
     -H "Content-Type: application/json" \
     -d '{
       "donors": [...],
       "collection_timestamp": "2025-07-31T10:00:00"
     }'
```

**Returns**:
- Integrated supply-demand analysis
- Balance status for each blood type
- Critical shortage alerts
- Strategic recommendations

### 5. Clinical System Status

**Endpoint**: `GET /clinical/status`

Check if clinical prediction system is active.

```bash
curl "http://localhost:8000/clinical/status"
```

## 📈 Understanding the Results

### Supply Prediction Metrics

- **Total Donors**: Number of donors in your dataset
- **Eligible Donors**: Number currently eligible to donate
- **Eligibility Rate**: Percentage of eligible donors
- **Predicted Daily Supply**: Expected daily blood units from clinical data
- **Risk Factors**: Issues affecting supply (low eligibility, small pool, etc.)

### Risk Assessment Levels

- **🟢 LOW**: Adequate supply, good eligibility rates
- **🟡 MEDIUM**: Some concerns, monitoring needed
- **🔴 HIGH**: Critical issues, immediate action required

### Supply-Demand Balance Status

- **SHORTAGE_RISK**: Supply < 80% of predicted demand
- **BALANCED**: Supply between 80% and 150% of demand
- **OVERSUPPLY**: Supply > 150% of predicted demand

## 💡 Use Cases

### 1. Daily Operations

```python
# Check current donor pool status
response = requests.post("/clinical/analyze", json=clinical_data)
```

### 2. Weekly Planning

```python
# Predict next week's supply
response = requests.post("/clinical/predict-supply", json={
    "clinical_data": clinical_data,
    "prediction_horizon_days": 7,
    "include_time_series_forecast": True
})
```

### 3. Strategic Planning

```python
# Generate monthly comprehensive report
response = requests.post("/clinical/comprehensive-report", 
    json=clinical_data,
    params={"prediction_horizon": 30}
)
```

### 4. Crisis Management

```python
# Emergency supply-demand analysis
response = requests.post("/clinical/supply-demand-analysis",
    json=clinical_data,
    params={"prediction_days": 3}
)
```

## 🔧 Integration Examples

### Python Integration

```python
import requests
import json
from datetime import datetime

class BloodSupplyPredictor:
    def __init__(self, api_base_url="http://localhost:8000"):
        self.base_url = api_base_url
    
    def analyze_donors(self, donor_data):
        """Analyze clinical donor data."""
        response = requests.post(
            f"{self.base_url}/clinical/analyze",
            json={"donors": donor_data, "collection_timestamp": datetime.now().isoformat()}
        )
        return response.json()
    
    def predict_supply(self, donor_data, days=7):
        """Predict blood supply for next N days."""
        response = requests.post(
            f"{self.base_url}/clinical/predict-supply",
            json={
                "clinical_data": {
                    "donors": donor_data,
                    "collection_timestamp": datetime.now().isoformat()
                },
                "prediction_horizon_days": days,
                "include_time_series_forecast": True
            }
        )
        return response.json()
    
    def get_supply_demand_balance(self, donor_data, days=7):
        """Get supply-demand balance analysis."""
        response = requests.post(
            f"{self.base_url}/clinical/supply-demand-analysis",
            json={
                "donors": donor_data,
                "collection_timestamp": datetime.now().isoformat()
            },
            params={"prediction_days": days}
        )
        return response.json()

# Usage
predictor = BloodSupplyPredictor()

# Your donor data
donors = [
    {
        "donor_id": "D001",
        "eligibility_status": "eligible",
        "blood_type": "O+",
        "medical_history": "Regular donor",
        "screening_results": {"hemoglobin": 14.5},
        "last_updated": datetime.now().isoformat()
    }
    # ... more donors
]

# Analyze current donor pool
analysis = predictor.analyze_donors(donors)
print(f"Total donors: {analysis['total_donors']}")
print(f"Eligibility rate: {analysis['eligibility_distribution']['eligible']/analysis['total_donors']:.1%}")

# Predict next week's supply
supply_forecast = predictor.predict_supply(donors, days=7)
print(f"Predicted weekly supply: {supply_forecast['overall_supply_forecast']['total_predicted_weekly']:.1f} units")

# Check supply-demand balance
balance = predictor.get_supply_demand_balance(donors)
critical_types = balance['summary_insights']['shortage_risk_types']
if critical_types:
    print(f"⚠️ Critical shortage risk: {', '.join(critical_types)}")
```

## 📋 Best Practices

### Data Quality

1. **Complete Records**: Ensure all required fields are populated
2. **Recent Data**: Use current donor information (within last 30 days)
3. **Accurate Status**: Keep eligibility status up-to-date
4. **Consistent Format**: Follow the API data schema exactly

### Prediction Accuracy

1. **Sufficient Sample Size**: Use at least 50+ donors per blood type for reliable predictions
2. **Regular Updates**: Update clinical data regularly for accurate forecasts
3. **Seasonal Factors**: Consider that the API applies seasonal adjustments
4. **Integration**: Always include time-series forecasts for complete analysis

### Operational Use

1. **Daily Monitoring**: Check clinical status daily
2. **Weekly Planning**: Generate supply predictions weekly
3. **Monthly Reports**: Create comprehensive reports monthly
4. **Crisis Response**: Use supply-demand analysis during shortages

## 🚨 Alert Thresholds

The API automatically generates alerts based on:

- **Eligibility Rate < 70%**: Low donor eligibility
- **Donor Pool < 50**: Limited donor pool size
- **Supply/Demand Ratio < 0.8**: Shortage risk
- **Multiple Risk Factors**: Compound risk scenarios

## 📊 Interactive Documentation

Visit your API documentation for interactive testing:

- **Swagger UI**: http://localhost:8000/docs
- **Filter by Tags**: "Clinical Analysis" and "Clinical Predictions"

## 🔮 Advanced Features

### Custom Risk Scoring

The API considers multiple factors for risk assessment:
- Donor pool size
- Eligibility rates
- Historical patterns
- Seasonal variations
- Supply-demand ratios

### Strategic Recommendations

Automated recommendations include:
- Donor recruitment priorities
- Screening process improvements
- Emergency response protocols
- Resource allocation guidance

### Integration Capabilities

- **Database Integration**: Connect your donor database
- **Real-time Updates**: Stream clinical data for live predictions
- **Dashboard Integration**: Use API data in monitoring dashboards
- **Notification Systems**: Set up alerts based on risk levels

## 🎯 Next Steps

1. **Test with your actual clinical data**
2. **Set up automated daily analysis**
3. **Create monitoring dashboards**
4. **Establish alert thresholds**
5. **Train staff on using insights**

Your Blood Demand Forecasting API now provides a complete solution for data-driven blood supply management! 🩸📈