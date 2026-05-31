"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [clienti, setClienti] = useState(0);
  const [preventivi, setPreventivi] = useState(0);
  const [totale, setTotale] = useState(0);

  useEffect(() => {
    async function caricaDati() {
      const { count: clientiCount } = await supabase
        .from("clienti")
        .select("*", { count: "exact", head: true });

      const { count: preventiviCount } = await supabase
        .from("preventivi")
        .select("*", { count: "exact", head: true });

      const { data } = await supabase
        .from("preventivi")
        .select("totale");

      const totalePreventivi =
        data?.reduce((acc, p) => acc + Number(p.totale), 0) || 0;

      setClienti(clientiCount || 0);
      setPreventivi(preventiviCount || 0);
      setTotale(totalePreventivi);
    }

    caricaDati();
  }, []);

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">Dashboard</h1>

        <p className="mt-2 text-gray-600">
          Panoramica di ProntoAzienda
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border p-6">
            <p className="text-sm text-gray-500">Clienti</p>
            <p className="mt-2 text-4xl font-bold">{clienti}</p>
          </div>

          <div className="rounded-2xl border p-6">
            <p className="text-sm text-gray-500">Preventivi</p>
            <p className="mt-2 text-4xl font-bold">{preventivi}</p>
          </div>

          <div className="rounded-2xl border p-6">
            <p className="text-sm text-gray-500">Valore preventivi</p>
            <p className="mt-2 text-4xl font-bold">
              € {totale.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/clienti"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
          >
            Clienti
          </a>

          <a
            href="/preventivi"
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white"
          >
            Preventivi
          </a>

          <a
            href="/preventivo"
            className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white"
          >
            Nuovo preventivo
          </a>
        </div>
      </div>
    </main>
  );
}