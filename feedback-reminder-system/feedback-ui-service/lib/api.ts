// Enhanced API utilities for HealthTech frontend with Track 3 integration
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL;
const FEEDBACK_API_URL = process.env.NEXT_PUBLIC_FEEDBACK_API_URL;
const REMINDER_API_URL = process.env.NEXT_PUBLIC_REMINDER_API_URL;
const NOTIFICATION_API_URL = process.env.NEXT_PUBLIC_NOTIFICATION_API_URL;
const TRANSLATION_API_URL = process.env.NEXT_PUBLIC_TRANSLATION_API_URL;

// Track API URLs - Production endpoints
const TRACK1_API_URL = process.env.NEXT_PUBLIC_TRACK1_API_URL || 'https://track1-production.up.railway.app';
const TRACK2_API_URL = 'https://healthtech-production-4917.up.railway.app';
const TRACK3_API_URL = process.env.NEXT_PUBLIC_TRACK3_API_URL || 'https://track3-blood-bank-backend-production.up.railway.app';

// API Configuration function
export function getApiConfig() {
  return {
    track1: TRACK1_API_URL,
    track2: TRACK2_API_URL,
    track3: TRACK3_API_URL,
    auth: AUTH_API_URL,
    feedback: FEEDBACK_API_URL,
    reminder: REMINDER_API_URL,
    notification: NOTIFICATION_API_URL,
    translation: TRANSLATION_API_URL
  };
}

// =============================================================================
// TRACK 3 - BLOOD BANK API FUNCTIONS
// =============================================================================

// Helper function for authenticated requests - NO MOCK DATA
async function authenticatedFetch(url: string, options: RequestInit = {}, token?: string) {
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      timeout: 30000 // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Log data source for transparency
    if (data.data_source) {
      console.log(`Data source: ${data.data_source}`);
    }

    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// Blood Inventory Management
export async function getBloodInventory(token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/inventory`, {}, token);
}

export async function addInventoryItem(item: any, token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/inventory`, {
    method: 'POST',
    body: JSON.stringify(item)
  }, token);
}

export async function getInventoryStatus(bloodType?: string, componentType?: string, token?: string) {
  const params = new URLSearchParams();
  if (bloodType) params.append('blood_type', bloodType);
  if (componentType) params.append('component_type', componentType);

  return authenticatedFetch(`${TRACK3_API_URL}/inventory/status?${params}`, {}, token);
}

export async function updateInventoryStatus(inventoryId: string, status: string, token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/inventory/${inventoryId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }, token);
}

// Donor Management
export async function getDonors(skip = 0, limit = 50, bloodType?: string, token?: string) {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString()
  });
  if (bloodType) params.append('blood_type', bloodType);

  return authenticatedFetch(`${TRACK3_API_URL}/donors?${params}`, {}, token);
}

export async function registerDonor(donor: any, token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/donors`, {
    method: 'POST',
    body: JSON.stringify(donor)
  }, token);
}

export async function getDonor(donorId: string, token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/donors/${donorId}`, {}, token);
}

export async function updateDonor(donorId: string, donor: any, token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/donors/${donorId}`, {
    method: 'PUT',
    body: JSON.stringify(donor)
  }, token);
}

export async function deleteDonor(donorId: string, token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/donors/${donorId}`, {
    method: 'DELETE'
  }, token);
}

// Blood Donations Management
export async function getDonations(skip = 0, limit = 50, donorId?: string, status?: string, token?: string) {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString()
  });
  if (donorId) params.append('donor_id', donorId);
  if (status) params.append('status', status);

  return authenticatedFetch(`${TRACK3_API_URL}/donations?${params}`, {}, token);
}

export async function recordDonation(donation: any, token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/donations`, {
    method: 'POST',
    body: JSON.stringify(donation)
  }, token);
}

export async function getDonation(donationId: string, token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/donations/${donationId}`, {}, token);
}

// Blood Requests Management
export async function getBloodRequests(skip = 0, limit = 50, status?: string, urgencyLevel?: string, token?: string) {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString()
  });
  if (status) params.append('status', status);
  if (urgencyLevel) params.append('urgency_level', urgencyLevel);

  return authenticatedFetch(`${TRACK3_API_URL}/requests?${params}`, {}, token);
}

export async function createBloodRequest(request: any, token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/requests`, {
    method: 'POST',
    body: JSON.stringify(request)
  }, token);
}

export async function getBloodRequest(requestId: string, token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/requests/${requestId}`, {}, token);
}

export async function updateRequestStatus(requestId: string, status: string, token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/requests/${requestId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }, token);
}

// Forecasting Functions
export async function getBloodForecast(bloodType: string, periods = 7, token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/forecast/${bloodType}?periods=${periods}`, {}, token);
}

export async function getBatchForecast(bloodTypes: string[], periods = 7, token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/forecast/batch`, {
    method: 'POST',
    body: JSON.stringify({ blood_types: bloodTypes, periods })
  }, token);
}

export async function getForecastWithClinicalData(clinicalData: any[], forecastHorizonDays = 7, token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/forecast/clinical-data?forecast_horizon_days=${forecastHorizonDays}`, {
    method: 'POST',
    body: JSON.stringify(clinicalData)
  }, token);
}

export async function getForecastModels(token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/forecast/models`, {}, token);
}

