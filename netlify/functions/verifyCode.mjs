// Importujemy uproszczone narzędzie Netlify do łączenia z bazą Neon
import { neon } from '@netlify/neon';

export default async (req) => {
  try {
    // Łączymy się z bazą - to dzieje się automatycznie
    const sql = neon();

    // Pobieramy kod z "paczki" wysłanej przez stronę
    const { code } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ message: 'Proszę podać kod.' }), { status: 400 });
    }

    // Szukamy kodu w tabeli `codes`
    const [foundCode] = await sql`SELECT * FROM codes WHERE key = ${code.toLowerCase()}`;

    // Jeśli kodu nie ma
    if (!foundCode) {
      return new Response(JSON.stringify({ message: 'Podany kod jest nieprawidłowy.' }), { status: 404 });
    }

    // Jeśli kod został już wykorzystany
    if (foundCode.uses_left <= 0) {
      return new Response(JSON.stringify({ message: 'Ten kod został już wykorzystany.' }), { status: 403 });
    }

    // Jeśli wszystko jest ok, zmniejszamy liczbę użyć o 1
    await sql`UPDATE codes SET uses_left = uses_left - 1 WHERE id = ${foundCode.id}`;

    // Zwracamy sukces
    return new Response(JSON.stringify({ valid: true }), { status: 200 });

  } catch (error) {
    // Obsługa błędów
    console.error('Błąd funkcji:', error);
    // Jeśli błąd to "Unexpected end of JSON input", wiemy, że problem jest w zapytaniu ze strony
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ message: 'Błąd formatu zapytania.' }), { status: 400 });
    }
    return new Response(JSON.stringify({ message: 'Wystąpił wewnętrzny błąd serwera.' }), { status: 500 });
  }
};

// Konfiguracja ścieżki
export const config = {
  path: "/verifyCode"
};