// /api/bookings.js
export default async function handler(req, res) {
  try {
    const baseUrl = 'https://script.google.com/macros/s/AKfycbwEcn-7d0Z8zCeUfb-ppyWOp6-oQ0-L4C7jOPIPWDCrQFDgIuLO9ysv6Yf9gpl2had7SQ/exec';
    const query = req.url.split('?')[1] || '';
    const scriptUrl = `${baseUrl}${query ? '?' + query : ''}`;

    if (req.method === 'POST') {
      const body = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
      });

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const data = await response.json();
      return res.status(200).json(data);
    }

    const response = await fetch(scriptUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Errore dal Google Script' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
