// Importujemy narzędzie do komunikacji z bazą danych Neon
import { Pool } from '@neondatabase/serverless';

export default async (req) => {
  // POPRAWKA: Szukamy teraz prawidłowej nazwy zmiennej: NETLIFY_DATABASE_URL
  if (!process.env.NETLIFY_DATABASE_URL) {
    return new Response(JSON.stringify({ message: "Błąd konfiguracji serwera: brak połączenia z bazą danych." }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  // POPRAWKA: Używamy prawidłowej zmiennej do połączenia
  const pool = new Pool({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    const { code } = await req.json();

    if (!code || code.trim() === '') {
      return new Response(JSON.stringify({ message: "Proszę wpisać kod." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Szukamy kodu w tabeli `codes`
    const { rows: [foundCode] } = await pool.query(
      'SELECT * FROM codes WHERE key = $1',
      [code.toLowerCase()]
    );

    // Jeśli kodu nie ma, zwracamy błąd
    if (!foundCode) {
      return new Response(JSON.stringify({ message: "Podany kod jest nieprawidłowy." }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Jeśli kod istnieje, ale nie ma już użyć
    if (foundCode.uses_left <= 0) {
      return new Response(JSON.stringify({ message: "Ten kod został już wykorzystany." }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // Jeśli wszystko jest ok, zmniejszamy liczbę użyć o 1
    await pool.query(
      'UPDATE codes SET uses_left = uses_left - 1 WHERE id = $1',
      [foundCode.id]
    );

    // Kończymy połączenie i zwracamy sukces
    await pool.end();
    return new Response(JSON.stringify({ valid: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Błąd funkcji:', error);
    return new Response(JSON.stringify({ message: "Wystąpił wewnętrzny błąd serwera." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// Konfiguracja, aby Netlify poprawnie rozpoznało ścieżkę
export const config = {
  path: "/verifyCode"
};