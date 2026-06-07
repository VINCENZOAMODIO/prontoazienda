"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UpgradePage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold">
            Scegli il piano giusto per te
          </h1>

          <p className="mt-3 text-gray-600">
            Inizia gratis e passa a Pro quando vuoi sbloccare tutto.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border bg-white p-8 shadow-md">
            <h2 className="text-2xl font-bold">Gratis</h2>

            <p className="mt-2 text-gray-600">
              Perfetto per iniziare e provare ProntoAzienda.
            </p>

            <p className="mt-6 text-4xl font-extrabold">€0</p>

            <ul className="mt-6 space-y-3 text-gray-700">
              <li>✅ 20 preventivi al mese</li>
              <li>✅ 20 fatture al mese</li>
              <li>✅ Gestione clienti</li>
              <li>✅ PDF preventivi e fatture</li>
            </ul>

            <a
              href="/dashboard"
              className="mt-8 block rounded-xl border border-gray-300 px-6 py-3 text-center font-semibold hover:bg-gray-50"
            >
              Continua gratis
            </a>
          </div>

          <div className="rounded-3xl border-2 border-blue-500 bg-white p-8 shadow-xl">
            <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              Consigliato
            </div>

            <h2 className="mt-4 text-2xl font-bold">Pro</h2>

            <p className="mt-2 text-gray-600">
              Per professionisti che usano ProntoAzienda ogni giorno.
            </p>

            <p className="mt-6 text-4xl font-extrabold">
              €9
              <span className="text-base font-medium text-gray-500"> / mese</span>
            </p>

            <ul className="mt-6 space-y-3 text-gray-700">
              <li>✅ Preventivi illimitati</li>
              <li>✅ Fatture illimitate</li>
              <li>✅ Logo aziendale nei PDF</li>
              <li>✅ Dashboard avanzata</li>
              <li>✅ Ricerca globale</li>
              <li>✅ Priorità nuove funzioni</li>
            </ul>

            <button
              type="button"
              onClick={() => alert("Stripe verrà collegato nel prossimo step.")}
              className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Passa a Pro
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}