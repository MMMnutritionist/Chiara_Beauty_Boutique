// /api/bookings.js - VERSIONE MOCK TEMPORANEA
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🧪 MOCK API - Method:', req.method);
    console.log('🧪 MOCK API - URL:', req.url);

    if (req.method === 'GET') {
      const url = new URL(req.url, `https://${req.headers.host}`);
      const action = url.searchParams.get('action');
      
      if (action === 'getBookings') {
        // Mock data - prenotazioni simulate
        const mockBookings = {
          'hydrafacial_2025-08-17_10:00': 1,
          'facial_2025-08-17_14:00': 1
        };
        
        return res.status(200).json({
          success: true,
          data: { bookings: mockBookings }
        });
      }
      
      if (action === 'checkAvailability') {
        const serviceId = url.searchParams.get('serviceId');
        const date = url.searchParams.get('date');
        const time = url.searchParams.get('time');
        
        // Mock availability - sempre disponibile tranne alcuni slot
        const unavailableSlots = ['hydrafacial_2025-08-17_10:00'];
        const key = `${serviceId}_${date}_${time}`;
        const available = !unavailableSlots.includes(key);
        
        return res.status(200).json({
          success: true,
          data: { available }
        });
      }
    }

    if (req.method === 'POST') {
      const booking = req.body;
      const mockBookingId = 'MOCK-BKG-' + Date.now();
      
      console.log('🧪 MOCK BOOKING SAVED:', booking);
      
      return res.status(200).json({
        success: true,
        data: { bookingId: mockBookingId }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Azione non valida'
    });

  } catch (error) {
    console.error('❌ MOCK API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message
    });
  }
}
