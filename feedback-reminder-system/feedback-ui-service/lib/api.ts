// Utilitaires d'appel API pour feedback-ui-service (Next.js)
const FEEDBACK_API_URL = process.env.NEXT_PUBLIC_FEEDBACK_API_URL;
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL;

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