export async function getForecastAccuracy(token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/forecast/accuracy`, {}, token);
}

// Optimization Functions
export async function getOptimizationRecommendations(token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/recommendations/active`, {}, token);
}

export async function runOptimization(algorithm = 'linear_programming', token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/optimize`, {
    method: 'POST',
    body: JSON.stringify({ algorithm })
  }, token);
}

export async function runAdvancedOptimization(optimizationData: any, token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/optimize/advanced`, {
    method: 'POST',
    body: JSON.stringify(optimizationData)
  }, token);
}

export async function getOptimizationReports(skip = 0, limit = 20, token?: string) {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString()
  });

  return authenticatedFetch(`${TRACK3_API_URL}/optimization/reports?${params}`, {}, token);
}

export async function getOptimizationReport(reportId: string, token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/optimization/reports/${reportId}`, {}, token);
}

// Analytics Functions
export async function getPerformanceAnalytics(token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/analytics/performance`, {}, token);
}

export async function getCostSavingsAnalytics(token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/analytics/cost-savings`, {}, token);
}

export async function getSupplyDemandAnalytics(token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/analytics/supply-demand`, {}, token);
}

// DHIS2 Integration Functions
export async function testDHIS2Connection(token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/dhis2/test-connection`, {}, token);
}

export async function syncToDHIS2(syncData: any, token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/dhis2/sync`, {
    method: 'POST',
    body: JSON.stringify(syncData)
  }, token);
}

export async function getDHIS2SyncHistory(token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/dhis2/sync-history`, {}, token);
}

// Clinical Data Functions
export async function analyzeDonorEligibility(clinicalData: any[], token: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/clinical/donor-eligibility`, {
    method: 'POST',
    body: JSON.stringify(clinicalData)
  }, token);
}

// Dashboard Functions
export async function getDashboardMetrics(token?: string) {
  return authenticatedFetch(`${TRACK3_API_URL}/dashboard/metrics`, {}, token);
}

// =============================================================================
// ORIGINAL API FUNCTIONS (Track 1 & 2)
// =============================================================================

// =============================================================================
// DATA VALIDATION AND ERROR HANDLING
// =============================================================================

// Validate that data is not mock
function validateRealData(data: any, endpoint: string): void {
  if (!data) {
    throw new Error(`No data received from ${endpoint}`);
  }

  // Check for mock data indicators
  if (data.data_source === 'mock' || data.status === 'mock') {
    console.warn(`⚠️ Mock data detected from ${endpoint}`);
  }

  // Validate required fields based on endpoint
  if (endpoint.includes('/inventory') && data.inventory) {
    if (!Array.isArray(data.inventory)) {
      throw new Error('Invalid inventory data format');
    }
  }

  if (endpoint.includes('/donors') && data.donors) {
    if (!Array.isArray(data.donors)) {
      throw new Error('Invalid donors data format');
    }
  }
}

// Enhanced API wrapper with validation
async function validatedFetch(url: string, options: RequestInit = {}, token?: string) {
  const data = await authenticatedFetch(url, options, token);
  validateRealData(data, url);
  return data;
}

// =============================================================================
// ORIGINAL API FUNCTIONS (Track 1 & 2) - UPDATED FOR REAL DATA
// =============================================================================

export async function getFeedbacks(token: string) {
  const res = await fetch(`${FEEDBACK_API_URL}/feedback`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des feedbacks');
  return res.json();
}

export async function submitFeedback(feedbackData: any, token?: string) {
  const headers: any = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Try both endpoints for compatibility
  const endpoints = [
    `${FEEDBACK_API_URL}/api/feedback/submit`,
    `${FEEDBACK_API_URL}/feedback`,
    `${TRACK1_API_URL}/api/feedback/submit`,
    `${TRACK1_API_URL}/feedback`
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(feedbackData)
      });
      if (res.ok) {
        return res.json();
      }
    } catch (error) {
      console.warn(`Failed to submit to ${endpoint}:`, error);
    }
  }

  throw new Error('Erreur lors de la soumission du feedback - tous les endpoints ont échoué');
}

export async function login(email: string, password: string) {
  const res = await fetch(`${AUTH_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Erreur d’authentification');
  return res.json(); // { access_token, ... }
}

// Reminder API calls
export async function getReminders(token: string) {
  const res = await fetch(`${REMINDER_API_URL}/reminders/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des rappels');
  return res.json();
}

export async function createReminder(reminderData: any, token: string) {
  const res = await fetch(`${REMINDER_API_URL}/reminders/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reminderData)
  });
  if (!res.ok) throw new Error('Erreur lors de la création du rappel');
  return res.json();
}

// Notification API calls
export async function sendNotification(notificationData: any, token: string) {
  const res = await fetch(`${NOTIFICATION_API_URL}/notifications/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(notificationData)
  });
  if (!res.ok) throw new Error('Erreur lors de l\'envoi de la notification');
  return res.json();
}

// Translation API calls
export async function translateText(text: string, targetLanguage: string, token: string) {
  const res = await fetch(`${TRANSLATION_API_URL}/translate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, target_language: targetLanguage })
  });
  if (!res.ok) throw new Error('Erreur lors de la traduction');
  return res.json();
}
