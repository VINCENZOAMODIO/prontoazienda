"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";

type Preventivo = {
  id: string;
  cliente: string;
  descrizione: string;
  prezzo: number;
  iva: number;
  totale: number;
  created_at: string;
};

export default function DettaglioPreventivo() {
  const params = useParams();
  const id = params.id as string;

  const [preventivo, setPreventivo] = useState<Preventivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState("");

  useEffect(() => {
    async function caricaPreventivo() {
      const { data, error } = await supabase
        .from("preventivi")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setErrore(error.message);
      } else {
        setPreventivo(data);
      }

      setLoading(false);
    }

    if (id) {
      caricaPreventivo();
    }
  }, [id]);

  function scaricaPDF() {
    if (!preventivo) return;

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Preventivo", 20, 20);

    doc.setFontSize(12);
    doc.text("Generato con ProntoAzienda", 20, 30);

    doc.line(20, 38, 190, 38);

    doc.setFontSize(14);
    doc.text(`Cliente: ${preventivo.cliente}`, 20, 50);

    doc.setFontSize(12);
    doc.text("Descrizione lavoro:", 20, 65);
    doc.text(preventivo.descrizione, 20, 75, {
      maxWidth: 160,
    });

    doc.text(
      `Imponibile: € ${Number(preventivo.prezzo).toFixed(2)}`,
      20,
      110
    );

    doc.text(`IVA ${preventivo.iva}%`, 20, 120);

    doc.setFontSize(16);
    doc.text(
      `Totale: € ${Number(preventivo.totale).toFixed(2)}`,
      20,
      140
    );

    doc.save(`preventivo-${preventivo.cliente}.pdf`);
  }

  async function eliminaPreventivo() {
    const conferma = confirm(
      "Sei sicuro di voler eliminare questo preventivo?"
    );

    if (!conferma || !preventivo) return;

    const { error } = await supabase
      .from("preventivi")
      .delete()
      .eq("id", preventivo.id);

    if (error) {
      alert("Errore eliminazione: " + error.message);
      return;
    }

    window.location.href = "/preventivi";
  }

  if (loading) {
    return <div className="p-10">Caricamento...</div>;
  }

  if (!preventivo) {
    return (
      <div className="p-10">
        <p>Preventivo non trovato.</p>
        {errore && <p className="mt-2 text-red-600">Errore: {errore}</p>}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <a href="/preventivi" className="text-blue-600">
          ← Torna ai preventivi
        </a>

        <h1 className="mt-6 text-4xl font-bold">Preventivo</h1>

        <div className="mt-8 rounded-2xl border p-6">
          <p>
            <strong>Cliente:</strong> {preventivo.cliente}
          </p>

          <p className="mt-4">
            <strong>Descrizione:</strong>
          </p>

          <p className="mt-2 whitespace-pre-line">{preventivo.descrizione}</p>

          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p>Imponibile: € {Number(preventivo.prezzo).toFixed(2)}</p>
            <p>IVA: {preventivo.iva}%</p>

            <p className="mt-3 text-xl font-bold">
              Totale: € {Number(preventivo.totale).toFixed(2)}
            </p>
          </div>

<div className="mt-6 flex flex-col gap-3">
  <button
    type="button"
    onClick={scaricaPDF}
    className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
  >
    Scarica PDF
  </button>

  <a
    href={`/preventivi/${preventivo.id}/modifica`}
    className="w-full rounded-xl border border-gray-300 px-6 py-3 text-center font-semibold hover:bg-gray-50"
  >
    Modifica preventivo
  </a>

  <button
    type="button"
    onClick={eliminaPreventivo}
    className="w-full rounded-xl border border-red-300 px-6 py-3 font-semibold text-red-600 hover:bg-red-50"
  >
    Elimina preventivo
  </button>
</div>
        </div>
      </div>
    </main>
  );
}