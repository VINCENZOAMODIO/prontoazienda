"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegistratiPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);

  async function registrati() {
    setMessaggio("");

    if (!email || !password) {
      setMessaggio("Inserisci email e password.");
      return;
    }

    if (password.length < 6) {
      setMessaggio("La password deve avere almeno 6 caratteri.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessaggio("Errore registrazione: " + error.message);
      return;
    }

    setMessaggio("Registrazione completata. Ora puoi accedere.");
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-md">
        <a href="/" className="text-blue-600">← Torna alla home</a>

        <div className="mt-8 rounded-2xl border p-6">
          <h1 className="text-3xl font-bold">Registrati</h1>

          <div className="mt-6 grid gap-4">
            <input
              className="rounded-xl border px-4 py-3"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="rounded-xl border px-4 py-3"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={registrati}
              disabled={loading}
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "bold",
              }}
            >
              {loading ? "Registrazione..." : "Registrati"}
            </button>

            {messaggio && <p className="text-sm text-blue-700">{messaggio}</p>}

            <a href="/login" className="text-center text-blue-600">
              Hai già un account? Accedi
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}