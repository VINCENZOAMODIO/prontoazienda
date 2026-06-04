"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";

type Fattura = {
  id: string;
  numero: string;
  cliente_id: string | null;
  cliente: string;
  descrizione: string;
  prezzo: number;
  iva: number;
  totale: number;
  stato: string;
  scadenza: string | null;
  created_at: string;
};

type Cliente = {
  id: string;
  nome: string;
  telefono: string | null;
  email: string | null;
};

type Impostazioni = {
  nome_azienda: string | null;
  email: string | null;
  telefono: string | null;
  indirizzo: string | null;
};

export default function DettaglioFatturaPage() {
  const params = useParams();
  const id = params.id as string;

  const [fattura, setFattura] = useState<Fattura | null>(null);
  const [clienteCollegato, setClienteCollegato] = useState<Cliente | null>(
    null
  );
  const [impostazioni, setImpostazioni] = useState<Impostazioni | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvandoScadenza, setSalvandoScadenza] = useState(false);

  useEffect(() => {
    async function caricaDati() {
      const { data: fatturaData, error: fatturaError } = await supabase
        .from("fatture")
        .select("*")
        .eq("id", id)
        .single();

      if (!fatturaError && fatturaData) {
        setFattura(fatturaData);

        if (fatturaData.cliente_id) {
          const { data: clienteData, error: clienteError } = await supabase
            .from("clienti")
            .select("*")
            .eq("id", fatturaData.cliente_id)
            .single();

          if (!clienteError) {
            setClienteCollegato(clienteData);
          }
        }
      }

      const { data: impostazioniData } = await supabase
        .from("impostazioni")
        .select("*")
        .limit(1)
        .single();

      if (impostazioniData) {
        setImpostazioni(impostazioniData);
      }

      setLoading(false);
    }

    if (id) {
      caricaDati();
    }
  }, [id]);

  function fatturaScaduta() {
    if (!fattura?.scadenza) return false;
    if (fattura.stato === "Pagata" || fattura.stato === "Annullata") {
      return false;
    }

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const dataScadenza = new Date(fattura.scadenza);
    dataScadenza.setHours(0, 0, 0, 0);

    return dataScadenza < oggi;
  }

  async function cambiaStato(stato: string) {
    if (!fattura) return;

    const { error } = await supabase
      .from("fatture")
      .update({ stato })
      .eq("id", fattura.id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setFattura({
      ...fattura,
      stato,
    });
  }

  async function cambiaScadenza(scadenza: string) {
    if (!fattura) return;

    setSalvandoScadenza(true);

    const { error } = await supabase
      .from("fatture")
      .update({
        scadenza: scadenza || null,
      })
      .eq("id", fattura.id);

    setSalvandoScadenza(false);

    if (error) {
      alert("Errore salvataggio scadenza: " + error.message);
      return;
    }

    setFattura({
      ...fattura,
      scadenza: scadenza || null,
    });
  }

  function pulisciNumeroTelefono(numero: string) {
    let pulito = numero.replace(/\D/g, "");

    if (pulito.startsWith("00")) {
      pulito = pulito.slice(2);
    }

    if (pulito.startsWith("0")) {
      pulito = "39" + pulito.slice(1);
    }

    if (!pulito.startsWith("39")) {
      pulito = "39" + pulito;
    }

    return pulito;
  }

  function inviaWhatsApp() {
    if (!fattura) return;

    const testo = `Buongiorno,

le invio la fattura ${fattura.numero} per:

${fattura.descrizione}

Totale: € ${Number(fattura.totale).toFixed(2)}
Scadenza: ${
      fattura.scadenza
        ? new Date(fattura.scadenza).toLocaleDateString("it-IT")
        : "Non indicata"
    }

Stato: ${fattura.stato}

Cordiali saluti.`;

    const telefono = clienteCollegato?.telefono
      ? pulisciNumeroTelefono(clienteCollegato.telefono)
      : "";

    const url = telefono
      ? `https://wa.me/${telefono}?text=${encodeURIComponent(testo)}`
      : `https://wa.me/?text=${encodeURIComponent(testo)}`;

    window.open(url, "_blank");
  }

  function scaricaPDF() {
    if (!fattura) return;

    const nomeAzienda = impostazioni?.nome_azienda || "ProntoAzienda";

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(nomeAzienda, 20, 22);

    doc.setFontSize(10);

    let rigaInfo = 30;

    if (impostazioni?.email) {
      doc.text(`Email: ${impostazioni.email}`, 20, rigaInfo);
      rigaInfo += 6;
    }

    if (impostazioni?.telefono) {
      doc.text(`Tel: ${impostazioni.telefono}`, 20, rigaInfo);
      rigaInfo += 6;
    }

    if (impostazioni?.indirizzo) {
      doc.text(`Indirizzo: ${impostazioni.indirizzo}`, 20, rigaInfo);
    }

    doc.setFontSize(24);
    doc.text(`FATTURA ${fattura.numero}`, 20, 60);

    doc.setFontSize(12);
    doc.text(
      `Data: ${new Date(fattura.created_at).toLocaleDateString("it-IT")}`,
      20,
      72
    );

    doc.text(
      `Scadenza: ${
        fattura.scadenza
          ? new Date(fattura.scadenza).toLocaleDateString("it-IT")
          : "Non indicata"
      }`,
      20,
      82
    );

    doc.text(`Cliente: ${fattura.cliente}`, 20, 94);

    doc.line(20, 104, 190, 104);

    doc.setFontSize(12);
    doc.text("Descrizione:", 20, 118);

    doc.text(fattura.descrizione || "", 20, 128, {
      maxWidth: 160,
    });

    const ivaImporto = Number(fattura.totale) - Number(fattura.prezzo);

    doc.text(
      `Imponibile: € ${Number(fattura.prezzo).toFixed(2)}`,
      20,
      168
    );

    doc.text(`IVA ${fattura.iva}%: € ${ivaImporto.toFixed(2)}`, 20, 178);

    doc.setFontSize(16);
    doc.text(`Totale: € ${Number(fattura.totale).toFixed(2)}`, 20, 194);

    doc.setFontSize(12);
    doc.text(`Stato: ${fattura.stato}`, 20, 212);

    doc.setFontSize(10);
    doc.text("Documento generato con ProntoAzienda", 20, 285);

    doc.save(`${fattura.numero}.pdf`);
  }

  async function eliminaFattura() {
    if (!fattura) return;

    const conferma = confirm(
      "Sei sicuro di voler eliminare questa fattura?"
    );

    if (!conferma) return;

    const { error } = await supabase
      .from("fatture")
      .delete()
      .eq("id", fattura.id);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/fatture";
  }

  function coloreStato(stato: string) {
    if (stato === "Pagata") return "bg-green-100 text-green-700";
    if (stato === "Annullata") return "bg-red-100 text-red-700";
    return "bg-blue-100 text-blue-700";
  }

  if (loading) {
    return <div className="p-10">Caricamento...</div>;
  }

  if (!fattura) {
    return <div className="p-10">Fattura non trovata.</div>;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <a href="/fatture" className="text-blue-600">
          ← Torna alle fatture
        </a>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold">{fattura.numero}</h1>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${coloreStato(
                fattura.stato
              )}`}
            >
              {fattura.stato}
            </span>

            {fatturaScaduta() && (
              <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
                Scaduta
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border p-6">
          <p>
            <strong>Cliente:</strong> {fattura.cliente}
          </p>

          {clienteCollegato?.telefono && (
            <p className="mt-3">
              <strong>Telefono:</strong> {clienteCollegato.telefono}
            </p>
          )}

          <div className="mt-6">
            <label className="text-sm font-semibold text-gray-600">
              Data scadenza
            </label>

            <input
              type="date"
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={fattura.scadenza || ""}
              onChange={(e) => cambiaScadenza(e.target.value)}
            />

            {salvandoScadenza && (
              <p className="mt-2 text-sm text-gray-500">
                Salvataggio scadenza...
              </p>
            )}

            {fatturaScaduta() && (
              <p className="mt-2 text-sm font-semibold text-red-600">
                Questa fattura è scaduta.
              </p>
            )}
          </div>

          <p className="mt-6">
            <strong>Descrizione:</strong>
          </p>

          <p className="mt-2 whitespace-pre-line">{fattura.descrizione}</p>

          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p>Imponibile: € {Number(fattura.prezzo).toFixed(2)}</p>

            <p>IVA: {fattura.iva}%</p>

            <p className="mt-3 text-xl font-bold">
              Totale: € {Number(fattura.totale).toFixed(2)}
            </p>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-gray-600">
              Stato fattura
            </label>

            <select
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={fattura.stato}
              onChange={(e) => cambiaStato(e.target.value)}
            >
              <option value="Emessa">Emessa</option>
              <option value="Pagata">Pagata</option>
              <option value="Annullata">Annullata</option>
            </select>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={scaricaPDF}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              🧾 Scarica PDF fattura
            </button>

            <button
              type="button"
              onClick={inviaWhatsApp}
              style={{
                backgroundColor: "#25D366",
                color: "white",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              📱 Invia fattura su WhatsApp
            </button>

            <button
              type="button"
              onClick={() => cambiaStato("Pagata")}
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              ✅ Segna come pagata
            </button>

            <button
              type="button"
              onClick={eliminaFattura}
              className="w-full rounded-xl border border-red-300 px-6 py-3 font-semibold text-red-600 hover:bg-red-50"
            >
              Elimina fattura
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}