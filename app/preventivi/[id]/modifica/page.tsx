"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ModificaPreventivo() {
  const params = useParams();
  const id = params.id as string;

  const [cliente, setCliente] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [iva, setIva] = useState("22");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function caricaPreventivo() {
      const { data, error } = await supabase
        .from("preventivi")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Errore caricamento: " + error.message);
      } else {
        setCliente(data.cliente);
        setDescrizione(data.descrizione);
        setPrezzo(String(data.prezzo));
        setIva(String(data.iva));
      }

      setLoading(false);
    }

    if (id) caricaPreventivo();
  }, [id]);

  async function salvaModifiche() {
    const imponibile = Number(prezzo) || 0;
    const ivaNumero = Number(iva) || 0;
    const totale = imponibile + imponibile * (ivaNumero / 100);

    setSalvando(true);

    const { error } = await supabase
      .from("preventivi")
      .update({
        cliente,
        descrizione,
        prezzo: imponibile,
        iva: ivaNumero,
        totale,
      })
      .eq("id", id);

    setSalvando(false);

    if (error) {
      alert("Errore salvataggio: " + error.message);
      return;
    }

    window.location.href = `/preventivi/${id}`;
  }

  if (loading) {
    return <div className="p-10">Caricamento...</div>;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <a href={`/preventivi/${id}`} className="text-blue-600">
          ← Torna al preventivo
        </a>

        <h1 className="mt-6 text-4xl font-bold">Modifica preventivo</h1>

        <div className="mt-8 grid gap-4 rounded-2xl border bg-gray-50 p-6">
          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Nome cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
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

          <button
            type="button"
            onClick={salvaModifiche}
            disabled={salvando}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {salvando ? "Salvataggio..." : "Salva modifiche"}
          </button>
        </div>
      </div>
    </main>
  );
}