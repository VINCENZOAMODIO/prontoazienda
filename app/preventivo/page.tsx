"use client";

import { useState } from "react";

export default function PreventivoPage() {
  const [cliente, setCliente] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [iva, setIva] = useState("22");

  const imponibile = Number(prezzo) || 0;
  const ivaNumero = Number(iva) || 0;
  const totaleIva = imponibile * (ivaNumero / 100);
  const totale = imponibile + totaleIva;

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-sm font-medium text-blue-600">
          ← Torna alla home
        </a>

        <h1 className="mt-8 text-4xl font-bold">
          Crea un preventivo
        </h1>

        <p className="mt-3 text-gray-600">
          Compila i dati e genera un preventivo semplice da inviare al cliente.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border bg-gray-50 p-6">
            <h2 className="text-xl font-bold">Dati preventivo</h2>

            <div className="mt-6 grid gap-4">
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Nome cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
              />

              <textarea
                className="min-h-32 rounded-xl border px-4 py-3"
                placeholder="Descrizione lavoro"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
              />

              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Prezzo senza IVA"
                type="number"
                value={prezzo}
                onChange={(e) => setPrezzo(e.target.value)}
              />

              <input
                className="rounded-xl border px-4 py-3"
                placeholder="IVA %"
                type="number"
                value={iva}
                onChange={(e) => setIva(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold">Preventivo</h2>
                <p className="text-sm text-gray-500">
                  Generato con ProntoAzienda
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                Bozza
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Cliente</p>
                <p className="text-lg font-semibold">
                  {cliente || "Nome cliente"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Descrizione lavoro
                </p>
                <p className="whitespace-pre-line">
                  {descrizione || "Descrizione del lavoro da svolgere"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex justify-between">
                  <span>Imponibile</span>
                  <strong>€ {imponibile.toFixed(2)}</strong>
                </div>

                <div className="mt-2 flex justify-between">
                  <span>IVA {ivaNumero}%</span>
                  <strong>€ {totaleIva.toFixed(2)}</strong>
                </div>

                <div className="mt-4 flex justify-between border-t pt-4 text-xl">
                  <span>Totale</span>
                  <strong>€ {totale.toFixed(2)}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Stampa / Salva PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}