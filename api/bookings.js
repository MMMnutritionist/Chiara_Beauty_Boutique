// /api/bookings.js - API Endpoint per Vercel
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('📡 API Request - Method:', req.method);
    console.log('📡 API Request - URL:', req.url);
    
    if (req.method === 'GET') {
      const { action, serviceId, date, time } = req.query;
      
      if (action === 'getBookings') {
        console.log('📥 Richiesta getBookings');
        
        // Mock data con più prenotazioni di esempio
        const mockBookings = {
          'hydrafacial_2025-08-17_10:00': 1,
          'facial_2025-08-17_14:00': 1,
          'manicure_2025-08-18_16:30': 2,
          'pedicure_2025-08-19_09:30': 1
        };
        
        return res.status(200).json({
          success: true,
          data: { bookings: mockBookings },
          timestamp: new Date().toISOString()
        });
      }
      
      if (action === 'checkAvailability') {
        console.log('🔍 Verifica disponibilità:', { serviceId, date, time });
        
        // Mock availability logic
        const unavailableSlots = [
          'hydrafacial_2025-08-17_10:00',
          'facial_2025-08-17_14:00'
        ];
        
        const key = `${serviceId}_${date}_${time}`;
        const available = !unavailableSlots.includes(key);
        
        return res.status(200).json({
          success: true,
          data: { 
            available,
            key,
            message: available ? 'Slot disponibile' : 'Slot non disponibile'
          }
        });
      }
      
      // Azione GET non riconosciuta
      return res.status(400).json({
        success: false,
        error: 'Azione GET non valida',
        validActions: ['getBookings', 'checkAvailability']
      });
    }
    
    if (req.method === 'POST') {
      console.log('💾 Salvataggio prenotazione');
      console.log('📦 Dati ricevuti:', req.body);
      
      const booking = req.body;
      
      // Validazione dati base
      if (!booking.name || !booking.phone || !booking.serviceId || !booking.date || !booking.time) {
        return res.status(400).json({
          success: false,
          error: 'Dati mancanti',
          required: ['name', 'phone', 'serviceId', 'date', 'time']
        });
      }
      
      // Genera ID prenotazione con timestamp
      const bookingId = `BKG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Mock: simula salvataggio su Google Sheets
      const savedBooking = {
        ...booking,
        bookingId,
        timestamp: new Date().toISOString(),
        status: 'confirmed'
      };
      
      console.log('✅ Prenotazione salvata (MOCK):', savedBooking);
      
      return res.status(200).json({
        success: true,
        data: { 
          bookingId,
          booking: savedBooking,
          message: 'Prenotazione salvata con successo (MOCK)'
        }
      });
    }
    
    // Metodo non supportato
    return res.status(405).json({
      success: false,
      error: `Metodo ${req.method} non supportato`,
      supportedMethods: ['GET', 'POST', 'OPTIONS']
    });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Errore generico',
      timestamp: new Date().toISOString()
    });
  }
}
