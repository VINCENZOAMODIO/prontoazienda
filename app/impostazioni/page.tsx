"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ImpostazioniPage() {
  const [nomeAzienda, setNomeAzienda] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [indirizzo, setIndirizzo] = useState("");

  useEffect(() => {
    async function caricaImpostazioni() {
      const { data } = await supabase
        .from("impostazioni")
        .select("*")
        .limit(1)
        .single();

      if (data) {
        setNomeAzienda(data.nome_azienda || "");
        setEmail(data.email || "");
        setTelefono(data.telefono || "");
        setIndirizzo(data.indirizzo || "");
      }
    }

    caricaImpostazioni();
  }, []);

  async function salva() {
    const { data: esistente } = await supabase
      .from("impostazioni")
      .select("id")
      .limit(1)
      .single();

    let error = null;

    if (esistente) {
      const result = await supabase
        .from("impostazioni")
        .update({
          nome_azienda: nomeAzienda,
          email,
          telefono,
          indirizzo,
        })
        .eq("id", esistente.id);

      error = result.error;
    } else {
      const result = await supabase.from("impostazioni").insert([
        {
          nome_azienda: nomeAzienda,
          email,
          telefono,
          indirizzo,
        },
      ]);

      error = result.error;
    }

    if (error) {
      alert(error.message);
      return;
    }

    alert("Impostazioni salvate");
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <a href="/dashboard" className="text-blue-600">
          ← Torna alla dashboard
        </a>

        <h1 className="mt-6 text-4xl font-bold text-gray-900">
          Impostazioni azienda
        </h1>

        <p className="mt-3 text-gray-600">
          Inserisci i dati che userai nei documenti e nei preventivi.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6">
          <div className="grid gap-4">
            <input
              className="rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400"
              placeholder="Nome azienda"
              value={nomeAzienda}
              onChange={(e) => setNomeAzienda(e.target.value)}
            />

            <input
              className="rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400"
              placeholder="Telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />

            <input
              className="rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400"
              placeholder="Indirizzo"
              value={indirizzo}
              onChange={(e) => setIndirizzo(e.target.value)}
            />

            <button
              type="button"
              onClick={salva}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Salva impostazioni
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}