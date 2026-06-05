"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function caricaUtente() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setEmail(session?.user?.email ?? null);
    }

    caricaUtente();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a href="/dashboard" className="text-xl font-bold text-gray-900">
          ProntoAzienda
        </a>

        <nav className="flex items-center gap-4 text-sm font-medium">
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
        </nav>

        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden max-w-[180px] truncate text-sm text-gray-500 md:inline">
              {email}
            </span>
          )}

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