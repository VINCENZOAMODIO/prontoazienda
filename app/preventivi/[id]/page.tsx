"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
        </div>
      </div>
    </main>
  );
}