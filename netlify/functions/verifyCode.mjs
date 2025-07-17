// PLIK: netlify/functions/verifyCode.mjs (WERSJA TESTOWA)

export default async (req) => {
  // Ta funkcja ignoruje wszystko i zawsze zwraca sukces.
  // Służy tylko do sprawdzenia, czy połączenie między stroną a serwerem działa.
  return new Response(JSON.stringify({ 
    valid: true, 
    message: "Test 'Hello World' udany!" 
  }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};