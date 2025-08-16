// ==========================
// 📄 Booking Google Apps Script
// ==========================

// Costante: nome del foglio dove salvare le prenotazioni
const SHEET_NAME = "Prenotazioni";

// ==========================
// 📥 DO GET - Lettura prenotazioni / verifica disponibilità
// ==========================
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === "getBookings") {
      const bookings = getBookingsFromSheet();
      return jsonResponse({ success: true, data: { bookings } });
    }

    if (action === "checkAvailability") {
      const serviceId = e.parameter.serviceId;
      const date = e.parameter.date;
      const time = e.parameter.time;
      const available = checkAvailability(serviceId, date, time);
      return jsonResponse({ success: true, data: { available } });
    }

    throw new Error("Azione non valida");
  } catch (err) {
    return jsonResponse({ success: false, message: err.message });
  }
}

// ==========================
// 📤 DO POST - Salvataggio prenotazione
// ==========================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const bookingId = saveBookingToSheet(data);
    return jsonResponse({ success: true, data: { bookingId } });
  } catch (err) {
    return jsonResponse({ success: false, message: err.message });
  }
}

// ==========================
// 🔑 Funzioni helper
// ==========================
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Legge tutte le prenotazioni dal foglio
function getBookingsFromSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return {};

  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // prima riga = intestazioni

  const bookings = {};
  data.forEach(row => {
    const rowObj = {};
    headers.forEach((h, i) => rowObj[h] = row[i]);
    const key = `${rowObj.serviceId}_${rowObj.date}_${rowObj.time}`;
    bookings[key] = (bookings[key] || 0) + 1;
  });
  return bookings;
}

// Salva una prenotazione nel foglio e restituisce un ID univoco
function saveBookingToSheet(booking) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Foglio prenotazioni non trovato");

  const bookingId = 'BKG-' + Date.now();
  const row = [
    bookingId,
    booking.serviceId,
    booking.date,
    booking.time,
    booking.name || "",
    booking.email || "",
    booking.phone || "",
    booking.note || ""
  ];
  
  // Se il foglio è vuoto, scrivi intestazioni
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['bookingId','serviceId','date','time','name','email','phone','note']);
  }

  sheet.appendRow(row);
  return bookingId;
}

// Controlla se un orario è disponibile
function checkAvailability(serviceId, date, time) {
  const bookings = getBookingsFromSheet();
  const key = `${serviceId}_${date}_${time}`;
  // Qui puoi settare max prenotazioni per slot, esempio 1
  const MAX_PER_SLOT = 1;
  return (bookings[key] || 0) < MAX_PER_SLOT;
}
