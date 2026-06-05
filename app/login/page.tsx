"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);

  async function accedi() {
    setMessaggio("");

    if (!email || !password) {
      setMessaggio("Inserisci email e password.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessaggio("Errore accesso: " + error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-md">
        <a href="/" className="text-blue-600">← Torna alla home</a>

        <div className="mt-8 rounded-2xl border p-6">
          <h1 className="text-3xl font-bold">Accedi</h1>

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
              onClick={accedi}
              disabled={loading}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "bold",
              }}
            >
              {loading ? "Accesso..." : "Accedi"}
            </button>

            {messaggio && <p className="text-sm text-red-600">{messaggio}</p>}

            <a href="/registrati" className="text-center text-blue-600">
              Non hai un account? Registrati
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}