"use client";

import { useEffect, useState } from "react";
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

export default function PreventiviPage() {
  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function caricaPreventivi() {
      const { data, error } = await supabase
        .from("preventivi")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPreventivi(data);
      }

      setLoading(false);
    }

    caricaPreventivi();
  }, []);

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-sm font-medium text-blue-600">
          ← Torna alla home
        </a>

        <h1 className="mt-8 text-4xl font-bold">Preventivi salvati</h1>

        <p className="mt-3 text-gray-600">
          Qui trovi tutti i preventivi creati con ProntoAzienda.
        </p>

        <div className="mt-8">
          {loading ? (
            <p>Caricamento...</p>
          ) : preventivi.length === 0 ? (
            <p className="rounded-2xl border bg-gray-50 p-6">
              Nessun preventivo salvato.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Totale</th>
                    <th className="p-4">IVA</th>
                    <th className="p-4">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {preventivi.map((preventivo) => (
                    <tr
                        key={preventivo.id}
                        className="border-t cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                            (window.location.href = `/preventivi/${preventivo.id}`)
                    }>
                      <td className="p-4 font-medium">{preventivo.cliente}</td>
                      <td className="p-4">
                        € {Number(preventivo.totale).toFixed(2)}
                      </td>
                      <td className="p-4">{preventivo.iva}%</td>
                      <td className="p-4">
                        {new Date(preventivo.created_at).toLocaleDateString(
                          "it-IT"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8">
          <a
            href="/preventivo"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Crea nuovo preventivo
          </a>
        </div>
      </div>
    </main>
  );
}