// ========================================================
// GRAS SINETICO - LOGIC & WHATSAPP BOOKING INTEGRATION
// WhatsApp Phone Number: +51 976 783 049
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_PHONE = '51976783049';
  const DAY_RATE_PER_HOUR = 50;   // S/ 50 por hora diurna (8am - 5pm)
  const NIGHT_RATE_PER_HOUR = 70; // S/ 70 por hora nocturna con luz LED (6pm - 11pm)

  // Elements
  const bookingForm = document.getElementById('bookingForm');
  const clientNameInput = document.getElementById('clientName');
  const bookingDateInput = document.getElementById('bookingDate');
  const bookingTimeSelect = document.getElementById('bookingTime');
  const bookingDurationSelect = document.getElementById('bookingDuration');
  const eventTypeSelect = document.getElementById('eventType');
  const bookingNotesInput = document.getElementById('bookingNotes');

  const summaryTextEl = document.getElementById('summaryText');
  const totalPriceEl = document.getElementById('totalPrice');
  const currentYearEl = document.getElementById('currentYear');

  // Set default current year
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // Set default date to today or tomorrow
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${yyyy}-${mm}-${dd}`;

  if (bookingDateInput) {
    bookingDateInput.min = formattedToday;
    bookingDateInput.value = formattedToday;
  }

  // Helper: check if start hour is daytime or night
  function isNightHour(timeString) {
    const hour = parseInt(timeString.split(':')[0], 10);
    return hour >= 18 || hour < 6; // 6 PM onwards or late night
  }

  // Calculate price and update summary UI
  function updateReservationSummary() {
    const selectedTime = bookingTimeSelect ? bookingTimeSelect.value : '18:00';
    const duration = parseInt(bookingDurationSelect ? bookingDurationSelect.value : '1', 10);
    const isNight = isNightHour(selectedTime);

    const ratePerHour = isNight ? NIGHT_RATE_PER_HOUR : DAY_RATE_PER_HOUR;
    const totalAmount = ratePerHour * duration;

    // Calculate end time
    const startHour = parseInt(selectedTime.split(':')[0], 10);
    const endHour = (startHour + duration) % 24;
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    const endFormatted = `${String(endHour > 12 ? endHour - 12 : (endHour === 0 ? 12 : endHour)).padStart(2, '0')}:00 ${endPeriod}`;
    
    const startPeriod = startHour >= 12 ? 'PM' : 'AM';
    const startFormatted = `${String(startHour > 12 ? startHour - 12 : (startHour === 0 ? 12 : startHour)).padStart(2, '0')}:00 ${startPeriod}`;

    const shiftType = isNight ? 'Turno Noche (con Luz LED)' : 'Turno Diurno';

    if (summaryTextEl) {
      summaryTextEl.innerHTML = `${duration}h (${startFormatted} a ${endFormatted}) • <span style="color: var(--primary);">${shiftType}</span>`;
    }

    if (totalPriceEl) {
      totalPriceEl.textContent = `S/ ${totalAmount}`;
    }

    return {
      duration,
      startFormatted,
      endFormatted,
      shiftType,
      totalAmount,
      ratePerHour
    };
  }

  // Listen for changes in form controls to recalculate live
  if (bookingTimeSelect) bookingTimeSelect.addEventListener('change', updateReservationSummary);
  if (bookingDurationSelect) bookingDurationSelect.addEventListener('change', updateReservationSummary);

  // Initial calculation
  updateReservationSummary();

  // Tariff button quick selector: scrolls down and populates
  const selectTariffButtons = document.querySelectorAll('.select-tariff-btn');
  selectTariffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const timeVal = btn.getAttribute('data-time');
      const durationVal = btn.getAttribute('data-duration');

      if (timeVal && bookingTimeSelect) bookingTimeSelect.value = timeVal;
      if (durationVal && bookingDurationSelect) bookingDurationSelect.value = durationVal;

      updateReservationSummary();

      const reservationSection = document.getElementById('reservar');
      if (reservationSection) {
        reservationSection.scrollIntoView({ behavior: 'smooth' });
      }

      if (clientNameInput) {
        clientNameInput.focus();
      }
    });
  });

  // Handle Form Submission -> WhatsApp
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = clientNameInput.value.trim();
      const rawDate = bookingDateInput.value;
      const eventType = eventTypeSelect.value;
      const notes = bookingNotesInput.value.trim();

      if (!name) {
        alert('Por favor, ingresa tu nombre o el de tu equipo.');
        clientNameInput.focus();
        return;
      }

      // Format date to DD/MM/YYYY
      let dateFormatted = rawDate;
      if (rawDate) {
        const parts = rawDate.split('-');
        if (parts.length === 3) {
          dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }

      const summary = updateReservationSummary();

      // Build structured WhatsApp message
      let message = `⚽ *¡Hola Gras SinEtico! Deseo reservar la cancha* ⚽\n\n`;
      message += `👤 *Nombre:* ${name}\n`;
      message += `📅 *Fecha:* ${dateFormatted}\n`;
      message += `⏰ *Horario:* ${summary.startFormatted} a ${summary.endFormatted} (${summary.duration} hora${summary.duration > 1 ? 's' : ''})\n`;
      message += `💡 *Turno:* ${summary.shiftType}\n`;
      message += `🏆 *Encuentro:* ${eventType}\n`;
      message += `💰 *Presupuesto estimado:* S/ ${summary.totalAmount} (a S/ ${summary.ratePerHour}/h)\n`;

      if (notes) {
        message += `📝 *Nota/Pedidos:* ${notes}\n`;
      }

      message += `\n¿Tienen disponible este horario? Quedo atento a su confirmación. ¡Muchas gracias!`;

      // Redirect to WhatsApp
      const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
});
