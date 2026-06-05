"use client";

import { richiediLogin } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Fattura = {
  id: string;
  numero: string | null;
  cliente: string;
  totale: number;
  stato: string | null;
  scadenza: string | null;
  created_at: string;
};

export default function FatturePage() {
  const [fatture, setFatture] = useState<Fattura[]>([]);
  const [ricerca, setRicerca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function caricaFatture() {

        const user = await richiediLogin();

if (!user) {
  return;
}
      const { data, error } = await supabase
.from("fatture")
.select("*")
.eq("user_id", user.id)
.order("created_at", { ascending: false });

      if (error) {
        alert("Errore caricamento fatture: " + error.message);
        console.error(error);
      } else {
        setFatture(data || []);
      }

      setLoading(false);
    }

    caricaFatture();
  }, []);

  function fatturaScaduta(fattura: Fattura) {
    if (!fattura.scadenza) return false;
    if (fattura.stato === "Pagata" || fattura.stato === "Annullata") {
      return false;
    }

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const dataScadenza = new Date(fattura.scadenza);
    dataScadenza.setHours(0, 0, 0, 0);

    return dataScadenza < oggi;
  }

  const fattureFiltrate = fatture.filter((fattura) => {
    const testo = ricerca.toLowerCase();

    return (
      fattura.numero?.toLowerCase().includes(testo) ||
      fattura.cliente?.toLowerCase().includes(testo) ||
      fattura.stato?.toLowerCase().includes(testo) ||
      (fatturaScaduta(fattura) && "scaduta".includes(testo))
    );
  });

  function esportaFattureExcel() {
    const dati = fattureFiltrate.map((fattura) => ({
      Numero: fattura.numero || "",
      Cliente: fattura.cliente || "",
      Totale: Number(fattura.totale || 0),
      Scadenza: fattura.scadenza
        ? new Date(fattura.scadenza).toLocaleDateString("it-IT")
        : "Non indicata",
      Stato: testoStato(fattura),
      Data: fattura.created_at
        ? new Date(fattura.created_at).toLocaleDateString("it-IT")
        : "",
    }));

    const foglio = XLSX.utils.json_to_sheet(dati);
    const file = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(file, foglio, "Fatture");
    XLSX.writeFile(file, "fatture.xlsx");
  }

  function classeStato(fattura: Fattura) {
    if (fatturaScaduta(fattura)) return "bg-red-100 text-red-700";
    if (fattura.stato === "Pagata") return "bg-green-100 text-green-700";
    if (fattura.stato === "Annullata") return "bg-gray-100 text-gray-700";
    return "bg-blue-100 text-blue-700";
  }

  function testoStato(fattura: Fattura) {
    if (fatturaScaduta(fattura)) return "Scaduta";
    return fattura.stato || "Emessa";
  }

  function testoScadenza(scadenza: string | null) {
    if (!scadenza) return "Non indicata";

    return new Date(scadenza).toLocaleDateString("it-IT");
  }

  return (
<main className="min-h-screen bg-white text-gray-900">
  <Navbar />

  <div className="px-6 py-10">
          <div className="mx-auto max-w-6xl">


        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Fatture</h1>

            <p className="mt-2 text-gray-600">
              Elenco di tutte le fatture emesse.
            </p>
          </div>

          <button
            type="button"
            onClick={esportaFattureExcel}
            disabled={fattureFiltrate.length === 0}
            style={{
              backgroundColor:
                fattureFiltrate.length === 0 ? "#d1d5db" : "#16a34a",
              color: "white",
              padding: "12px 24px",
              borderRadius: "12px",
              fontWeight: "bold",
              border: "none",
              cursor: fattureFiltrate.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            📊 Esporta Excel
          </button>
        </div>

        <div className="mt-8">
          <input
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Cerca numero, cliente, stato o scaduta..."
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <p>Caricamento...</p>
          ) : fatture.length === 0 ? (
            <div className="rounded-2xl border bg-gray-50 p-6">
              Nessuna fattura presente.
            </div>
          ) : fattureFiltrate.length === 0 ? (
            <div className="rounded-2xl border bg-gray-50 p-6">
              Nessuna fattura trovata.
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
                    <th className="p-4">Stato</th>
                    <th className="p-4">Data</th>
                  </tr>
                </thead>

                <tbody>
                  {fattureFiltrate.map((fattura) => (
                    <tr
                      key={fattura.id}
                      className="cursor-pointer border-t hover:bg-gray-50"
                      onClick={() =>
                        (window.location.href = `/fatture/${fattura.id}`)
                      }
                    >
                      <td className="p-4">
                        <span className="rounded-lg bg-gray-100 px-2 py-1 font-mono text-sm">
                          {fattura.numero || "-"}
                        </span>
                      </td>

                      <td className="p-4 font-medium">{fattura.cliente}</td>

                      <td className="p-4">
                        € {Number(fattura.totale).toFixed(2)}
                      </td>

                      <td className="p-4">
                        {testoScadenza(fattura.scadenza)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${classeStato(
                            fattura
                          )}`}
                        >
                          {testoStato(fattura)}
                        </span>
                      </td>

                      <td className="p-4">
                        {new Date(fattura.created_at).toLocaleDateString(
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