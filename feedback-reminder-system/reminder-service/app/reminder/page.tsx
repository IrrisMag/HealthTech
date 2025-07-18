import { getReminders } from "../../lib/api";
import { useEffect, useState } from "react";

export default function ReminderPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Vous devez être authentifié pour voir les rappels.");
      return;
    }
    getReminders(token)
      .then(setReminders)
      .catch(() => setError("Erreur lors de la récupération des rappels."));
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Liste des rappels</h2>
      <ul className="space-y-2">
        {reminders.map((reminder, idx) => (
          <li key={reminder.id || idx} className="bg-white p-4 rounded shadow">
            <pre className="text-xs">{JSON.stringify(reminder, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
