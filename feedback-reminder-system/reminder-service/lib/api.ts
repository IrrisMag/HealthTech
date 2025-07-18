const REMINDER_API_URL = process.env.NEXT_PUBLIC_REMINDER_API_URL;
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL;

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

export async function login(email: string, password: string) {
  const res = await fetch(`${AUTH_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Erreur d’authentification');
  return res.json();
}
