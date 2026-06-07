"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [lavoro, setLavoro] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);
  const [utente, setUtente] = useState<any>(null);

  useEffect(() => {
    async function controllaUtente() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUtente(session?.user ?? null);
    }

    controllaUtente();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUtente(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/" className="text-xl font-extrabold text-gray-900">
            ProntoAzienda
          </a>

          {utente ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-600 sm:inline">
                {utente.email}
              </span>

              <a
                href="/dashboard"
                className="rounded-xl border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
              >
                Dashboard
              </a>

              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUtente(null);
                  window.location.href = "/";
                }}
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <a
                href="/login"
                className="rounded-xl border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
              >
                Login
              </a>

              <a
                href="/registrati"
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Registrati
              </a>
            </div>
          )}
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Gestionale semplice per artigiani e piccoli professionisti
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            Preventivi, clienti e fatture in un unico posto.
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            ProntoAzienda ti aiuta a creare PDF professionali, gestire clienti,
            convertire preventivi in fatture e controllare scadenze senza Excel,
            fogli sparsi o confusione.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {utente ? (
              <>
                <a
                  href="/dashboard"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
                >
                  Vai alla Dashboard
                </a>

                <a
                  href="/preventivo"
                  className="rounded-xl border border-gray-300 px-6 py-3 text-center font-semibold hover:bg-white"
                >
                  Crea preventivo
                </a>
              </>
            ) : (
              <>
                <a
                  href="/registrati"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
                >
                  Inizia gratis
                </a>

                <a
                  href="#prova"
                  className="rounded-xl border border-gray-300 px-6 py-3 text-center font-semibold hover:bg-white"
                >
                  Candidati come tester
                </a>
              </>
            )}
          </div>

          <div className="mt-8 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              ✅ PDF professionali
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              📱 Invio WhatsApp
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              📊 Dashboard e scadenze
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-xl">
          <div className="rounded-2xl bg-gray-50 p-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-sm text-gray-500">Dashboard</p>
                <h2 className="text-2xl font-bold">Panoramica attività</h2>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                Online
              </span>
            </div>

<div className="mt-5 grid grid-cols-2 gap-4">
  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center shadow-sm">
    <p className="text-sm font-semibold text-blue-700">👥 Clienti</p>
    <p className="mt-2 text-3xl font-extrabold text-blue-700">24</p>
  </div>

  <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 text-center shadow-sm">
    <p className="text-sm font-semibold text-purple-700">📑 Preventivi</p>
    <p className="mt-2 text-3xl font-extrabold text-purple-700">58</p>
  </div>

  <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-center shadow-sm">
    <p className="text-sm font-semibold text-orange-700">🧾 Fatture</p>
    <p className="mt-2 text-3xl font-extrabold text-orange-700">31</p>
  </div>

  <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-center shadow-sm">
    <p className="text-sm font-semibold text-green-700">💰 Incassato</p>
    <p className="mt-2 text-3xl font-extrabold text-green-700">€ 8.420</p>
  </div>
</div>

            <div className="mt-5 rounded-2xl bg-white p-4">
              <p className="font-semibold">⏰ Scadenze imminenti</p>
              <p className="mt-1 text-sm text-gray-500">
                Tieni sotto controllo le fatture da incassare.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Tutto quello che serve per lavorare meglio
          </h2>
          <p className="mt-3 text-gray-600">
            Pensato per chi vuole gestire il lavoro senza perdere tempo.
          </p>
        </div>

  <div className="mt-10 rounded-3xl bg-blue-600 px-8 py-14 text-center text-white shadow-xl md:px-12">
  <h2 className="text-3xl font-bold">
    Meno tempo sui documenti, più tempo sul lavoro.
  </h2>

  <p className="mx-auto mt-4 max-w-2xl text-blue-50">
    Usa ProntoAzienda per tenere tutto ordinato: clienti, preventivi,
    fatture, PDF, Excel e WhatsApp.
  </p>

  <div className="mt-8">
    {utente ? (
      <a
        href="/dashboard"
        className="inline-block rounded-2xl bg-white px-8 py-4 text-lg font-bold text-blue-700 shadow-md"
      >
        Apri Dashboard
      </a>
    ) : (
      <a
        href="/registrati"
        className="inline-block rounded-2xl bg-white px-8 py-4 text-lg font-bold text-blue-700 shadow-md"
      >
        Crea account gratis
      </a>
    )}
  </div>
</div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <h3 className="flex items-center gap-3 text-xl font-bold text-blue-900">
      <span className="text-2xl">📄</span>
      Preventivi veloci
    </h3>

    <p className="mt-4 text-blue-800">
      Crea preventivi numerati, con logo aziendale, IVA e totale automatico.
    </p>
  </div>

  <div className="rounded-3xl border border-orange-100 bg-orange-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <h3 className="flex items-center gap-3 text-xl font-bold text-orange-900">
      <span className="text-2xl">🧾</span>
      Fatture e scadenze
    </h3>

    <p className="mt-4 text-orange-800">
      Converti preventivi in fatture e controlla pagamenti, scadenze e incassi.
    </p>
  </div>

  <div className="rounded-3xl border border-purple-100 bg-purple-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <h3 className="flex items-center gap-3 text-xl font-bold text-purple-900">
      <span className="text-2xl">🔍</span>
      Ricerca globale
    </h3>

    <p className="mt-4 text-purple-800">
      Trova subito clienti, preventivi e fatture dalla barra di ricerca.
    </p>
  </div>
</div>
      </section>

      <section id="prova" className="mx-auto max-w-2xl px-6 py-20">
        <div className="rounded-3xl border-2 border-blue-100 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Diventa uno dei primi tester</h2>

            <p className="mt-3 text-gray-600">
              Prova gratuitamente ProntoAzienda e aiutaci a migliorarlo.
            </p>
          </div>

          <div className="grid gap-4">
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

      <footer className="border-t bg-white px-6 py-10 text-center text-sm text-gray-500">
        <p className="font-bold text-gray-800">ProntoAzienda</p>
        <p className="mt-2">
          Gestionale per professionisti, artigiani e piccole imprese.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-6">
          {utente ? (
            <>
              <a href="/dashboard" className="hover:text-blue-600">
                Dashboard
              </a>
              <a href="/clienti" className="hover:text-blue-600">
                Clienti
              </a>
              <a href="/preventivi" className="hover:text-blue-600">
                Preventivi
              </a>
              <a href="/fatture" className="hover:text-blue-600">
                Fatture
              </a>
            </>
          ) : (
            <>
              <a href="/login" className="hover:text-blue-600">
                Login
              </a>
              <a href="/registrati" className="hover:text-blue-600">
                Registrati
              </a>
              <a href="#prova" className="hover:text-blue-600">
                Prova gratis
              </a>
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-gray-400">
          © 2026 ProntoAzienda · Versione 1.0
        </p>
      </footer>
    </main>
  );
}