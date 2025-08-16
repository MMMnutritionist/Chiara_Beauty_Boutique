// ==========================
// ✅ CONFIG
// ==========================
const GOOGLE_APPS_SCRIPT_URL = '/api/bookings';

let bookings = {};            // Cache locale
let lastCacheUpdate = null;   // Timestamp ultimo aggiornamento

// ==========================
// 🔄 CARICAMENTO PRENOTAZIONI DAL PROXY
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
            throw new Error(result.message || 'Errore sconosciuto durante il caricamento.');
        }
    } catch (error) {
        console.error('❌ Errore caricamento dal proxy:', error);
        bookings = {};
        return false;
    }
}

// ==========================
// 💾 SALVATAGGIO PRENOTAZIONE TRAMITE PROXY
// ==========================
async function saveBookingToGoogle(bookingData) {
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

            // Aggiorna cache locale
            const key = getBookingKey(bookingData.serviceId, bookingData.date, bookingData.time);
            bookings[key] = (bookings[key] || 0) + 1;

            return { success: true, bookingId: result.data.bookingId };
        } else {
            throw new Error(result.message || 'Errore sconosciuto durante il salvataggio.');
        }
    } catch (error) {
        console.error('❌ Errore salvataggio tramite proxy:', error);

        // Fallback: ID temporaneo e aggiornamento cache locale
        const bookingId = 'TEMP-' + Date.now();
        const key = getBookingKey(bookingData.serviceId, bookingData.date, bookingData.time);
        bookings[key] = (bookings[key] || 0) + 1;

        return { success: true, bookingId };
    }
}

// ==========================
// 📅 VERIFICA DISPONIBILITÀ ONLINE
// ==========================
async function checkAvailabilityOnline(serviceId, date, time) {
    try {
        const url = `${GOOGLE_APPS_SCRIPT_URL}?action=checkAvailability&serviceId=${serviceId}&date=${date}&time=${time}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            return result.data; // { booked: number }
        } else {
            throw new Error(result.message || 'Errore verifica disponibilità.');
        }
    } catch (error) {
        console.error('❌ Errore verifica disponibilità tramite proxy:', error);
        return null;
    }
}

// ==========================
// 🔑 GENERATORE DI CHIAVI PER CACHE
// ==========================
function getBookingKey(serviceId, date, time) {
    return `${serviceId}_${date}_${time}`;
}

// ==========================
// 🚀 AVVIO INIZIALE AL CARICAMENTO PAGINA
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    loadBookingsFromGoogle();
});
