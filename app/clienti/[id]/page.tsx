"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: string;
  nome: string;
  telefono: string;
  email: string;
  note: string;
  created_at: string;
};

export default function DettaglioClientePage() {
  const params = useParams();
  const id = params.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

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
        setCliente(data);
      }

      setLoading(false);
    }

    if (id) caricaCliente();
  }, [id]);

  if (loading) {
    return <div className="p-10">Caricamento...</div>;
  }

  if (!cliente) {
    return <div className="p-10">Cliente non trovato.</div>;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <a href="/clienti" className="text-blue-600">
          ← Torna ai clienti
        </a>

        <h1 className="mt-6 text-4xl font-bold">{cliente.nome}</h1>

        <div className="mt-8 rounded-2xl border p-6">
          <p>
            <strong>Telefono:</strong> {cliente.telefono || "Non inserito"}
          </p>

          <p className="mt-3">
            <strong>Email:</strong> {cliente.email || "Non inserita"}
          </p>

          <p className="mt-3">
            <strong>Note:</strong>
          </p>

          <p className="mt-2 whitespace-pre-line">
            {cliente.note || "Nessuna nota"}
          </p>
        </div>
      </div>
    </main>
  );
}