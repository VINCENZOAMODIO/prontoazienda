"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Risultato = {
  tipo: "Cliente" | "Preventivo" | "Fattura";
  titolo: string;
  sottotitolo: string;
  url: string;
};

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [ricerca, setRicerca] = useState("");
  const [risultati, setRisultati] = useState<Risultato[]>([]);
  const [mostraRisultati, setMostraRisultati] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    async function caricaUtente() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
    }

    caricaUtente();
  }, []);

  useEffect(() => {
  const temaSalvato = localStorage.getItem("tema");

  if (temaSalvato === "dark") {
    document.documentElement.classList.add("dark");
    setDarkMode(true);
  }
}, []);

  useEffect(() => {
    async function cerca() {
      if (!userId || ricerca.trim().length < 2) {
        setRisultati([]);
        return;
      }

      const testo = ricerca.trim();

      const { data: clienti } = await supabase
        .from("clienti")
        .select("id, nome, telefono, email")
        .eq("user_id", userId)
        .or(`nome.ilike.%${testo}%,telefono.ilike.%${testo}%,email.ilike.%${testo}%`)
        .limit(3);

      const { data: preventivi } = await supabase
        .from("preventivi")
        .select("id, cliente, descrizione, totale, stato")
        .eq("user_id", userId)
        .or(`cliente.ilike.%${testo}%,descrizione.ilike.%${testo}%,stato.ilike.%${testo}%`)
        .limit(3);

      const { data: fatture } = await supabase
        .from("fatture")
        .select("id, numero, cliente, totale, stato")
        .eq("user_id", userId)
        .or(`numero.ilike.%${testo}%,cliente.ilike.%${testo}%,stato.ilike.%${testo}%`)
        .limit(3);

      const nuoviRisultati: Risultato[] = [
        ...(clienti || []).map((c) => ({
          tipo: "Cliente" as const,
          titolo: c.nome || "Cliente",
          sottotitolo: c.email || c.telefono || "Scheda cliente",
          url: `/clienti/${c.id}`,
        })),
        ...(preventivi || []).map((p) => ({
          tipo: "Preventivo" as const,
          titolo: p.cliente || "Preventivo",
          sottotitolo: `€ ${Number(p.totale || 0).toFixed(2)} · ${p.stato || "Bozza"}`,
          url: `/preventivi/${p.id}`,
        })),
        ...(fatture || []).map((f) => ({
          tipo: "Fattura" as const,
          titolo: f.numero || "Fattura",
          sottotitolo: `${f.cliente || ""} · € ${Number(f.totale || 0).toFixed(2)} · ${f.stato || "Emessa"}`,
          url: `/fatture/${f.id}`,
        })),
      ];

      setRisultati(nuoviRisultati);
      setMostraRisultati(true);
    }

    cerca();
  }, [ricerca, userId]);

  function cambiaTema() {
  const nuovoTema = !darkMode;

  setDarkMode(nuovoTema);

  if (nuovoTema) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("tema", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("tema", "light");
  }
}

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        <a href="/dashboard" className="text-xl font-bold text-gray-900">
          ProntoAzienda
        </a>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔍 Cerca clienti, preventivi o fatture..."
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
            onFocus={() => setMostraRisultati(true)}
            className="w-full rounded-xl border px-4 py-2 text-sm"
          />

          {mostraRisultati && ricerca.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border bg-white shadow-lg">
              {risultati.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  Nessun risultato trovato.
                </div>
              ) : (
                risultati.map((risultato, index) => (
                  <a
                    key={`${risultato.tipo}-${index}`}
                    href={risultato.url}
                    className="block border-b p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {risultato.titolo}
                        </p>
                        <p className="text-sm text-gray-500">
                          {risultato.sottotitolo}
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {risultato.tipo}
                      </span>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}
        </div>

        <nav className="hidden items-center gap-4 text-sm font-medium lg:flex">
          <a href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </a>

          <a href="/clienti" className="hover:text-blue-600">
            Clienti
          </a>

          <a href="/preventivi" className="hover:text-blue-600">
            Preventivi
          </a>

          <a href="/fatture" className="hover:text-blue-600">
            Fatture
          </a>

          <a href="/impostazioni" className="hover:text-blue-600">
            Impostazioni
          </a>

          <a href="/upgrade" className="hover:text-blue-600">
  Upgrade
</a>
        </nav>

        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden max-w-[140px] truncate text-sm text-gray-500 xl:inline">
              {email}
            </span>
          )}

          <button
  type="button"
  onClick={cambiaTema}
  className="rounded-xl border px-3 py-2 font-semibold hover:bg-gray-50"
>
  {darkMode ? "☀️" : "🌙"}
</button>

          <button
            type="button"
            onClick={logout}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              padding: "8px 14px",
              borderRadius: "12px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}