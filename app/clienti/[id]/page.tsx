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

type Preventivo = {
  id: string;
  cliente: string;
  descrizione: string;
  prezzo: number;
  iva: number;
  totale: number;
  created_at: string;
};

export default function DettaglioClientePage() {
  const params = useParams();
  const id = params.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function caricaDatiCliente() {
      const { data: clienteData, error: clienteError } = await supabase
        .from("clienti")
        .select("*")
        .eq("id", id)
        .single();

      if (clienteError) {
        alert("Errore caricamento cliente: " + clienteError.message);
        setLoading(false);
        return;
      }

      setCliente(clienteData);

      const { data: preventiviData, error: preventiviError } = await supabase
        .from("preventivi")
        .select("*")
        .eq("cliente_id", id)
        .order("created_at", { ascending: false });

      if (preventiviError) {
        alert("Errore caricamento preventivi: " + preventiviError.message);
      } else {
        setPreventivi(preventiviData || []);
      }

      setLoading(false);
    }

    if (id) caricaDatiCliente();
  }, [id]);

  if (loading) {
    return <div className="p-10">Caricamento...</div>;
  }

  if (!cliente) {
    return <div className="p-10">Cliente non trovato.</div>;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-4xl">
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

        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Preventivi del cliente</h2>

            <a
              href="/preventivo"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Nuovo preventivo
            </a>
          </div>

          {preventivi.length === 0 ? (
            <div className="mt-4 rounded-2xl border bg-gray-50 p-6">
              Nessun preventivo collegato a questo cliente.
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4">Descrizione</th>
                    <th className="p-4">Totale</th>
                    <th className="p-4">Data</th>
                  </tr>
                </thead>

                <tbody>
                  {preventivi.map((preventivo) => (
                    <tr
                      key={preventivo.id}
                      className="cursor-pointer border-t hover:bg-gray-50"
                      onClick={() =>
                        (window.location.href = `/preventivi/${preventivo.id}`)
                      }
                    >
                      <td className="p-4 font-medium">
                        {preventivo.descrizione}
                      </td>
                      <td className="p-4">
                        € {Number(preventivo.totale).toFixed(2)}
                      </td>
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
    </main>
  );
}