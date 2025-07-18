import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Bienvenue sur le Reminder Service UI</h1>
      <Link href="/reminder" className="text-blue-700 underline">
        Accéder à la liste des rappels
      </Link>
    </div>
  );
}
