"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { richiediLogin } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ImpostazioniPage() {
  const [nomeAzienda, setNomeAzienda] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [impostazioniId, setImpostazioniId] = useState<string | null>(null);
  const [loadingLogo, setLoadingLogo] = useState(false);

  useEffect(() => {
    async function caricaImpostazioni() {
      const user = await richiediLogin();

      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("impostazioni")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (data) {
        setImpostazioniId(data.id);
        setNomeAzienda(data.nome_azienda || "");
        setEmail(data.email || "");
        setTelefono(data.telefono || "");
        setIndirizzo(data.indirizzo || "");
        setLogoUrl(data.logo_url || "");
      }
    }

    caricaImpostazioni();
  }, []);

  async function salva() {
    const user = await richiediLogin();

    if (!user) {
      return;
    }

    const payload = {
      user_id: user.id,
      nome_azienda: nomeAzienda,
      email,
      telefono,
      indirizzo,
      logo_url: logoUrl,
    };

    let error = null;

    if (impostazioniId) {
      const result = await supabase
        .from("impostazioni")
        .update(payload)
        .eq("id", impostazioniId)
        .eq("user_id", user.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("impostazioni")
        .insert([payload])
        .select()
        .single();

      error = result.error;

      if (result.data) {
        setImpostazioniId(result.data.id);
      }
    }

    if (error) {
      alert(error.message);
      return;
    }

    alert("Impostazioni salvate");
  }

  async function caricaLogo(file: File | null) {
    if (!file) return;

    const user = await richiediLogin();

    if (!user) {
      return;
    }

    setLoadingLogo(true);

    const estensione = file.name.split(".").pop();
    const nomeFile = `${user.id}/logo-${Date.now()}.${estensione}`;

    const { error: uploadError } = await supabase.storage
      .from("loghi")
      .upload(nomeFile, file, {
        upsert: true,
      });

    if (uploadError) {
      setLoadingLogo(false);
      alert("Errore caricamento logo: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("loghi").getPublicUrl(nomeFile);

    const nuovoLogoUrl = data.publicUrl;

    setLogoUrl(nuovoLogoUrl);
    setLoadingLogo(false);
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Navbar />

      <div className="px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Impostazioni azienda
          </h1>

          <p className="mt-3 text-gray-600">
            Inserisci i dati che userai nei documenti, nei preventivi e nelle
            fatture.
          </p>

          <div className="mt-8 rounded-2xl border bg-white p-6">
            <div className="grid gap-4">
              <div className="rounded-2xl border bg-gray-50 p-5">
                <p className="font-semibold text-gray-800">Logo aziendale</p>
                <p className="mt-1 text-sm text-gray-500">
                  Carica il logo che verrà usato nei PDF.
                </p>

                {logoUrl && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-gray-600">
                      Anteprima logo
                    </p>

                    <img
                      src={logoUrl}
                      alt="Logo aziendale"
                      className="h-24 w-24 rounded-xl border bg-white object-contain p-2"
                    />
                  </div>
                )}

                <input
                  className="mt-4 w-full rounded-xl border bg-white px-4 py-3 text-gray-900"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => caricaLogo(e.target.files?.[0] || null)}
                />

                {loadingLogo && (
                  <p className="mt-2 text-sm text-gray-500">
                    Caricamento logo...
                  </p>
                )}
              </div>

              <input
                className="rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400"
                placeholder="Nome azienda"
                value={nomeAzienda}
                onChange={(e) => setNomeAzienda(e.target.value)}
              />

              <input
                className="rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400"
                placeholder="Telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />

              <input
                className="rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400"
                placeholder="Indirizzo"
                value={indirizzo}
                onChange={(e) => setIndirizzo(e.target.value)}
              />

              <button
                type="button"
                onClick={salva}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Salva impostazioni
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}