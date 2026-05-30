"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: string;
  nome: string;
  telefono: string;
  email: string;
  note: string;
};

export default function ClientiPage() {
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function caricaClienti() {
      const { data, error } = await supabase
        .from("clienti")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setClienti(data || []);
      }

      setLoading(false);
    }

    caricaClienti();
  }, []);

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-blue-600">
          ← Torna alla home
        </a>

        <h1 className="mt-6 text-4xl font-bold">Clienti</h1>

        <div className="mt-8">
          {loading ? (
            <p>Caricamento...</p>
          ) : clienti.length === 0 ? (
            <div className="rounded-2xl border bg-gray-50 p-6">
              Nessun cliente presente.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4">Nome</th>
                    <th className="p-4">Telefono</th>
                    <th className="p-4">Email</th>
                  </tr>
                </thead>

                <tbody>
                  {clienti.map((cliente) => (
                    <tr
                        key={cliente.id}
                        className="cursor-pointer border-t hover:bg-gray-50"
                        onClick={() => (window.location.href = `/clienti/${cliente.id}`)}>
                                                  
                        <td className="p-4">{cliente.nome}</td>
                      <td className="p-4">{cliente.telefono}</td>
                      <td className="p-4">{cliente.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8">
          <a
            href="/clienti/nuovo"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Nuovo cliente
          </a>
        </div>
      </div>
    </main>
  );
}