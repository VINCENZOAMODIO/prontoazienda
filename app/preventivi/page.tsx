"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { richiediLogin } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Preventivo = {
  id: string;
  cliente: string;
  descrizione: string;
  prezzo: number;
  iva: number;
  totale: number;
  stato: string | null;
  created_at: string;
};

export default function PreventiviPage() {
  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const [ricerca, setRicerca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function caricaPreventivi() {

      const user = await richiediLogin();

if (!user) {
  return;
}
      const { data, error } = await supabase
.from("preventivi")
.select("*")
.eq("user_id", user.id)
.order("created_at", { ascending: false });

      if (error) {
        alert("Errore caricamento preventivi: " + error.message);
        console.error(error);
      } else {
        setPreventivi(data || []);
      }

      setLoading(false);
    }

    caricaPreventivi();
  }, []);

  const preventiviFiltrati = preventivi.filter((preventivo) => {
    const testo = ricerca.toLowerCase();

    return (
      preventivo.cliente?.toLowerCase().includes(testo) ||
      preventivo.descrizione?.toLowerCase().includes(testo) ||
      preventivo.stato?.toLowerCase().includes(testo)
    );
  });

  function esportaPreventiviExcel() {
    const dati = preventiviFiltrati.map((preventivo) => ({
      Cliente: preventivo.cliente || "",
      Descrizione: preventivo.descrizione || "",
      Imponibile: Number(preventivo.prezzo || 0),
      IVA: `${preventivo.iva || 0}%`,
      Totale: Number(preventivo.totale || 0),
      Stato: preventivo.stato || "Bozza",
      Data: preventivo.created_at
        ? new Date(preventivo.created_at).toLocaleDateString("it-IT")
        : "",
    }));

    const foglio = XLSX.utils.json_to_sheet(dati);
    const file = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(file, foglio, "Preventivi");
    XLSX.writeFile(file, "preventivi.xlsx");
  }

  function classeStato(stato: string | null) {
    if (stato === "Accettato") return "bg-green-100 text-green-700";
    if (stato === "Rifiutato") return "bg-red-100 text-red-700";
    if (stato === "Inviato") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  }

  return (
<main className="min-h-screen bg-white text-gray-900">
  <Navbar />

  <div className="px-6 py-10">      <div className="mx-auto max-w-5xl">

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Preventivi salvati</h1>

            <p className="mt-3 text-gray-600">
              Cerca, apri e gestisci tutti i preventivi creati.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={esportaPreventiviExcel}
              disabled={preventiviFiltrati.length === 0}
              style={{
                backgroundColor:
                  preventiviFiltrati.length === 0 ? "#d1d5db" : "#16a34a",
                color: "white",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "bold",
                border: "none",
                cursor:
                  preventiviFiltrati.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              📊 Esporta Excel
            </button>

            <a
              href="/preventivo"
              className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              Crea nuovo preventivo
            </a>
          </div>
        </div>

        <div className="mt-8">
          <input
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Cerca per cliente, descrizione o stato..."
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <p>Caricamento...</p>
          ) : preventivi.length === 0 ? (
            <p className="rounded-2xl border bg-gray-50 p-6">
              Nessun preventivo salvato.
            </p>
          ) : preventiviFiltrati.length === 0 ? (
            <p className="rounded-2xl border bg-gray-50 p-6">
              Nessun preventivo trovato.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Totale</th>
                    <th className="p-4">Stato</th>
                    <th className="p-4">IVA</th>
                    <th className="p-4">Data</th>
                  </tr>
                </thead>

                <tbody>
                  {preventiviFiltrati.map((preventivo) => (
                    <tr
                      key={preventivo.id}
                      className="cursor-pointer border-t hover:bg-gray-50"
                      onClick={() =>
                        (window.location.href = `/preventivi/${preventivo.id}`)
                      }
                    >
                      <td className="p-4 font-medium">{preventivo.cliente}</td>

                      <td className="p-4">
                        € {Number(preventivo.totale).toFixed(2)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${classeStato(
                            preventivo.stato || "Bozza"
                          )}`}
                        >
                          {preventivo.stato || "Bozza"}
                        </span>
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
      </div>
      </div>
      <Footer />
    </main>
  );
}