// /api/bookings.js
export default async function handler(req, res) {
  // ✅ CORS headers per evitare problemi di cross-origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Gestione preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const baseUrl = 'https://script.google.com/macros/s/AKfycbwEcn-7d0Z8zCeUfb-ppyWOp6-oQ0-L4C7jOPIPWDCrQFDgIuLO9ysv6Yf9gpl2had7SQ/exec';
    
    console.log('📡 Request method:', req.method);
    console.log('📡 Request URL:', req.url);

    if (req.method === 'POST') {
      // ✅ Gestione corretta del body per POST
      let body;
      
      if (typeof req.body === 'string') {
        body = req.body;
      } else if (req.body && typeof req.body === 'object') {
        body = JSON.stringify(req.body);
      } else {
        // ✅ Fallback per leggere il body manualmente
        body = await new Promise((resolve) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => resolve(data));
        });
      }

      console.log('📤 Sending POST to Google Script with body:', body);

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: body
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google Script POST error:', response.status, errorText);
        return res.status(response.status).json({ 
          success: false,
          error: 'Errore dal Google Script', 
          details: errorText,
          status: response.status
        });
      }

      const data = await response.json();
      console.log('✅ Google Script POST response:', data);
      return res.status(200).json(data);
    }

    // ✅ Gestione GET con query parameters corretta
    if (req.method === 'GET') {
      // Estrai i query parameters dall'URL
      const url = new URL(req.url, `https://${req.headers.host}`);
      const queryString = url.search; // Include il '?' se presente
      const scriptUrl = `${baseUrl}${queryString}`;
      
      console.log('📤 Sending GET to Google Script:', scriptUrl);

      const response = await fetch(scriptUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google Script GET error:', response.status, errorText);
        return res.status(response.status).json({ 
          success: false,
          error: 'Errore dal Google Script', 
          details: errorText,
          status: response.status
        });
      }

      const data = await response.json();
      console.log('✅ Google Script GET response:', data);
      return res.status(200).json(data);
    }

    // ✅ Metodo non supportato
    return res.status(405).json({ 
      success: false,
      error: 'Metodo non supportato', 
      method: req.method 
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
