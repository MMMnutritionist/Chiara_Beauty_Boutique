
// ✅ Tutte le richieste vanno ora al proxy su Vercel
const GOOGLE_APPS_SCRIPT_URL = '/api/bookings';

let bookings = {};
let lastCacheUpdate = null;

// ==========================
// 🔄 CARICAMENTO PRENOTAZIONI
// ==========================
async function loadBookingsFromGoogle() {
    try {
        console.log('🔄 Caricamento prenotazioni dal proxy Vercel...');
        
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getBookings`);
        const result = await response.json();
        
        if (result.success) {
            bookings = result.data.bookings || {};
            lastCacheUpdate = Date.now();
            console.log('✅ Prenotazioni caricate:', Object.keys(bookings).length);
            return true;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Errore caricamento dal proxy:', error);
        bookings = {};
        return false;
    }
}

// ==========================
// 💾 SALVATAGGIO PRENOTAZIONE
// ==========================
async function saveBookingToGoogle(bookingData) {
    try {
        console.log('💾 Salvataggio prenotazione tramite proxy Vercel...');
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Prenotazione salvata:', result.data.bookingId);
            
            // Aggiornamento cache locale
            const key = getBookingKey(bookingData.serviceId, bookingData.date, bookingData.time);
            bookings[key] = (bookings[key] || 0) + 1;
            
            return { success: true, bookingId: result.data.bookingId };
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Errore salvataggio tramite proxy:', error);
        
        // Fallback: creo un ID temporaneo
        const bookingId = 'TEMP-' + Date.now();
        const key = getBookingKey(bookingData.serviceId, bookingData.date, bookingData.time);
        bookings[key] = (bookings[key] || 0) + 1;
        
        return { success: true, bookingId: bookingId };
    }
}

// ==========================
// 📅 VERIFICA DISPONIBILITÀ
// ==========================
async function checkAvailabilityOnline(serviceId, date, time) {
    try {
        const url = `${GOOGLE_APPS_SCRIPT_URL}?action=checkAvailability&serviceId=${serviceId}&date=${date}&time=${time}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Errore verifica disponibilità tramite proxy:', error);
        return null;
    }
}

// ==========================
// 🔑 GENERATORE DI CHIAVI
// ==========================
function getBookingKey(serviceId, date, time) {
    return `${serviceId}_${date}_${time}`;
}

// ==========================
// 🚀 AVVIO INIZIALE
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    loadBookingsFromGoogle();
});
