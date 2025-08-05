// Utilitaires d'appel API pour feedback-ui-service (Next.js)
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL;
const FEEDBACK_API_URL = process.env.NEXT_PUBLIC_FEEDBACK_API_URL;
const REMINDER_API_URL = process.env.NEXT_PUBLIC_REMINDER_API_URL;
const NOTIFICATION_API_URL = process.env.NEXT_PUBLIC_NOTIFICATION_API_URL;
const TRACK1_API_URL = process.env.NEXT_PUBLIC_TRACK1_API_URL || 'http://localhost:8000';
const TRANSLATION_API_URL = process.env.NEXT_PUBLIC_TRANSLATION_API_URL;

// Track 1 and Track 2 API URLs
const TRACK1_API_URL = process.env.NEXT_PUBLIC_TRACK1_API_URL || 'https://track1-production.up.railway.app';
const TRACK2_API_URL = process.env.NEXT_PUBLIC_TRACK2_API_URL || 'https://healthtech-production-e602.up.railway.app';

// API Configuration function
export function getApiConfig() {
  return {
    track1: TRACK1_API_URL,
    track2: TRACK2_API_URL,
    auth: AUTH_API_URL,
    feedback: FEEDBACK_API_URL,
    reminder: REMINDER_API_URL,
    notification: NOTIFICATION_API_URL,
    translation: TRANSLATION_API_URL
  };
}

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
