// ✅ Tutte le richieste vanno ora al proxy su Vercel
const GOOGLE_APPS_SCRIPT_URL = '/api/bookings';

let bookings = {};
let lastCacheUpdate = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti di validità cache

// ==========================
// 🔄 CARICAMENTO PRENOTAZIONI
// ==========================
async function loadBookingsFromGoogle(force = false) {
    if (!force && lastCacheUpdate && Date.now() - lastCacheUpdate < CACHE_TTL) {
        console.log('⏱️ Cache ancora valida, niente fetch');
        return true;
    }

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
            throw new Error(result.message || 'Errore sconosciuto dal server');
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
    const key = getBookingKey(bookingData.serviceId, bookingData.date, bookingData.time);
    
    try {
        console.log('💾 Salvataggio prenotazione tramite proxy Vercel...');
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Prenotazione salvata:', result.data.bookingId);
            bookings[key] = (bookings[key] || 0) + 1;
            return { success: true, bookingId: result.data.bookingId };
        } else {
            throw new Error(result.message || 'Errore sconosciuto dal server');
        }
    } catch (error) {
        console.error('❌ Errore salvataggio tramite proxy, fallback locale:', error);
        
        // Fallback locale senza bloccare l'utente
        const bookingId = 'TEMP-' + Date.now();
        bookings[key] = (bookings[key] || 0) + 1;
        return { success: true, bookingId };
    }
}

// ==========================
// 📅 VERIFICA DISPONIBILITÀ
// ==========================
async function checkAvailabilityOnline(serviceId, date, time) {
    const key = getBookingKey(serviceId, date, time);

    try {
        const url = `${GOOGLE_APPS_SCRIPT_URL}?action=checkAvailability&serviceId=${serviceId}&date=${date}&time=${time}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            // Aggiorno cache locale con il numero di prenotazioni
            bookings[key] = result.data.booked || 0;
            return result.data.available;
        } else {
            throw new Error(result.message || 'Errore sconosciuto dal server');
        }
    } catch (error) {
        console.error('❌ Errore verifica disponibilità tramite proxy:', error);

        // Fallback: stimo disponibilità da cache locale
        const booked = bookings[key] || 0;
        return booked < (result?.data?.capacity || 10); // default capacity 10
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

