"use client";

import { richiediLogin } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Cliente = {
  id: string;
  nome: string;
  telefono: string;
  email: string;
  note: string;
};

export default function ClientiPage() {
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [ricerca, setRicerca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function caricaClienti() {

      const user = await richiediLogin();

if (!user) {
  return;
}
      const { data, error } = await supabase
.from("clienti")
.select("*")
.eq("user_id", user.id)
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

  const clientiFiltrati = clienti.filter((cliente) => {
    const testo = ricerca.toLowerCase();

    return (
      cliente.nome?.toLowerCase().includes(testo) ||
      cliente.telefono?.toLowerCase().includes(testo) ||
      cliente.email?.toLowerCase().includes(testo)
    );
  });

  function esportaClientiExcel() {
    const dati = clientiFiltrati.map((cliente) => ({
      Nome: cliente.nome || "",
      Telefono: cliente.telefono || "",
      Email: cliente.email || "",
      Note: cliente.note || "",
    }));

    const foglio = XLSX.utils.json_to_sheet(dati);
    const file = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(file, foglio, "Clienti");
    XLSX.writeFile(file, "clienti.xlsx");
  }

  return (
<main className="min-h-screen bg-white text-gray-900">
  <Navbar />

  <div className="px-6 py-10">      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-blue-600">
          ← Torna alla home
        </a>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Clienti</h1>
            <p className="mt-2 text-gray-600">
              Cerca e gestisci i tuoi clienti.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
 <button
  type="button"
  onClick={esportaClientiExcel}
  disabled={clientiFiltrati.length === 0}
  style={{
    backgroundColor: clientiFiltrati.length === 0 ? "#d1d5db" : "#16a34a",
    color: "white",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "bold",
    border: "none",
    cursor: clientiFiltrati.length === 0 ? "not-allowed" : "pointer",
  }}
>
  📊 Esporta Excel
</button>

            <a
              href="/clienti/nuovo"
              className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              Nuovo cliente
            </a>
          </div>
        </div>

        <div className="mt-8">
          <input
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Cerca cliente per nome, telefono o email..."
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <p>Caricamento...</p>
          ) : clienti.length === 0 ? (
            <div className="rounded-2xl border bg-gray-50 p-6">
              Nessun cliente presente.
            </div>
          ) : clientiFiltrati.length === 0 ? (
            <div className="rounded-2xl border bg-gray-50 p-6">
              Nessun cliente trovato.
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
                  {clientiFiltrati.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="cursor-pointer border-t hover:bg-gray-50"
                      onClick={() =>
                        (window.location.href = `/clienti/${cliente.id}`)
                      }
                    >
                      <td className="p-4 font-medium">{cliente.nome}</td>
                      <td className="p-4">{cliente.telefono}</td>
                      <td className="p-4">{cliente.email}</td>
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