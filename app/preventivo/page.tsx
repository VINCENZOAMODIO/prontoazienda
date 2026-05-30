"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: string;
  nome: string;
  telefono: string;
  email: string;
};

export default function PreventivoPage() {
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [cliente, setCliente] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [iva, setIva] = useState("22");

  const imponibile = Number(prezzo) || 0;
  const ivaNumero = Number(iva) || 0;
  const totaleIva = imponibile * (ivaNumero / 100);
  const totale = imponibile + totaleIva;

  useEffect(() => {
    async function caricaClienti() {
      const { data, error } = await supabase
        .from("clienti")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setClienti(data || []);
    }

    caricaClienti();
  }, []);

  function selezionaCliente(id: string) {
    setClienteId(id);

    const clienteSelezionato = clienti.find((c) => c.id === id);

    if (clienteSelezionato) {
      setCliente(clienteSelezionato.nome);
    }
  }

  async function scaricaPDF() {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Preventivo", 20, 20);

    doc.setFontSize(12);
    doc.text("Generato con ProntoAzienda", 20, 30);

    doc.line(20, 38, 190, 38);

    doc.setFontSize(14);
    doc.text(`Cliente: ${cliente || "Nome cliente"}`, 20, 50);

    doc.setFontSize(12);
    doc.text("Descrizione lavoro:", 20, 65);
    doc.text(descrizione || "Descrizione del lavoro da svolgere", 20, 75, {
      maxWidth: 160,
    });

    doc.text(`Imponibile: € ${imponibile.toFixed(2)}`, 20, 110);
    doc.text(`IVA ${ivaNumero}%: € ${totaleIva.toFixed(2)}`, 20, 120);

    doc.setFontSize(16);
    doc.text(`Totale: € ${totale.toFixed(2)}`, 20, 140);

    const { error } = await supabase.from("preventivi").insert([
      {
        cliente: cliente || "Nome cliente",
        cliente_id: clienteId || null,
        descrizione: descrizione || "Descrizione del lavoro da svolgere",
        prezzo: imponibile,
        iva: ivaNumero,
        totale: totale,
      },
    ]);

    if (error) {
      alert("Errore salvataggio preventivo: " + error.message);
      console.error(error);
      return;
    }

    doc.save(`preventivo-${cliente || "cliente"}.pdf`);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-sm font-medium text-blue-600">
          ← Torna alla home
        </a>

        <h1 className="mt-8 text-4xl font-bold">Crea un preventivo</h1>

        <p className="mt-3 text-gray-600">
          Compila i dati e genera un preventivo semplice da inviare al cliente.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border bg-gray-50 p-6">
            <h2 className="text-xl font-bold">Dati preventivo</h2>

            <div className="mt-6 grid gap-4">
              <select
                className="rounded-xl border px-4 py-3"
                value={clienteId}
                onChange={(e) => selezionaCliente(e.target.value)}
              >
                <option value="">Scegli cliente salvato</option>
                {clienti.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>

              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Oppure scrivi nome cliente"
                value={cliente}
                onChange={(e) => {
                  setCliente(e.target.value);
                  setClienteId("");
                }}
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
                onClick={scaricaPDF}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Scarica PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}