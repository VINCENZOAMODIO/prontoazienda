"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UltimoPreventivo = {
  id: string;
  cliente: string;
  totale: number;
  stato: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const [clienti, setClienti] = useState(0);
  const [preventivi, setPreventivi] = useState(0);
  const [totale, setTotale] = useState(0);

  const [bozze, setBozze] = useState(0);
  const [inviati, setInviati] = useState(0);
  const [accettati, setAccettati] = useState(0);
  const [rifiutati, setRifiutati] = useState(0);

  const [valoreAccettati, setValoreAccettati] = useState(0);
  const [conversione, setConversione] = useState(0);
  const [ultimiPreventivi, setUltimiPreventivi] = useState<UltimoPreventivo[]>(
    []
  );

  useEffect(() => {
    async function caricaDati() {
      const { count: clientiCount } = await supabase
        .from("clienti")
        .select("*", { count: "exact", head: true });

      const { data: preventiviData } = await supabase
        .from("preventivi")
        .select("totale, stato");

      const { data: ultimi } = await supabase
        .from("preventivi")
        .select("id, cliente, totale, stato, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      const lista = preventiviData || [];

      const totalePreventivi = lista.reduce(
        (acc, p) => acc + Number(p.totale),
        0
      );

      const totaleAccettati = lista
        .filter((p) => p.stato === "Accettato")
        .reduce((acc, p) => acc + Number(p.totale), 0);

      const numeroPreventivi = lista.length;
      const numeroAccettati = lista.filter(
        (p) => p.stato === "Accettato"
      ).length;

      setClienti(clientiCount || 0);
      setPreventivi(numeroPreventivi);
      setTotale(totalePreventivi);

      setBozze(lista.filter((p) => (p.stato || "Bozza") === "Bozza").length);
      setInviati(lista.filter((p) => p.stato === "Inviato").length);
      setAccettati(numeroAccettati);
      setRifiutati(lista.filter((p) => p.stato === "Rifiutato").length);

      setValoreAccettati(totaleAccettati);
      setConversione(
        numeroPreventivi > 0 ? (numeroAccettati / numeroPreventivi) * 100 : 0
      );
      setUltimiPreventivi(ultimi || []);
    }

    caricaDati();
  }, []);

  function classeStato(stato: string | null) {
    if (stato === "Accettato") return "bg-green-100 text-green-700";
    if (stato === "Rifiutato") return "bg-red-100 text-red-700";
    if (stato === "Inviato") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 border-b pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/" className="text-sm font-medium text-blue-600">
              ← Torna alla home
            </a>

            <h1 className="mt-4 text-4xl font-bold">Dashboard</h1>

            <p className="mt-2 text-gray-600">
              Panoramica rapida di clienti, preventivi e lavori confermati.
            </p>
          </div>

          <a
            href="/preventivo"
            className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
          >
            + Nuovo preventivo
          </a>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border p-6">
            <div className="text-3xl">👥</div>
            <p className="mt-4 text-sm font-medium text-gray-500">Clienti</p>
            <p className="mt-2 text-4xl font-bold text-gray-900">{clienti}</p>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="text-3xl">📑</div>
            <p className="mt-4 text-sm font-medium text-gray-500">Preventivi</p>
            <p className="mt-2 text-4xl font-bold text-gray-900">
              {preventivi}
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="text-3xl">💶</div>
            <p className="mt-4 text-sm font-medium text-gray-500">
              Valore preventivi
            </p>
            <p className="mt-2 text-4xl font-bold text-gray-900">
              € {totale.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border p-8">
            <p className="text-sm font-semibold text-gray-500">
              💰 Valore preventivi accettati
            </p>
            <p className="mt-3 text-5xl font-bold text-gray-900">
              € {valoreAccettati.toFixed(2)}
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Somma dei preventivi con stato “Accettato”.
            </p>
          </div>

          <div className="rounded-2xl border p-8">
            <p className="text-sm font-semibold text-gray-500">
              📈 Tasso di conversione
            </p>
            <p className="mt-3 text-5xl font-bold text-gray-900">
              {conversione.toFixed(0)}%
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Percentuale di preventivi accettati sul totale.
            </p>
          </div>
        </div>

        <h2 className="mt-10 text-center text-2xl font-bold">
          Stato preventivi
        </h2>

        <div className="mx-auto mt-6 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-8 text-center">
            <div className="text-4xl">📄</div>
            <p className="mt-3 text-sm font-medium text-gray-500">Bozze</p>
            <p className="mt-2 text-5xl font-bold text-gray-900">{bozze}</p>
          </div>

          <div className="rounded-2xl border p-8 text-center">
            <div className="text-4xl">📤</div>
            <p className="mt-3 text-sm font-medium text-gray-500">Inviati</p>
            <p className="mt-2 text-5xl font-bold text-gray-900">{inviati}</p>
          </div>

          <div className="rounded-2xl border p-8 text-center">
            <div className="text-4xl">✅</div>
            <p className="mt-3 text-sm font-medium text-gray-500">Accettati</p>
            <p className="mt-2 text-5xl font-bold text-gray-900">
              {accettati}
            </p>
          </div>

          <div className="rounded-2xl border p-8 text-center">
            <div className="text-4xl">❌</div>
            <p className="mt-3 text-sm font-medium text-gray-500">Rifiutati</p>
            <p className="mt-2 text-5xl font-bold text-gray-900">
              {rifiutati}
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Ultimi preventivi</h2>
              <p className="mt-1 text-sm text-gray-500">
                Gli ultimi preventivi creati nel gestionale.
              </p>
            </div>

            <a
              href="/preventivi"
              className="rounded-xl border border-gray-300 px-4 py-2 text-center text-sm font-semibold hover:bg-gray-50"
            >
              Vedi tutti
            </a>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border">
            {ultimiPreventivi.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nessun preventivo trovato.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-900">
                  <tr>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Totale</th>
                    <th className="p-4">Stato</th>
                    <th className="p-4">Data</th>
                  </tr>
                </thead>

                <tbody>
                  {ultimiPreventivi.map((p) => (
                    <tr
                      key={p.id}
                      className="cursor-pointer border-t hover:bg-gray-50"
                      onClick={() =>
                        (window.location.href = `/preventivi/${p.id}`)
                      }
                    >
                      <td className="p-4 font-medium text-gray-900">
                        {p.cliente}
                      </td>
                      <td className="p-4 text-gray-900">
                        € {Number(p.totale).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${classeStato(
                            p.stato || "Bozza"
                          )}`}
                        >
                          {p.stato || "Bozza"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        {new Date(p.created_at).toLocaleDateString("it-IT")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">

  <a
    href="/clienti"
    style={{
      backgroundColor: "#2563eb",
      color: "white",
      padding: "12px 24px",
      borderRadius: "12px",
      fontWeight: "bold",
      textDecoration: "none",
    }}
  >
    👥 Clienti
  </a>

  <a
    href="/preventivi"
    style={{
      backgroundColor: "#16a34a",
      color: "white",
      padding: "12px 24px",
      borderRadius: "12px",
      fontWeight: "bold",
      textDecoration: "none",
    }}
  >
    📄 Preventivi
  </a>

  <a
    href="/preventivo"
    style={{
      backgroundColor: "#9333ea",
      color: "white",
      padding: "12px 24px",
      borderRadius: "12px",
      fontWeight: "bold",
      textDecoration: "none",
    }}
  >
    ➕ Nuovo preventivo
  </a>

  <a
    href="/impostazioni"
    style={{
      backgroundColor: "#475569",
      color: "white",
      padding: "12px 24px",
      borderRadius: "12px",
      fontWeight: "bold",
      textDecoration: "none",
    }}
  >
    ⚙️ Impostazioni
  </a>

</div>
      </div>
    </main>
  );
}