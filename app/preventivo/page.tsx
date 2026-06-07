"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import { supabase } from "@/lib/supabase";
import { richiediLogin } from "@/lib/auth";

type Cliente = {
  id: string;
  nome: string;
  telefono: string;
  email: string;
};

type Impostazioni = {
  nome_azienda: string | null;
  email: string | null;
  telefono: string | null;
  indirizzo: string | null;
  logo_url: string | null;
};

function PreventivoContent() {
  const searchParams = useSearchParams();
  const clienteIdUrl = searchParams.get("clienteId");

  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [impostazioni, setImpostazioni] = useState<Impostazioni | null>(null);

  const [clienteId, setClienteId] = useState("");
  const [cliente, setCliente] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [iva, setIva] = useState("22");

  const imponibile = Number(prezzo) || 0;
  const ivaNumero = Number(iva) || 0;
  const totaleIva = imponibile * (ivaNumero / 100);
  const totale = imponibile + totaleIva;

  useEffect(() => {
    async function caricaDati() {

      const user = await richiediLogin();

if (!user) {
  return;
}
const { data: clientiData, error: clientiError } = await supabase
  .from("clienti")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

      if (!clientiError) {
        const clientiCaricati = clientiData || [];
        setClienti(clientiCaricati);

        if (clienteIdUrl) {
          const clienteSelezionato = clientiCaricati.find(
            (c) => c.id === clienteIdUrl
          );

          if (clienteSelezionato) {
            setClienteId(clienteSelezionato.id);
            setCliente(clienteSelezionato.nome);
          }
        }
      }

const { data: impostazioniData } = await supabase
  .from("impostazioni")
  .select("*")
  .eq("user_id", user.id)
  .limit(1)
  .single();

      if (impostazioniData) {
        setImpostazioni(impostazioniData);
      }
    }

    caricaDati();
  }, [clienteIdUrl]);

  function selezionaCliente(id: string) {
    setClienteId(id);

    const clienteSelezionato = clienti.find((c) => c.id === id);

    if (clienteSelezionato) {
      setCliente(clienteSelezionato.nome);
    }
  }

  async function scaricaPDF() {

    const user = await richiediLogin();

if (!user) {
  return;
}

const anno = new Date().getFullYear();

const { count } = await supabase
  .from("preventivi")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id)
  .gte("created_at", `${anno}-01-01`)
  .lt("created_at", `${anno + 1}-01-01`);

const prossimoNumero = (count || 0) + 1;
const numeroPreventivo = `PREV-${anno}-${String(prossimoNumero).padStart(
  3,
  "0"
)}`;
    const nomeAzienda = impostazioni?.nome_azienda || "ProntoAzienda";

    const logoUrl = impostazioni?.logo_url || null;
const doc = new jsPDF();

if (logoUrl) {
  try {
    doc.addImage(logoUrl, "PNG", 20, 15, 38, 28);
  } catch (error) {
    console.error("Errore inserimento logo PDF:", error);
  }
}

doc.setFontSize(20);
doc.text(nomeAzienda, logoUrl ? 65 : 20, 22);

    doc.setFontSize(10);

    let rigaInfo = 30;

    if (impostazioni?.email) {
      doc.text(`Email: ${impostazioni.email}`, logoUrl ? 65 : 20, rigaInfo);
      rigaInfo += 6;
    }

    if (impostazioni?.telefono) {
      doc.text(`Tel: ${impostazioni.telefono}`, logoUrl ? 65 : 20, rigaInfo);
      rigaInfo += 6;
    }

    if (impostazioni?.indirizzo) {
      doc.text(
        `Indirizzo: ${impostazioni.indirizzo}`,
        logoUrl ? 65 : 20,
        rigaInfo
      );
    }

    doc.setFontSize(22);
    doc.text(`Preventivo ${numeroPreventivo}`, 20, 60);

    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente || "Nome cliente"}`, 20, 74);

    doc.line(20, 84, 190, 84);

    doc.setFontSize(12);
    doc.text("Descrizione lavoro:", 20, 98);
    doc.text(descrizione || "Descrizione del lavoro da svolgere", 20, 108, {
      maxWidth: 160,
    });

    doc.text(`Imponibile: € ${imponibile.toFixed(2)}`, 20, 148);
    doc.text(`IVA ${ivaNumero}%: € ${totaleIva.toFixed(2)}`, 20, 158);

    doc.setFontSize(16);
    doc.text(`Totale: € ${totale.toFixed(2)}`, 20, 174);

    doc.setFontSize(10);
    doc.text("Documento generato con ProntoAzienda", 20, 285);

    const { error } = await supabase.from("preventivi").insert([
      {
        user_id: user.id,
        numero: numeroPreventivo,
        cliente: cliente || "Nome cliente",
        cliente_id: clienteId || null,
        descrizione: descrizione || "Descrizione del lavoro da svolgere",
        prezzo: imponibile,
        iva: ivaNumero,
        totale: totale,
        stato: "Bozza",
      },
    ]);

    if (error) {
      alert("Errore salvataggio preventivo: " + error.message);
      console.error(error);
      return;
    }

    doc.save(`${numeroPreventivo}-${cliente || "cliente"}.pdf`);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-sm font-medium text-blue-600">
          ← Torna alla home
        </a>

        <h1 className="mt-8 text-4xl font-bold">Crea un preventivo</h1>

        <p className="mt-3 text-gray-600">
          Compila i dati e genera un preventivo professionale da inviare al
          cliente.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border bg-gray-50 p-6">
            <h2 className="text-xl font-bold">Dati preventivo</h2>

            <div className="mt-6 grid gap-4">
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-semibold text-gray-600">Azienda</p>
                <p className="mt-1 font-medium">
                  {impostazioni?.nome_azienda || "ProntoAzienda"}
                </p>
                <a
                  href="/impostazioni"
                  className="mt-2 inline-block text-sm text-blue-600"
                >
                  Modifica impostazioni azienda
                </a>
              </div>

              <select
                className="rounded-xl border px-4 py-3"
                value={clienteId}
                onChange={(e) => selezionaCliente(e.target.value)}
              >
                <option value="">Scegli cliente salvato</option>
                {clienti.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>

              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Oppure scrivi nome cliente"
                value={cliente}
                onChange={(e) => {
                  setCliente(e.target.value);
                  setClienteId("");
                }}
              />

              <textarea
                className="min-h-32 rounded-xl border px-4 py-3"
                placeholder="Descrizione lavoro"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
              />

              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Prezzo senza IVA"
                type="number"
                value={prezzo}
                onChange={(e) => setPrezzo(e.target.value)}
              />

              <input
                className="rounded-xl border px-4 py-3"
                placeholder="IVA %"
                type="number"
                value={iva}
                onChange={(e) => setIva(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold">Preventivo</h2>
                <p className="text-sm text-gray-500">
                  Generato con{" "}
                  {impostazioni?.nome_azienda || "ProntoAzienda"}
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                Bozza
              </span>
            </div>

            <div className="mt-6 space-y-5">
{impostazioni?.logo_url && (
  <div>
    <p className="text-sm font-medium text-gray-500">Logo</p>
    <img
      src={impostazioni.logo_url}
      alt="Logo azienda"
      className="mt-2 h-16 w-16 rounded-xl border object-contain"
    />
  </div>
)}

              <div>
                <p className="text-sm font-medium text-gray-500">Cliente</p>
                <p className="text-lg font-semibold">
                  {cliente || "Nome cliente"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Descrizione lavoro
                </p>
                <p className="whitespace-pre-line">
                  {descrizione || "Descrizione del lavoro da svolgere"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex justify-between">
                  <span>Imponibile</span>
                  <strong>€ {imponibile.toFixed(2)}</strong>
                </div>

                <div className="mt-2 flex justify-between">
                  <span>IVA {ivaNumero}%</span>
                  <strong>€ {totaleIva.toFixed(2)}</strong>
                </div>

                <div className="mt-4 flex justify-between border-t pt-4 text-xl">
                  <span>Totale</span>
                  <strong>€ {totale.toFixed(2)}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={scaricaPDF}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Scarica PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PreventivoPage() {
  return (
    <Suspense fallback={<div className="p-10">Caricamento...</div>}>
      <PreventivoContent />
    </Suspense>
  );
}