"use client";

import { richiediLogin } from "@/lib/auth";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type UltimoPreventivo = {
  id: string;
  cliente: string;
  totale: number;
  stato: string | null;
  created_at: string;
};

type GraficoMensile = {
  mese: string;
  totale: number;
};

type StatoPreventivo = {
  stato: string;
  numero: number;
};

type PreventivoDashboard = {
  totale: number;
  stato: string | null;
  created_at: string;
};

type FatturaDashboard = {
  id: string;
  numero: string | null;
  cliente: string;
  totale: number;
  stato: string | null;
  scadenza: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const [clienti, setClienti] = useState(0);
  const [preventivi, setPreventivi] = useState(0);
  const [fatture, setFatture] = useState(0);
  const [daIncassare, setDaIncassare] = useState(0);
  const [incassato, setIncassato] = useState(0);
  const [conversione, setConversione] = useState(0);
  const [fatturatoMensile, setFatturatoMensile] = useState<GraficoMensile[]>([]);
  const [statiPreventivi, setStatiPreventivi] = useState<StatoPreventivo[]>([]);
  const [ultimiPreventivi, setUltimiPreventivi] = useState<UltimoPreventivo[]>([]);
  const [scadenzeImminenti, setScadenzeImminenti] = useState<FatturaDashboard[]>([]);

  useEffect(() => {
    async function caricaDati() {
      const user = await richiediLogin();
      if (!user) return;

      const { count: clientiCount } = await supabase
        .from("clienti")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { data: preventiviData } = await supabase
        .from("preventivi")
        .select("totale, stato, created_at")
        .eq("user_id", user.id);

      const { data: fattureData } = await supabase
        .from("fatture")
        .select("id, numero, cliente, totale, stato, scadenza, created_at")
        .eq("user_id", user.id);

      const { data: ultimi } = await supabase
        .from("preventivi")
        .select("id, cliente, totale, stato, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

const listaPreventivi = (preventiviData || []) as PreventivoDashboard[];
const listaFatture = (fattureData || []) as FatturaDashboard[];

      const mesi = [
        "Gen",
        "Feb",
        "Mar",
        "Apr",
        "Mag",
        "Giu",
        "Lug",
        "Ago",
        "Set",
        "Ott",
        "Nov",
        "Dic",
      ];

      const annoCorrente = new Date().getFullYear();

      const fatturatoPerMese = mesi.map((mese, index) => ({
        mese,
        totale: listaFatture
          .filter((f) => {
            const data = new Date(f.created_at);
            return (
              data.getFullYear() === annoCorrente &&
              data.getMonth() === index &&
              f.stato !== "Annullata"
            );
          })
          .reduce((acc, f) => acc + Number(f.totale), 0),
      }));

      const bozze = listaPreventivi.filter(
        (p) => (p.stato || "Bozza") === "Bozza"
      ).length;

      const inviati = listaPreventivi.filter(
        (p) => p.stato === "Inviato"
      ).length;

      const accettati = listaPreventivi.filter(
        (p) => p.stato === "Accettato"
      ).length;

      const rifiutati = listaPreventivi.filter(
        (p) => p.stato === "Rifiutato"
      ).length;

      const totaleDaIncassare = listaFatture
        .filter((f) => f.stato === "Emessa")
        .reduce((acc, f) => acc + Number(f.totale), 0);

      const totaleIncassato = listaFatture
        .filter((f) => f.stato === "Pagata")
        .reduce((acc, f) => acc + Number(f.totale), 0);

const oggi = new Date();
oggi.setHours(0, 0, 0, 0);

const traSetteGiorni = new Date();
traSetteGiorni.setDate(traSetteGiorni.getDate() + 7);
traSetteGiorni.setHours(23, 59, 59, 999);

const fattureInScadenza = listaFatture
  .filter((f) => {
    if (!f.scadenza) return false;
    if (f.stato === "Pagata" || f.stato === "Annullata") return false;

    const dataScadenza = new Date(f.scadenza);
    dataScadenza.setHours(0, 0, 0, 0);

    return dataScadenza >= oggi && dataScadenza <= traSetteGiorni;
  })
  .sort(
    (a, b) =>
      new Date(a.scadenza || "").getTime() -
      new Date(b.scadenza || "").getTime()
  )
  .slice(0, 5);

      setClienti(clientiCount || 0);
      setPreventivi(listaPreventivi.length);
      setFatture(listaFatture.length);
      setDaIncassare(totaleDaIncassare);
      setIncassato(totaleIncassato);
      setConversione(
        listaPreventivi.length > 0
          ? (accettati / listaPreventivi.length) * 100
          : 0
      );
      setScadenzeImminenti(fattureInScadenza);

      setFatturatoMensile(fatturatoPerMese);
      setStatiPreventivi([
        { stato: "Bozze", numero: bozze },
        { stato: "Inviati", numero: inviati },
        { stato: "Accettati", numero: accettati },
        { stato: "Rifiutati", numero: rifiutati },
      ]);
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
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <div className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Panoramica veloce della tua attività.
              </p>
            </div>

            <a
              href="/preventivo"
              className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              + Nuovo preventivo
            </a>
          </div>

<div
  className="mt-8"
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  }}
>
  <div
    className="rounded-3xl border p-6 text-center shadow-md"
    style={{
      backgroundColor: "#eff6ff",
      borderColor: "#bfdbfe",
    }}
  >
    <p className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-700">
      <span>👥</span> Clienti
    </p>
    <p className="mt-3 text-4xl font-extrabold text-blue-700">
      {clienti}
    </p>
  </div>

  <div
    className="rounded-3xl border p-6 text-center shadow-md"
    style={{
      backgroundColor: "#faf5ff",
      borderColor: "#e9d5ff",
    }}
  >
    <p className="flex items-center justify-center gap-2 text-sm font-semibold text-purple-700">
      <span>📑</span> Preventivi
    </p>
    <p className="mt-3 text-4xl font-extrabold text-purple-700">
      {preventivi}
    </p>
  </div>

  <div
    className="rounded-3xl border p-6 text-center shadow-md"
    style={{
      backgroundColor: "#fff7ed",
      borderColor: "#fed7aa",
    }}
  >
    <p className="flex items-center justify-center gap-2 text-sm font-semibold text-orange-700">
      <span>🧾</span> Fatture
    </p>
    <p className="mt-3 text-4xl font-extrabold text-orange-700">
      {fatture}
    </p>
  </div>

  <div
    className="rounded-3xl border p-6 text-center shadow-md"
    style={{
      backgroundColor: "#fef2f2",
      borderColor: "#fecaca",
    }}
  >
    <p className="flex items-center justify-center gap-2 text-sm font-semibold text-red-700">
      <span>💵</span> Da incassare
    </p>
    <p className="mt-3 text-4xl font-extrabold text-red-700">
      € {daIncassare.toFixed(2)}
    </p>
  </div>
</div>

<div
  className="mt-4"
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  }}
>
  <div
    className="rounded-3xl border p-6 text-center shadow-md"
    style={{
      backgroundColor: "#f0fdf4",
      borderColor: "#bbf7d0",
    }}
  >
    <p className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700">
      <span>💰</span> Incassato
    </p>
    <p className="mt-3 text-4xl font-extrabold text-green-700">
      € {incassato.toFixed(2)}
    </p>
  </div>

  <div
    className="rounded-3xl border p-6 text-center shadow-md"
    style={{
      backgroundColor: "#eef2ff",
      borderColor: "#c7d2fe",
    }}
  >
    <p className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-700">
      <span>📈</span> Conversione preventivi
    </p>
    <p className="mt-3 text-4xl font-extrabold text-indigo-700">
      {conversione.toFixed(0)}%
    </p>
  </div>
</div>

<div className="mt-8 rounded-3xl border bg-white p-6 shadow-md">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-xl font-bold">⏰ Scadenze imminenti</h2>
      <p className="text-sm text-gray-500">
        Fatture in scadenza nei prossimi 7 giorni.
      </p>
    </div>

    <a
      href="/fatture"
      className="rounded-xl border border-gray-300 px-4 py-2 text-center text-sm font-semibold hover:bg-gray-50"
    >
      Vedi fatture
    </a>
  </div>

  <div className="mt-5">
    {scadenzeImminenti.length === 0 ? (
      <div className="rounded-2xl bg-green-50 p-5 text-center font-semibold text-green-700">
        Nessuna fattura in scadenza nei prossimi 7 giorni.
      </div>
    ) : (
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Numero</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Totale</th>
              <th className="p-4">Scadenza</th>
            </tr>
          </thead>

          <tbody>
            {scadenzeImminenti.map((fattura) => (
              <tr
                key={fattura.id}
                className="cursor-pointer border-t hover:bg-gray-50"
                onClick={() =>
                  (window.location.href = `/fatture/${fattura.id}`)
                }
              >
                <td className="p-4 font-mono text-sm">
                  {fattura.numero || "-"}
                </td>

                <td className="p-4 font-medium">{fattura.cliente}</td>

                <td className="p-4">
                  € {Number(fattura.totale).toFixed(2)}
                </td>

                <td className="p-4 font-semibold text-orange-700">
                  {fattura.scadenza
                    ? new Date(fattura.scadenza).toLocaleDateString("it-IT")
                    : "Non indicata"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border bg-white p-6 shadow-md lg:col-span-2">
              <h2 className="text-xl font-bold">Fatturato mensile</h2>
              <p className="text-sm text-gray-500">
                Fatture non annullate nell'anno corrente.
              </p>

              <div style={{ width: "100%", height: 220, marginTop: 24 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fatturatoMensile}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mese" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `€ ${Number(value).toFixed(2)}`,
                        "Fatturato",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="totale"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-md">
              <h2 className="text-xl font-bold">Stato preventivi</h2>
              <p className="text-sm text-gray-500">
                Distribuzione per stato.
              </p>

              <div style={{ width: "100%", height: 220, marginTop: 24 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statiPreventivi}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stato" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="numero"
                      fill="#f97316"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border bg-white p-6 shadow-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Ultimi preventivi</h2>
                <p className="text-sm text-gray-500">
                  Gli ultimi preventivi creati.
                </p>
              </div>

              <a
                href="/preventivi"
                className="rounded-xl border border-gray-300 px-4 py-2 text-center text-sm font-semibold hover:bg-gray-50"
              >
                Vedi tutti
              </a>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border">
              {ultimiPreventivi.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Nessun preventivo trovato.
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
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
                        <td className="p-4 font-medium">{p.cliente}</td>
                        <td className="p-4">
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
                        <td className="p-4">
                          {new Date(p.created_at).toLocaleDateString("it-IT")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}