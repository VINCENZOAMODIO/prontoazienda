"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { richiediLogin } from "@/lib/auth";

export default function NuovoClientePage() {
  const [nome, setNome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function salvaCliente() {
    if (!nome) {
      alert("Inserisci almeno il nome del cliente.");
      return;
    }

    setLoading(true);

    const user = await richiediLogin();

if (!user) {
  setLoading(false);
  return;
}

const { error } = await supabase.from("clienti").insert([
  {
    user_id: user.id,
    nome,
    telefono,
    email,
    note,
  },
]);

    setLoading(false);

    if (error) {
      alert("Errore salvataggio: " + error.message);
      return;
    }

    window.location.href = "/clienti";
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <a href="/clienti" className="text-blue-600">
          ← Torna ai clienti
        </a>

        <h1 className="mt-6 text-4xl font-bold">Nuovo cliente</h1>

        <div className="mt-8 grid gap-4 rounded-2xl border bg-gray-50 p-6">
          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Nome cliente"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <textarea
            className="min-h-32 rounded-xl border px-4 py-3"
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            type="button"
            onClick={salvaCliente}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Salvataggio..." : "Salva cliente"}
          </button>
        </div>
      </div>
    </main>
  );
}