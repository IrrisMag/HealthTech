import axios from 'axios'
import { DashboardData, DashboardMetrics, ForecastData, OptimizationRecommendation, Alert } from '@/types'

// API Configuration
const DATA_API_URL = process.env.NEXT_PUBLIC_DATA_API_URL || 'http://localhost:8000'
const FORECAST_API_URL = process.env.NEXT_PUBLIC_FORECAST_API_URL || 'http://localhost:8001'
const OPTIMIZATION_API_URL = process.env.NEXT_PUBLIC_OPTIMIZATION_API_URL || 'http://localhost:8002'

// Create axios instances with default configurations
const dataApi = axios.create({
  baseURL: DATA_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const forecastApi = axios.create({
  baseURL: FORECAST_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const optimizationApi = axios.create({
  baseURL: OPTIMIZATION_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptors for authentication if needed
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

dataApi.interceptors.request.use(addAuthToken)
forecastApi.interceptors.request.use(addAuthToken)
optimizationApi.interceptors.request.use(addAuthToken)

// API Functions
export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    const response = await dataApi.get('/dashboard/metrics')
    return response.data
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    throw new Error('Failed to fetch dashboard metrics')
  }
}

export const fetchBloodInventory = async () => {
  try {
    const response = await dataApi.get('/inventory')
    return response.data
  } catch (error) {
    console.error('Error fetching blood inventory:', error)
    throw new Error('Failed to fetch blood inventory')
  }
}

export const fetchForecasts = async (days: number = 7): Promise<ForecastData[]> => {
  try {
    // Fetch forecasts for all blood types
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    const forecastPromises = bloodTypes.map(async (bloodType) => {
      try {
        const response = await forecastApi.get(`/forecast/${bloodType}?periods=${days}`)
        return response.data.forecasts.map((f: any) => ({
          blood_type: bloodType,
          date: f.date,
          predicted_demand: f.predicted_demand,
          confidence_interval_lower: f.lower_bound,
          confidence_interval_upper: f.upper_bound,
        }))
      } catch (error) {
        console.error(`Error fetching forecast for ${bloodType}:`, error)
        return []
      }
    })

    const results = await Promise.all(forecastPromises)
    return results.flat()
  } catch (error) {
    console.error('Error fetching forecasts:', error)
    // Return mock data for development
    return generateMockForecasts(days)
  }
}

export const fetchOptimizationRecommendations = async (): Promise<OptimizationRecommendation[]> => {
  try {
    const response = await optimizationApi.get('/recommendations/active')
    return response.data.recommendations || []
  } catch (error) {
    console.error('Error fetching optimization recommendations:', error)
    // Return mock data for development
    return generateMockRecommendations()
  }
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const [metrics, inventory, forecasts, recommendations] = await Promise.all([
      fetchDashboardMetrics(),
      fetchBloodInventory(),
      fetchForecasts(),
      fetchOptimizationRecommendations(),
    ])

    // Process inventory data to extract blood types
    const bloodTypes = processInventoryData(inventory)
    
    // Generate alerts based on current data
    const alerts = generateAlerts(bloodTypes, recommendations)

    return {
      metrics,
      blood_types: bloodTypes,
      forecasts,
      recommendations,
      alerts,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Return mock data for development
    return generateMockDashboardData()
  }
}

// Helper functions
const processInventoryData = (inventory: any) => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  
  return bloodTypes.map(type => {
    const typeInventory = inventory.filter((item: any) => item.blood_type === type)
    const currentStock = typeInventory.length
    const safetyStock = 20 // Default safety stock
    const reorderPoint = 15 // Default reorder point
    
    let status: 'critical' | 'low' | 'adequate' | 'optimal' | 'excess'
    if (currentStock <= 5) status = 'critical'
    else if (currentStock <= reorderPoint) status = 'low'
    else if (currentStock <= safetyStock * 1.5) status = 'adequate'
    else if (currentStock <= safetyStock * 2) status = 'optimal'
    else status = 'excess'

    return {
      type: type as any,
      current_stock: currentStock,
      safety_stock: safetyStock,
      reorder_point: reorderPoint,
      days_until_expiry: Math.floor(Math.random() * 30) + 1,
      status,
      trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
    }
  })
}

const generateAlerts = (bloodTypes: any[], recommendations: OptimizationRecommendation[]): Alert[] => {
  const alerts: Alert[] = []
  
  // Critical stock alerts
  bloodTypes.forEach(bt => {
    if (bt.status === 'critical') {
      alerts.push({
        id: `critical-${bt.type}`,
        type: 'critical',
        title: 'Critical Stock Level',
        message: `${bt.type} blood type has critically low stock (${bt.current_stock} units)`,
        blood_type: bt.type,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      })
    }
  })

  // Emergency recommendations
  recommendations.forEach(rec => {
    if (rec.priority_level === 'emergency') {
      alerts.push({
        id: `emergency-${rec.recommendation_id}`,
        type: 'critical',
        title: 'Emergency Order Required',
        message: rec.reasoning,
        blood_type: rec.blood_type,
        timestamp: rec.created_at,
        acknowledged: false,
      })
    }
  })

  return alerts
}

// Mock data generators for development
const generateMockForecasts = (days: number): ForecastData[] => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const forecasts: ForecastData[] = []
  
  bloodTypes.forEach(type => {
    for (let i = 1; i <= days; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      const baseDemand = Math.random() * 20 + 10
      forecasts.push({
        blood_type: type,
        date: date.toISOString().split('T')[0],
        predicted_demand: baseDemand,
        confidence_interval_lower: baseDemand * 0.8,
        confidence_interval_upper: baseDemand * 1.2,
      })
    }
  })
  
  return forecasts
}

const generateMockRecommendations = (): OptimizationRecommendation[] => {
  return [
    {
      recommendation_id: 'rec-001',
      blood_type: 'O+',
      current_stock_level: 'critical',
      recommendation_type: 'emergency_order',
      recommended_order_quantity: 50,
      priority_level: 'emergency',
      cost_estimate: 6250,
      expected_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      reasoning: 'URGENT: Current stock (5) is below safety level (20).',
      confidence_score: 0.95,
      created_at: new Date().toISOString(),
    },
  ]
}

const generateMockDashboardData = (): DashboardData => {
  return {
    metrics: {
      total_donors: 1250,
      total_donations_today: 15,
      total_donations_this_month: 342,
      total_inventory_units: 890,
      units_expiring_soon: 23,
      pending_requests: 8,
      emergency_requests: 2,
      blood_type_distribution: {
        'O+': 180, 'O-': 45, 'A+': 150, 'A-': 38,
        'B+': 120, 'B-': 32, 'AB+': 85, 'AB-': 22
      },
      component_distribution: {
        'whole_blood': 450, 'red_cells': 280, 'plasma': 160
      },
      last_updated: new Date().toISOString(),
    },
    blood_types: processInventoryData([]),
    forecasts: generateMockForecasts(7),
    recommendations: generateMockRecommendations(),
    alerts: [],
  }
}
