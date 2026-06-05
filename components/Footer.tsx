export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
              <div>
            <p className="font-bold text-gray-800">
              ProntoAzienda
            </p>

            <p className="text-sm text-gray-500">
              Gestionale per professionisti e piccole imprese.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
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
          </div>
        </div>

        <div className="mt-6 border-t pt-4 text-center text-xs text-gray-400">
          © 2026 ProntoAzienda · Versione 1.0
        </div>
      </div>
    </footer>
  );
}