"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ModificaClientePage() {
  const params = useParams();
  const id = params.id as string;

  const [nome, setNome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function caricaCliente() {
      const { data, error } = await supabase
        .from("clienti")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Errore caricamento cliente: " + error.message);
      } else {
        setNome(data.nome || "");
        setTelefono(data.telefono || "");
        setEmail(data.email || "");
        setNote(data.note || "");
      }

      setLoading(false);
    }

    if (id) caricaCliente();
  }, [id]);

  async function salvaModifiche() {
    if (!nome) {
      alert("Il nome è obbligatorio.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase
      .from("clienti")
      .update({
        nome,
        telefono,
        email,
        note,
      })
      .eq("id", id);

    setSalvando(false);

    if (error) {
      alert("Errore salvataggio: " + error.message);
      return;
    }

    window.location.href = `/clienti/${id}`;
  }

  if (loading) {
    return <div className="p-10">Caricamento...</div>;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <a href={`/clienti/${id}`} className="text-blue-600">
          ← Torna al cliente
        </a>

        <h1 className="mt-6 text-4xl font-bold">Modifica cliente</h1>

        <div className="mt-8 grid gap-4 rounded-2xl border bg-gray-50 p-6">
          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Nome cliente"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <textarea
            className="min-h-32 rounded-xl border px-4 py-3"
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
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