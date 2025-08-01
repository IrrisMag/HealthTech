// Blood Bank Dashboard Types

export interface BloodType {
  type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  current_stock: number
  safety_stock: number
  reorder_point: number
  days_until_expiry: number
  status: 'critical' | 'low' | 'adequate' | 'optimal' | 'excess'
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface DashboardMetrics {
  total_donors: number
  total_donations_today: number
  total_donations_this_month: number
  total_inventory_units: number
  units_expiring_soon: number
  pending_requests: number
  emergency_requests: number
  blood_type_distribution: Record<string, number>
  component_distribution: Record<string, number>
  last_updated: string
}

export interface ForecastData {
  blood_type: string
  date: string
  predicted_demand: number
  confidence_interval_lower: number
  confidence_interval_upper: number
  actual_demand?: number
}

export interface OptimizationRecommendation {
  recommendation_id: string
  blood_type: string
  current_stock_level: string
  recommendation_type: 'emergency_order' | 'routine_order' | 'hold_order' | 'reduce_order' | 'redistribute'
  recommended_order_quantity: number
  priority_level: 'low' | 'medium' | 'high' | 'emergency' | 'critical'
  cost_estimate: number
  expected_delivery_date: string
  reasoning: string
  confidence_score: number
  created_at: string
}

export interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  blood_type?: string
  timestamp: string
  acknowledged: boolean
}

export interface DashboardData {
  metrics: DashboardMetrics
  blood_types: BloodType[]
  forecasts: ForecastData[]
  recommendations: OptimizationRecommendation[]
  alerts: Alert[]
}

export interface ApiResponse<T> {
  data: T
  status: 'success' | 'error'
  message?: string
  timestamp: string
}

export interface ChartDataPoint {
  name: string
  value: number
  color?: string
  trend?: 'up' | 'down' | 'stable'
}

export interface TimeSeriesDataPoint {
  date: string
  value: number
  predicted?: number
  lower_bound?: number
  upper_bound?: number
}

export interface InventoryStatus {
  blood_type: string
  current_stock: number
  status: string
  expiry_date: string
  location: string
  temperature: number
}

export interface DonorDemographics {
  age_group: string
  gender: string
  blood_type: string
  donation_frequency: number
  last_donation: string
  eligibility_status: string
}
