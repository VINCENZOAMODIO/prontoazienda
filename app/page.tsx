"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [lavoro, setLavoro] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);

  async function salvaLead() {
    setMessaggio("");

    if (!nome || !email) {
      setMessaggio("Inserisci almeno nome ed email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("leads").insert([
      {
        nome,
        email,
        lavoro,
        whatsapp,
      },
    ]);

    setLoading(false);

    if (error) {
      setMessaggio("Errore durante il salvataggio. Riprova.");
      console.error(error);
      return;
    }

    setNome("");
    setEmail("");
    setLavoro("");
    setWhatsapp("");
    setMessaggio("Grazie! Ti contatteremo presto.");
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          Per artigiani, elettricisti, idraulici e piccoli professionisti
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Crea preventivi professionali in 30 secondi
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          ProntoAzienda ti aiuta a creare preventivi PDF, salvare clienti e
          inviare tutto su WhatsApp senza usare Excel o carta.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/preventivo"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Crea un preventivo
          </a>

          <a
            href="/preventivi"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50"
          >
            Vedi preventivi
          </a>
        </div>

        <div
          id="come-funziona"
          className="mt-16 grid gap-6 text-left sm:grid-cols-3"
        >
          <div className="rounded-2xl border p-6">
            <h2 className="font-bold">1. Inserisci i dati</h2>
            <p className="mt-2 text-gray-600">
              Cliente, lavoro da svolgere, prezzo e note.
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="font-bold">2. Genera il PDF</h2>
            <p className="mt-2 text-gray-600">
              Ottieni un preventivo pulito e professionale.
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="font-bold">3. Invialo su WhatsApp</h2>
            <p className="mt-2 text-gray-600">
              Copia il messaggio e mandalo subito al cliente.
            </p>
          </div>
        </div>

        <div
          id="prova"
          className="mt-16 w-full max-w-xl rounded-2xl border bg-gray-50 p-6 text-left"
        >
          <h2 className="text-2xl font-bold">Vuoi provarlo gratis?</h2>
          <p className="mt-2 text-gray-600">
            Lascia i tuoi dati. Stiamo cercando i primi tester.
          </p>

          <div className="mt-6 grid gap-4">
            <input
              className="rounded-xl border px-4 py-3"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              className="rounded-xl border px-4 py-3"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="rounded-xl border px-4 py-3"
              placeholder="Che lavoro fai?"
              value={lavoro}
              onChange={(e) => setLavoro(e.target.value)}
            />

            <input
              className="rounded-xl border px-4 py-3"
              placeholder="Numero WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />

            <button
              type="button"
              onClick={salvaLead}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Invio in corso..." : "Candidati come tester"}
            </button>

            {messaggio && (
              <p className="text-center font-medium text-blue-700">
                {messaggio}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}