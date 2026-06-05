"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { richiediLogin } from "@/lib/auth";
import jsPDF from "jspdf";

type Preventivo = {
  id: string;
  user_id: string;
  cliente: string;
  cliente_id: string | null;
  descrizione: string;
  prezzo: number;
  iva: number;
  totale: number;
  stato: string;
  created_at: string;
};

type Cliente = {
  id: string;
  nome: string;
  telefono: string | null;
  email: string | null;
};

export default function DettaglioPreventivo() {
  const params = useParams();
  const id = params.id as string;

  const [preventivo, setPreventivo] = useState<Preventivo | null>(null);
  const [clienteCollegato, setClienteCollegato] = useState<Cliente | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState("");
  const [salvandoStato, setSalvandoStato] = useState(false);

  useEffect(() => {
    async function caricaPreventivo() {
  const user = await richiediLogin();

  if (!user) {
    return;
  }

  const { data, error } = await supabase
    .from("preventivi")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

      if (error) {
        console.error(error);
        setErrore(error.message);
        setLoading(false);
        return;
      }

      setPreventivo(data);

      if (data.cliente_id) {
        const { data: clienteData, error: clienteError } = await supabase
        .from("clienti")
        .select("*")
        .eq("id", data.cliente_id)
        .eq("user_id", user.id)
        .single();

        if (!clienteError) {
          setClienteCollegato(clienteData);
        }
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
    if (!preventivo) return;

    const testo = `Buongiorno,

Le invio il preventivo per:

${preventivo.descrizione}

Totale: € ${Number(preventivo.totale).toFixed(2)}

Cordiali saluti.`;

    const telefono = clienteCollegato?.telefono
      ? pulisciNumeroTelefono(clienteCollegato.telefono)
      : "";

    const url = telefono
      ? `https://wa.me/${telefono}?text=${encodeURIComponent(testo)}`
      : `https://wa.me/?text=${encodeURIComponent(testo)}`;

    window.open(url, "_blank");
  }

  async function cambiaStato(nuovoStato: string) {
    if (!preventivo) return;

    setSalvandoStato(true);

    const { error } = await supabase
      .from("preventivi")
      .update({ stato: nuovoStato })
      .eq("id", preventivo.id)
      .eq("user_id", preventivo.user_id);

    setSalvandoStato(false);

    if (error) {
      alert("Errore aggiornamento stato: " + error.message);
      return;
    }

    setPreventivo({
      ...preventivo,
      stato: nuovoStato,
    });
  }

  async function duplicaPreventivo() {
  if (!preventivo) return;

  const { data, error } = await supabase
    .from("preventivi")
    .insert([
      {
        
        user_id: preventivo.user_id,
        cliente: preventivo.cliente,
        cliente_id: preventivo.cliente_id,
        descrizione: preventivo.descrizione,
        prezzo: preventivo.prezzo,
        iva: preventivo.iva,
        totale: preventivo.totale,
        stato: "Bozza",
      },
    ])
    .select()
    .single();

  if (error) {
    alert("Errore duplicazione: " + error.message);
    return;
  }

  window.location.href = `/preventivi/${data.id}`;
}
async function generaNumeroFattura(userId: string) {
  const anno = new Date().getFullYear();

  const { count, error } = await supabase
    .from("fatture")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${anno}-01-01`)
    .lt("created_at", `${anno + 1}-01-01`);

  if (error) {
    throw error;
  }

  const progressivo = String((count || 0) + 1).padStart(3, "0");

  return `FAT-${anno}-${progressivo}`;
}

async function convertiInFattura() {
  if (!preventivo) return;

  try {
const user = await richiediLogin();

if (!user) {
  return;
}

const numeroFattura = await generaNumeroFattura(user.id);
    const { data, error } = await supabase
      .from("fatture")
      .insert([
        {
          user_id: user.id,
          numero: numeroFattura,
          preventivo_id: preventivo.id,
          cliente_id: preventivo.cliente_id,
          cliente: preventivo.cliente,
          descrizione: preventivo.descrizione,
          prezzo: preventivo.prezzo,
          iva: preventivo.iva,
          totale: preventivo.totale,
          stato: "Emessa",
        },
      ])
      .select()
      .single();

    if (error) {
      alert("Errore conversione in fattura: " + error.message);
      return;
    }

    alert(`Preventivo convertito nella fattura ${numeroFattura}`);

    window.location.href = `/fatture/${data.id}`;
  } catch (error: any) {
    alert("Errore generazione numero fattura: " + error.message);
  }
}

  async function eliminaPreventivo() {
    const conferma = confirm(
      "Sei sicuro di voler eliminare questo preventivo?"
    );

    if (!conferma || !preventivo) return;

    const { error } = await supabase
      .from("preventivi")
      .delete()
      .eq("id", preventivo.id)
      .eq("user_id", preventivo.user_id);

    if (error) {
      alert("Errore eliminazione: " + error.message);
      return;
    }

    window.location.href = "/preventivi";
  }

  function coloreStato(stato: string) {
    if (stato === "Accettato") return "bg-green-50 text-green-700";
    if (stato === "Rifiutato") return "bg-red-50 text-red-700";
    if (stato === "Inviato") return "bg-yellow-50 text-yellow-700";
    return "bg-gray-50 text-gray-700";
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

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold">Preventivo</h1>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${coloreStato(
              preventivo.stato || "Bozza"
            )}`}
          >
            {preventivo.stato || "Bozza"}
          </span>
        </div>

        <div className="mt-8 rounded-2xl border p-6">
          <p>
            <strong>Cliente:</strong> {preventivo.cliente}
          </p>

          {clienteCollegato?.telefono && (
            <p className="mt-3">
              <strong>Telefono:</strong> {clienteCollegato.telefono}
            </p>
          )}

          <div className="mt-6">
            <label className="text-sm font-semibold text-gray-600">
              Stato preventivo
            </label>

            <select
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={preventivo.stato || "Bozza"}
              onChange={(e) => cambiaStato(e.target.value)}
            >
              <option value="Bozza">Bozza</option>
              <option value="Inviato">Inviato</option>
              <option value="Accettato">Accettato</option>
              <option value="Rifiutato">Rifiutato</option>
            </select>

            {salvandoStato && (
              <p className="mt-2 text-sm text-gray-500">Salvataggio stato...</p>
            )}
          </div>

          <p className="mt-6">
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

            <button
              type="button"
              onClick={inviaWhatsApp}
              style={{
                backgroundColor: "#25D366",
                color: "white",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              📱 Invia su WhatsApp
            </button>

            <button
  type="button"
onClick={convertiInFattura}
  style={{
    backgroundColor: "#f97316",
    color: "white",
    padding: "12px",
    borderRadius: "12px",
    fontWeight: "bold",
    width: "100%",
  }}
>
  🧾 Converti in fattura
</button>

            <button
  type="button"
  onClick={duplicaPreventivo}
  className="w-full rounded-xl border border-blue-300 px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50"
>
  📄 Duplica preventivo
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