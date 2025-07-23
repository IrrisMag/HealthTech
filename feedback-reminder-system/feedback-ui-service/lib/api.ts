// Utilitaires d'appel API pour feedback-ui-service (Next.js)
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL;
const FEEDBACK_API_URL = process.env.NEXT_PUBLIC_FEEDBACK_API_URL;
const REMINDER_API_URL = process.env.NEXT_PUBLIC_REMINDER_API_URL;
const NOTIFICATION_API_URL = process.env.NEXT_PUBLIC_NOTIFICATION_API_URL;
const TRANSLATION_API_URL = process.env.NEXT_PUBLIC_TRANSLATION_API_URL;

export async function getFeedbacks(token: string) {
  const res = await fetch(`${FEEDBACK_API_URL}/feedbacks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des feedbacks');
  return res.json();
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
  const res = await fetch(`${REMINDER_API_URL}/reminders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des rappels');
  return res.json();
}

export async function createReminder(reminderData: any, token: string) {
  const res = await fetch(`${REMINDER_API_URL}/reminders`, {
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
