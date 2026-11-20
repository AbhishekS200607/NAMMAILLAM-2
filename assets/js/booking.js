/**
 * NAMMA ILLAM - TABLE RESERVATION & LIVE STATUS ENGINE
 * Real-time 7:00 AM – 11:00 PM IST Status & WhatsApp Booking Modal
 * (C) 2026 Namma Illam Heritage Veg Cafe, Alappuzha
 */

(function () {
  'use strict';

  const CAFE_PHONE = '919744383621'; // Official Namma Illam WhatsApp Phone

  // ========================================================
  // 1. REAL-TIME CAFE STATUS (IST: 7:00 AM – 11:00 PM DAILY)
  // ========================================================
  function getCafeStatus() {
    const now = new Date();
    // Convert current time to Indian Standard Time (IST: UTC+5:30)
    const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istString);
    const hour = istDate.getHours();
    const minute = istDate.getMinutes();
    const totalMinutes = hour * 60 + minute;

    const openTime = 7 * 60;      // 07:00 AM (420 mins)
    const closeTime = 23 * 60;    // 11:00 PM (1380 mins)
    const closingSoon = 22 * 60 + 15; // 10:15 PM (1335 mins)

    if (totalMinutes >= openTime && totalMinutes < closeTime) {
      if (totalMinutes >= closingSoon) {
        const minsLeft = closeTime - totalMinutes;
        return {
          isOpen: true,
          badgeClass: 'status-closing',
          dotClass: 'dot-closing',
          badgeText: 'Closing Soon',
          summaryText: `Closing soon (${minsLeft} mins left · 11:00 PM)`,
          scheduleText: 'Open Daily: 7:00 AM – 11:00 PM'
        };
      }
      return {
        isOpen: true,
        badgeClass: 'status-open',
        dotClass: 'dot-open',
        badgeText: 'Open Now',
        summaryText: 'Open Now · Closes at 11:00 PM',
        scheduleText: 'Open Daily: 7:00 AM – 11:00 PM'
      };
    } else {
      return {
        isOpen: false,
        badgeClass: 'status-closed',
        dotClass: 'dot-closed',
        badgeText: 'Closed Now',
        summaryText: 'Closed Now · Opens at 7:00 AM',
        scheduleText: 'Open Daily: 7:00 AM – 11:00 PM'
      };
    }
  }

  function updateLiveStatusUI() {
    const status = getCafeStatus();

    // 1. Update elements with specific IDs if present (e.g. on contact.html)
    const badgeEl = document.getElementById('storeLiveBadge');
    if (badgeEl) {
      badgeEl.className = 'live-status-badge ' + status.badgeClass;
      badgeEl.textContent = status.badgeText;
    }

    const dotEl = document.getElementById('storeTimingDot');
    if (dotEl) {
      dotEl.className = 'store-timing-dot ' + status.dotClass;
    }

    const schedEl = document.getElementById('storeTimingSchedule');
    if (schedEl) {
      schedEl.textContent = `${status.scheduleText} (${status.summaryText})`;
    }

    // 2. Update any generic elements with data attributes
    document.querySelectorAll('[data-cafe-status="badge"]').forEach(el => {
      el.className = 'live-status-badge ' + status.badgeClass;
      el.innerHTML = `<span class="live-dot ${status.dotClass}"></span> <span>${status.badgeText}</span>`;
    });

    document.querySelectorAll('[data-cafe-status="summary"]').forEach(el => {
      el.textContent = status.summaryText;
    });

    // 3. Update status inside booking modal if open
    const modalStatus = document.getElementById('tbModalLiveBadge');
    if (modalStatus) {
      modalStatus.className = 'live-status-badge ' + status.badgeClass;
      modalStatus.innerHTML = `<span class="live-dot ${status.dotClass}"></span> <span>${status.badgeText} · 7 AM – 11 PM</span>`;
    }
  }

  // ========================================================
  // 2. MODAL INJECTION & LOGIC
  // ========================================================
  function injectBookingModal() {
    if (document.getElementById('tableBookingModal')) return;

    const modalHTML = `
    <div id="tableBookingModal" class="tb-modal-backdrop" aria-hidden="true" role="dialog" aria-modal="true">
      <div class="tb-modal-dialog">
        <!-- Header -->
        <div class="tb-modal-header">
          <div class="tb-header-top-row">
            <div class="tb-modal-brand">
              <img src="assets/optimized/logo-icon-transparent.webp" alt="Namma Illam" width="22" height="22">
              <span>Namma Illam Heritage</span>
            </div>
            <button type="button" class="tb-modal-close-btn" id="tbCloseModalBtn" aria-label="Close Reservation Modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <h2 class="tb-modal-title">Reserve a Table</h2>
          <p class="tb-modal-subtitle">Freshly ground aromas, piping hot dosas, and heritage hospitality await you at Alappuzha.</p>
          <div class="tb-status-strip">
            <span id="tbModalLiveBadge" class="live-status-badge status-open">
              <span class="live-dot dot-open"></span>
              <span>Open Now · 7 AM – 11 PM</span>
            </span>
            <span style="font-size: 11.5px; color: #7A6F64;">Instant WhatsApp Confirmation</span>
          </div>
        </div>

        <!-- Form Body -->
        <div class="tb-modal-body">
          <form id="tbBookingForm" novalidate>
            <div class="tb-form-grid">
              <!-- Name -->
              <div class="tb-form-group">
                <label for="tbName">Full Name *</label>
                <input type="text" id="tbName" name="name" placeholder="e.g. Anandha Krishnan" required autocomplete="name">
              </div>

              <!-- Phone -->
              <div class="tb-form-group">
                <label for="tbPhone">WhatsApp Number *</label>
                <input type="tel" id="tbPhone" name="phone" placeholder="+91 97443 83621" required autocomplete="tel">
              </div>

              <!-- Date -->
              <div class="tb-form-group">
                <label for="tbDate">Reservation Date *</label>
                <input type="date" id="tbDate" name="date" required>
              </div>

              <!-- Time Slot -->
              <div class="tb-form-group">
                <label for="tbTime">Preferred Time *</label>
                <select id="tbTime" name="time" required>
                  <option value="" disabled selected>Select a time slot</option>
                  <optgroup label="Morning Breakfast (7:00 AM – 11:30 AM)">
                    <option value="07:30 AM">07:30 AM (Early Breakfast)</option>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="08:30 AM">08:30 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                  </optgroup>
                  <optgroup label="Afternoon Lunch (12:00 PM – 4:00 PM)">
                    <option value="12:30 PM">12:30 PM (Lunch Feast)</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </optgroup>
                  <optgroup label="Evening Tiffin & Coffee (4:00 PM – 7:00 PM)">
                    <option value="04:30 PM">04:30 PM (Filter Coffee & Snacks)</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="05:30 PM">05:30 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                    <option value="06:30 PM">06:30 PM</option>
                  </optgroup>
                  <optgroup label="Dinner (7:00 PM – 10:30 PM)">
                    <option value="07:00 PM">07:00 PM (Dinner)</option>
                    <option value="07:30 PM">07:30 PM</option>
                    <option value="08:00 PM">08:00 PM</option>
                    <option value="08:30 PM">08:30 PM</option>
                    <option value="09:00 PM">09:00 PM</option>
                    <option value="09:30 PM">09:30 PM</option>
                    <option value="10:00 PM">10:00 PM (Last Seating)</option>
                  </optgroup>
                </select>
              </div>

              <!-- Guests Count -->
              <div class="tb-form-group tb-field-full">
                <label>Number of Guests *</label>
                <div class="tb-guest-pills">
                  <label>
                    <input type="radio" name="guests" value="1 Guest" class="tb-guest-radio">
                    <span class="tb-guest-pill-label">1 Guest</span>
                  </label>
                  <label>
                    <input type="radio" name="guests" value="2 Guests" class="tb-guest-radio" checked>
                    <span class="tb-guest-pill-label">2 Guests</span>
                  </label>
                  <label>
                    <input type="radio" name="guests" value="3-4 Guests" class="tb-guest-radio">
                    <span class="tb-guest-pill-label">3 - 4 Guests</span>
                  </label>
                  <label>
                    <input type="radio" name="guests" value="5-8 Guests" class="tb-guest-radio">
                    <span class="tb-guest-pill-label">5 - 8 Guests</span>
                  </label>
                  <label>
                    <input type="radio" name="guests" value="9+ Family/Group" class="tb-guest-radio">
                    <span class="tb-guest-pill-label">9+ Family / Group</span>
                  </label>
                </div>
              </div>

              <!-- Dining Type -->
              <div class="tb-form-group tb-field-full">
                <label for="tbOccasion">Dining Preference / Occasion</label>
                <select id="tbOccasion" name="occasion">
                  <option value="Casual Dining / Breakfast / Lunch">Casual Dining</option>
                  <option value="Traditional South Indian Breakfast">Traditional Breakfast</option>
                  <option value="Heritage Lunch Feast">Heritage Lunch Feast</option>
                  <option value="Evening Filter Coffee & Snacks">Evening Tiffin & Degree Coffee</option>
                  <option value="Family Dinner">Family Dinner</option>
                  <option value="Birthday / Anniversary Celebration">Birthday / Anniversary Celebration</option>
                  <option value="Tourist / Traveler Group Visit">Tourist / Traveler Group Visit</option>
                </select>
              </div>

              <!-- Special Request Notes -->
              <div class="tb-form-group tb-field-full">
                <label for="tbNotes">Special Request (Optional)</label>
                <textarea id="tbNotes" name="notes" placeholder="e.g. Window table preference, high chair needed, dietary restrictions..."></textarea>
              </div>

              <!-- Submit Button -->
              <div class="tb-field-full">
                <button type="submit" class="tb-submit-btn" id="tbSubmitBtn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.707 1.916.804 2.05c.098.133 1.392 2.122 3.372 2.977.47.203.838.324 1.125.416.474.152.905.13 1.246.08.38-.058 1.17-.478 1.336-.942.164-.464.164-.862.114-.942-.049-.079-.182-.133-.38-.23z"/></svg>
                  <span>Send Reservation via WhatsApp</span>
                </button>
                <p class="tb-submit-hint">Tapping opens WhatsApp directly to confirm table availability with our reception team.</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div id="tbToast" class="tb-toast" role="status">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#25D366" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
      <span id="tbToastText">Opening WhatsApp to confirm your table...</span>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Set default date to today in IST
    const dateInput = document.getElementById('tbDate');
    if (dateInput) {
      const today = new Date();
      const istString = today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istDate = new Date(istString);
      const yyyy = istDate.getFullYear();
      const mm = String(istDate.getMonth() + 1).padStart(2, '0');
      const dd = String(istDate.getDate()).padStart(2, '0');
      const todayISO = `${yyyy}-${mm}-${dd}`;
      dateInput.min = todayISO;
      dateInput.value = todayISO;
    }

    bindModalEvents();
  }

  function showToast(msg) {
    const toast = document.getElementById('tbToast');
    const text = document.getElementById('tbToastText');
    if (!toast || !text) return;
    text.textContent = msg;
    toast.classList.add('is-show');
    setTimeout(() => {
      toast.classList.remove('is-show');
    }, 3500);
  }

  function openBookingModal() {
    injectBookingModal();
    const modal = document.getElementById('tableBookingModal');
    if (!modal) return;
    updateLiveStatusUI();
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus on first input
    const nameInput = document.getElementById('tbName');
    if (nameInput) setTimeout(() => nameInput.focus(), 150);
  }

  function closeBookingModal() {
    const modal = document.getElementById('tableBookingModal');
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function formatDateFriendly(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    } catch (e) {}
    return dateStr;
  }

  function handleBookingSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const date = form.date.value;
    const time = form.time.value;
    const guests = form.guests.value || '2 Guests';
    const occasion = form.occasion.value;
    const notes = form.notes.value.trim();

    if (!name) {
      alert('Please enter your full name.');
      form.name.focus();
      return;
    }
    if (!phone) {
      alert('Please enter your WhatsApp contact number.');
      form.phone.focus();
      return;
    }
    if (!date) {
      alert('Please select your preferred reservation date.');
      form.date.focus();
      return;
    }
    if (!time) {
      alert('Please select a dining time slot.');
      form.time.focus();
      return;
    }

    const formattedDate = formatDateFriendly(date);

    // Build formatted WhatsApp message
    let message = `*Namaskaram Namma Illam!* 🙏\n`;
    message += `I would like to reserve a table at Namma Illam Heritage Veg Cafe, Alappuzha:\n\n`;
    message += `👤 *Name:* ${name}\n`;
    message += `📞 *Phone:* ${phone}\n`;
    message += `📅 *Date:* ${formattedDate}\n`;
    message += `⏰ *Time:* ${time}\n`;
    message += `👥 *Guests:* ${guests}\n`;
    message += `🍽️ *Dining Preference:* ${occasion}\n`;
    if (notes) {
      message += `📝 *Special Request:* ${notes}\n`;
    }
    message += `\nKindly confirm table availability. Thank you!`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CAFE_PHONE}?text=${encodedMsg}`;

    showToast('Opening WhatsApp to confirm your table...');

    setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      closeBookingModal();
    }, 400);
  }

  function bindModalEvents() {
    const modal = document.getElementById('tableBookingModal');
    const closeBtn = document.getElementById('tbCloseModalBtn');
    const form = document.getElementById('tbBookingForm');

    if (closeBtn) {
      closeBtn.onclick = closeBookingModal;
    }

    if (modal) {
      modal.onclick = function (e) {
        if (e.target === modal) closeBookingModal();
      };
    }

    if (form) {
      form.onsubmit = handleBookingSubmit;
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeBookingModal();
    });
  }

  // ========================================================
  // 3. GLOBAL INITIALIZATION
  // ========================================================
  function initBookingSystem() {
    injectBookingModal();
    updateLiveStatusUI();

    // Check status every 30 seconds
    setInterval(updateLiveStatusUI, 30000);

    // Global click delegate for any button opening booking modal
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('[data-open-booking], .open-booking-modal, a[href="#bookTable"]');
      if (trigger) {
        e.preventDefault();
        openBookingModal();
      }
    });

    // Expose API globally
    window.NammaIllamBooking = {
      open: openBookingModal,
      close: closeBookingModal,
      getStatus: getCafeStatus
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBookingSystem);
  } else {
    initBookingSystem();
  }
})();
