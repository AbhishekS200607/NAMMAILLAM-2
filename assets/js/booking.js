/**
 * NAMMA ILLAM - MOBILE-OPTIMIZED TABLE RESERVATION & ANIMATION
 * Step 1: Name & Mobile Number
 * Step 2: Date, Time, Dynamic Dining Table Seats Animation, Food Preference
 * Theme: Terracotta (#C0562F), Heritage Cream (#FAF7F2)
 * (C) 2026 Namma Illam Heritage Veg Cafe, Alappuzha
 */

(function () {
  'use strict';

  const CAFE_PHONE = '919744383621'; // Official Namma Illam WhatsApp Phone

  // State
  let bookingState = {
    name: '',
    phone: '',
    date: '',
    dateLabel: 'Today',
    time: '11:30 AM',
    people: 2,
    preference: 'Traditional Thali',
    notes: ''
  };

  // ========================================================
  // SUCCESS SOUND CHIME (WEB AUDIO API SYNTHESIZER)
  // Two-tone bell chime: D5 (587.33 Hz) -> A5 (880 Hz) + D6 shimmer
  // ========================================================
  function playSuccessChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Note 1: 587.33 Hz (D5 warm bell ping)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.22, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2: 880 Hz (A5 crystal clear chime)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.setValueAtTime(0.28, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 1.0);

      // Note 3: 1174.66 Hz (D6 overtone sparkle)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1174.66, now + 0.18);
      gain3.gain.setValueAtTime(0.0001, now);
      gain3.gain.setValueAtTime(0.12, now + 0.18);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.18);
      osc3.stop(now + 0.85);
    } catch (e) {
      // AudioContext restricted or unavailable
    }
  }

  // ========================================================
  // 1. REAL-TIME CAFE STATUS (IST: 7:00 AM – 11:00 PM DAILY)
  // ========================================================
  function getCafeStatus() {
    const now = new Date();
    const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istString);
    const hour = istDate.getHours();
    const minute = istDate.getMinutes();
    const totalMinutes = hour * 60 + minute;

    const openTime = 7 * 60;          // 07:00 AM
    const closeTime = 23 * 60;        // 11:00 PM
    const closingSoon = 22 * 60 + 15; // 10:15 PM

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

    document.querySelectorAll('[data-cafe-status="badge"]').forEach(el => {
      el.className = 'live-status-badge ' + status.badgeClass;
      el.innerHTML = `<span class="live-dot ${status.dotClass}"></span> <span>${status.badgeText}</span>`;
    });

    document.querySelectorAll('[data-cafe-status="dot"]').forEach(el => {
      el.className = 'live-dot ' + status.dotClass;
    });

    document.querySelectorAll('[data-cafe-status="summary"]').forEach(el => {
      el.textContent = status.summaryText;
    });
  }

  // ========================================================
  // 2. DINING TABLE ANIMATION (CHAIRS & PLATES RENDERER)
  // ========================================================
  function renderTableAnimation(peopleCount) {
    const chairsRing = document.getElementById('tbChairsRing');
    const caption = document.getElementById('tbTableCaption');
    if (!chairsRing) return;

    chairsRing.innerHTML = '';
    const isMobile = window.innerWidth <= 600;
    const chairRadius = isMobile ? 65 : 74;
    const plateRadius = isMobile ? 36 : 42;

    const displayCount = peopleCount >= 5 ? 6 : peopleCount;

    for (let i = 0; i < displayCount; i++) {
      let angleDeg;
      if (displayCount === 1) {
        angleDeg = 90; // Bottom chair
      } else if (displayCount === 2) {
        angleDeg = i === 0 ? 270 : 90; // Top and bottom
      } else {
        angleDeg = (360 / displayCount) * i - 90;
      }

      const rad = angleDeg * (Math.PI / 180);

      // Chair position
      const cx = Math.round(chairRadius * Math.cos(rad));
      const cy = Math.round(chairRadius * Math.sin(rad));

      const wrap = document.createElement('div');
      wrap.className = 'tb-chair-wrapper';
      wrap.style.transform = `translate(${cx}px, ${cy}px) rotate(${angleDeg + 90}deg)`;

      const chair = document.createElement('div');
      chair.className = 'tb-chair-body';
      chair.style.animationDelay = `${i * 0.05}s`;
      chair.innerHTML = '<div class="tb-chair-back"></div><div class="tb-chair-seat"></div>';
      wrap.appendChild(chair);
      chairsRing.appendChild(wrap);

      // Plate on table
      const px = Math.round(plateRadius * Math.cos(rad));
      const py = Math.round(plateRadius * Math.sin(rad));
      const plate = document.createElement('div');
      plate.className = 'tb-plate-spot';
      plate.style.left = `calc(50% + ${px}px)`;
      plate.style.top = `calc(50% + ${py}px)`;
      plate.style.animationDelay = `${i * 0.05 + 0.04}s`;
      chairsRing.appendChild(plate);
    }

    if (caption) {
      if (peopleCount === 1) {
        caption.textContent = 'Solo Diner Table · Cozy Heritage Seat';
      } else if (peopleCount === 2) {
        caption.textContent = 'Table for 2 · Intimate Heritage Dining';
      } else if (peopleCount === 3) {
        caption.textContent = 'Table for 3 · Perfect Friends & Family';
      } else if (peopleCount === 4) {
        caption.textContent = 'Table for 4 · Classic Quad Seating';
      } else {
        caption.textContent = `${peopleCount}+ People · Family & Feast Table`;
      }
    }
  }

  // ========================================================
  // 3. MODAL HTML INJECTION & BUILDER
  // ========================================================
  function injectBookingModal() {
    if (document.getElementById('tableBookingModal')) return;

    const modalHTML = `
    <div id="tableBookingModal" class="tb-modal-backdrop" data-lenis-prevent="true" aria-hidden="true" role="dialog" aria-modal="true">
      <div class="tb-modal-dialog" data-lenis-prevent="true">
        
        <!-- Top Nav Bar -->
        <div class="tb-top-bar">
          <div id="tbTopLeftAction">
            <span class="tb-step-indicator" id="tbStepIndicator">STEP 1 OF 2</span>
          </div>
          <button type="button" class="tb-modal-close-btn" id="tbCloseModalBtn" aria-label="Close Reservation">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- STEP 1: GUEST DETAILS (NAME & MOBILE) -->
        <div class="tb-step-pane is-active" id="tbStep1Pane">
          <div class="tb-step1-header">
            <div class="tb-brand-badge">
              <img src="assets/optimized/logo-icon-transparent.webp" alt="Namma Illam Logo" width="18" height="18">
              <span>Namma Illam Heritage</span>
            </div>
            <h2 class="tb-step-title">Reserve a Table</h2>
            <p class="tb-step-desc">First, please let us know who is dining with us.</p>
          </div>

          <form id="tbStep1Form" novalidate>
            <div class="tb-form-fields">
              <div class="tb-input-group">
                <label for="tbGuestName">Your Full Name *</label>
                <input type="text" id="tbGuestName" name="name" placeholder="e.g. Anandha Krishnan" required autocomplete="name">
              </div>

              <div class="tb-input-group">
                <label for="tbGuestPhone">WhatsApp Contact Number *</label>
                <input type="tel" id="tbGuestPhone" name="phone" placeholder="+91 97443 83621" required autocomplete="tel">
              </div>

              <div style="margin-top: 10px;">
                <button type="submit" class="tb-primary-btn" id="tbToStep2Btn">
                  <span>Continue to Table & Timing</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </button>
                <p class="tb-btn-subhint">We will directly coordinate table confirmation on WhatsApp.</p>
              </div>
            </div>
          </form>
        </div>

        <!-- STEP 2: TABLE & TIMING (REFERENCE MATCH) -->
        <div class="tb-step-pane" id="tbStep2Pane">
          
          <!-- Top Table Stage with Dynamic Animation -->
          <div class="tb-table-stage-wrap">
            <div class="tb-table-stage">
              <div class="tb-table-surface" id="tbTableSurface">
                <div class="tb-table-centerpiece">
                  <div class="tb-table-centerpiece-dot"></div>
                </div>
              </div>
              <div id="tbChairsRing"></div>
            </div>
            <div class="tb-table-caption" id="tbTableCaption">Table for 2 · Intimate Heritage Dining</div>
          </div>

          <form id="tbStep2Form" novalidate>
            
            <!-- Date Selection -->
            <div class="tb-date-row-wrap">
              <div class="tb-section-label">Date</div>
              <div class="tb-date-chips">
                <button type="button" class="tb-date-chip is-active" data-date-choice="today">Today</button>
                <button type="button" class="tb-date-chip" data-date-choice="tomorrow">Tomorrow</button>
                <button type="button" class="tb-date-chip" data-date-choice="custom">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Pick Date</span>
                </button>
              </div>
              <input type="date" id="tbCustomDateInput" class="tb-custom-date-input" aria-label="Select custom reservation date">
            </div>

            <!-- Time Display & Chips (Matching Reference) -->
            <div class="tb-time-row-wrap">
              <div class="tb-section-label">Time</div>
              <div class="tb-time-big-display">
                <span id="tbDisplayTimeText">11:30</span>
                <span class="tb-time-ampm" id="tbDisplayTimeAmPm">AM</span>
              </div>
              <div class="tb-time-slots-scroller">
                <button type="button" class="tb-slot-chip" data-time="07:30 AM">07:30 AM</button>
                <button type="button" class="tb-slot-chip" data-time="08:30 AM">08:30 AM</button>
                <button type="button" class="tb-slot-chip is-active" data-time="11:30 AM">11:30 AM</button>
                <button type="button" class="tb-slot-chip" data-time="12:30 PM">12:30 PM</button>
                <button type="button" class="tb-slot-chip" data-time="01:30 PM">01:30 PM</button>
                <button type="button" class="tb-slot-chip" data-time="05:00 PM">05:00 PM</button>
                <button type="button" class="tb-slot-chip" data-time="07:30 PM">07:30 PM</button>
                <button type="button" class="tb-slot-chip" data-time="08:30 PM">08:30 PM</button>
                <button type="button" class="tb-slot-chip" data-time="09:30 PM">09:30 PM</button>
              </div>
            </div>

            <!-- How Many People? (Matching Reference 1, 2, 3, 4, 4+) -->
            <div class="tb-people-row-wrap">
              <div class="tb-section-label">How many people?</div>
              <div class="tb-people-buttons">
                <button type="button" class="tb-people-btn" data-count="1">1</button>
                <button type="button" class="tb-people-btn is-active" data-count="2">2</button>
                <button type="button" class="tb-people-btn" data-count="3">3</button>
                <button type="button" class="tb-people-btn" data-count="4">4</button>
                <button type="button" class="tb-people-btn" data-count="5">4+</button>
              </div>
            </div>

            <!-- Any Food Preference? (Matching Reference Boxes) -->
            <div class="tb-preference-row-wrap">
              <div class="tb-section-label">Any food preference?</div>
              <div class="tb-preference-buttons">
                <button type="button" class="tb-pref-btn is-active" data-pref="Traditional Thali">Thali Feast</button>
                <button type="button" class="tb-pref-btn" data-pref="Dosa & Tiffin">Dosa & Tiffin</button>
              </div>
            </div>

            <!-- Optional Request Note -->
            <div class="tb-notes-wrap">
              <div class="tb-section-label">Special Request (Optional)</div>
              <textarea id="tbSpecialNotes" class="tb-notes-input" placeholder="e.g. Window table, high chair, birthday celebration..."></textarea>
            </div>

            <!-- Submit Button (Our Terracotta Theme) -->
            <div>
              <button type="submit" class="tb-primary-btn" id="tbConfirmReservationBtn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.707 1.916.804 2.05c.098.133 1.392 2.122 3.372 2.977.47.203.838.324 1.125.416.474.152.905.13 1.246.08.38-.058 1.17-.478 1.336-.942.164-.464.164-.862.114-.942-.049-.079-.182-.133-.38-.23z"/></svg>
                <span>Book Table on WhatsApp</span>
              </button>
              <p class="tb-btn-subhint">Directly opens WhatsApp to confirm your table with our reservation desk.</p>
            </div>

          </form>
        </div>

        <!-- STEP 3: SUCCESS ANIMATION PANE WITH SOUND -->
        <div class="tb-success-pane" id="tbSuccessPane">
          <div class="tb-success-icon-wrap">
            <div class="tb-success-ring"></div>
            <div class="tb-sparkle-dot"></div>
            <div class="tb-sparkle-dot"></div>
            <div class="tb-sparkle-dot"></div>
            <div class="tb-sparkle-dot"></div>
            <div class="tb-sparkle-dot"></div>
            <div class="tb-sparkle-dot"></div>
            <svg class="tb-success-svg" viewBox="0 0 80 80">
              <circle class="tb-success-circle" cx="40" cy="40" r="34" />
              <polyline class="tb-success-check" points="24,42 35,53 56,29" />
            </svg>
          </div>

          <h2 class="tb-success-title">Your Request is Sent!</h2>
          <p class="tb-success-msg">Opening WhatsApp to confirm table availability directly with our reservation team.</p>

          <div class="tb-summary-box">
            <div class="tb-summary-row">
              <span class="tb-summary-label">Guest Name</span>
              <span id="tbSuccessName" style="font-weight: 700;">-</span>
            </div>
            <div class="tb-summary-row">
              <span class="tb-summary-label">Date & Time</span>
              <span id="tbSuccessDateTime">-</span>
            </div>
            <div class="tb-summary-row">
              <span class="tb-summary-label">Table Party</span>
              <span id="tbSuccessParty">-</span>
            </div>
          </div>

          <div class="tb-progress-bar-wrap">
            <div class="tb-progress-bar-fill"></div>
          </div>

          <div class="tb-success-actions">
            <a href="#" id="tbDirectWaLink" target="_blank" rel="noopener" class="tb-direct-wa-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.707 1.916.804 2.05c.098.133 1.392 2.122 3.372 2.977.47.203.838.324 1.125.416.474.152.905.13 1.246.08.38-.058 1.17-.478 1.336-.942.164-.464.164-.862.114-.942-.049-.079-.182-.133-.38-.23z"/></svg>
              <span>Tap to Open WhatsApp Now</span>
            </a>
            <button type="button" class="tb-done-btn" id="tbDoneCloseBtn">Close</button>
          </div>
        </div>

      </div>
    </div>

    <!-- Toast Notification -->
    <div id="tbToast" class="tb-toast" role="status">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#C0562F" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
      <span id="tbToastText">Opening WhatsApp to confirm your table...</span>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    initDefaultDates();
    bindModalEvents();
  }

  function formatCleanDate(d) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function initDefaultDates() {
    const today = new Date();
    const istString = today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istString);
    const yyyy = istDate.getFullYear();
    const mm = String(istDate.getMonth() + 1).padStart(2, '0');
    const dd = String(istDate.getDate()).padStart(2, '0');
    bookingState.date = `${yyyy}-${mm}-${dd}`;
    bookingState.dateLabel = `Today (${formatCleanDate(istDate)})`;

    const customInput = document.getElementById('tbCustomDateInput');
    if (customInput) {
      customInput.min = `${yyyy}-${mm}-${dd}`;
      customInput.value = `${yyyy}-${mm}-${dd}`;
    }
  }

  // ========================================================
  // 4. STEP SWITCHING & MODAL INTERACTION
  // ========================================================
  function goToStep(stepNumber) {
    const step1Pane = document.getElementById('tbStep1Pane');
    const step2Pane = document.getElementById('tbStep2Pane');
    const successPane = document.getElementById('tbSuccessPane');
    const topLeft = document.getElementById('tbTopLeftAction');
    if (!step1Pane || !step2Pane || !topLeft) return;

    if (stepNumber === 1) {
      step1Pane.classList.add('is-active');
      step2Pane.classList.remove('is-active');
      if (successPane) successPane.classList.remove('is-active');
      topLeft.innerHTML = '<span class="tb-step-indicator">STEP 1 OF 2 · GUEST DETAILS</span>';
    } else if (stepNumber === 2) {
      step1Pane.classList.remove('is-active');
      step2Pane.classList.add('is-active');
      if (successPane) successPane.classList.remove('is-active');
      topLeft.innerHTML = `
        <button type="button" class="tb-back-btn" id="tbStepBackBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
          </svg>
          <span>Back</span>
        </button>
      `;
      const backBtn = document.getElementById('tbStepBackBtn');
      if (backBtn) backBtn.onclick = () => goToStep(1);

      // Render table seats with animation
      renderTableAnimation(bookingState.people);
    } else if (stepNumber === 3) {
      step1Pane.classList.remove('is-active');
      step2Pane.classList.remove('is-active');
      if (successPane) successPane.classList.add('is-active');
      topLeft.innerHTML = '<span class="tb-step-indicator" style="color: #2E7D32;">RESERVATION SENT</span>';
    }
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
    goToStep(1);
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('tb-modal-open');
    document.body.classList.add('tb-modal-open');

    // Pause Lenis smooth scroll while modal is open so touch scrolls modal natively
    if (window.lenis && typeof window.lenis.stop === 'function') {
      try { window.lenis.stop(); } catch(e) {}
    }

    const nameInput = document.getElementById('tbGuestName');
    if (nameInput) setTimeout(() => nameInput.focus(), 150);
  }

  function closeBookingModal() {
    const modal = document.getElementById('tableBookingModal');
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('tb-modal-open');
    document.body.classList.remove('tb-modal-open');

    // Resume Lenis smooth scroll
    if (window.lenis && typeof window.lenis.start === 'function') {
      try { window.lenis.start(); } catch(e) {}
    }
  }

  function setTimeDisplay(timeStr) {
    bookingState.time = timeStr;
    const parts = timeStr.split(' ');
    const displayNum = document.getElementById('tbDisplayTimeText');
    const displayAmPm = document.getElementById('tbDisplayTimeAmPm');
    if (displayNum && parts[0]) displayNum.textContent = parts[0];
    if (displayAmPm && parts[1]) displayAmPm.textContent = parts[1];
  }

  function bindModalEvents() {
    const modal = document.getElementById('tableBookingModal');
    const closeBtn = document.getElementById('tbCloseModalBtn');
    const step1Form = document.getElementById('tbStep1Form');
    const step2Form = document.getElementById('tbStep2Form');

    if (closeBtn) closeBtn.onclick = closeBookingModal;
    if (modal) {
      modal.onclick = function (e) {
        if (e.target === modal) closeBookingModal();
      };
    }

    // Step 1 Submission
    if (step1Form) {
      step1Form.onsubmit = function (e) {
        e.preventDefault();
        const nameVal = document.getElementById('tbGuestName').value.trim();
        const phoneVal = document.getElementById('tbGuestPhone').value.trim();

        if (!nameVal) {
          alert('Please enter your full name.');
          document.getElementById('tbGuestName').focus();
          return;
        }
        if (!phoneVal) {
          alert('Please enter your WhatsApp contact number.');
          document.getElementById('tbGuestPhone').focus();
          return;
        }

        bookingState.name = nameVal;
        bookingState.phone = phoneVal;
        goToStep(2);
      };
    }

    // Date Chips
    const dateChips = document.querySelectorAll('.tb-date-chip');
    const customDateInput = document.getElementById('tbCustomDateInput');

    dateChips.forEach(chip => {
      chip.onclick = function () {
        dateChips.forEach(c => c.classList.remove('is-active'));
        this.classList.add('is-active');
        const choice = this.getAttribute('data-date-choice');

        const now = new Date();
        const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

        if (choice === 'today') {
          if (customDateInput) customDateInput.style.display = 'none';
          const yyyy = ist.getFullYear();
          const mm = String(ist.getMonth() + 1).padStart(2, '0');
          const dd = String(ist.getDate()).padStart(2, '0');
          bookingState.date = `${yyyy}-${mm}-${dd}`;
          bookingState.dateLabel = `Today (${formatCleanDate(ist)})`;
        } else if (choice === 'tomorrow') {
          if (customDateInput) customDateInput.style.display = 'none';
          ist.setDate(ist.getDate() + 1);
          const yyyy = ist.getFullYear();
          const mm = String(ist.getMonth() + 1).padStart(2, '0');
          const dd = String(ist.getDate()).padStart(2, '0');
          bookingState.date = `${yyyy}-${mm}-${dd}`;
          bookingState.dateLabel = `Tomorrow (${formatCleanDate(ist)})`;
        } else if (choice === 'custom') {
          if (customDateInput) {
            customDateInput.style.display = 'block';
            customDateInput.focus();
          }
        }
      };
    });

    if (customDateInput) {
      customDateInput.onchange = function () {
        bookingState.date = this.value;
        const parts = this.value.split('-');
        if (parts.length === 3) {
          const d = new Date(parts[0], parts[1] - 1, parts[2]);
          bookingState.dateLabel = formatCleanDate(d);
        } else {
          bookingState.dateLabel = this.value;
        }
      };
    }

    // Time Slot Chips
    const slotChips = document.querySelectorAll('.tb-slot-chip');
    slotChips.forEach(chip => {
      chip.onclick = function () {
        slotChips.forEach(c => c.classList.remove('is-active'));
        this.classList.add('is-active');
        const chosenTime = this.getAttribute('data-time');
        setTimeDisplay(chosenTime);
      };
    });

    // How Many People? (1, 2, 3, 4, 4+)
    const peopleBtns = document.querySelectorAll('.tb-people-btn');
    peopleBtns.forEach(btn => {
      btn.onclick = function () {
        peopleBtns.forEach(b => b.classList.remove('is-active'));
        this.classList.add('is-active');
        const count = parseInt(this.getAttribute('data-count'), 10);
        bookingState.people = count;
        // Trigger Dining Table Animation!
        renderTableAnimation(count);
      };
    });

    // Food Preference (Boxes)
    const prefBtns = document.querySelectorAll('.tb-pref-btn');
    prefBtns.forEach(btn => {
      btn.onclick = function () {
        prefBtns.forEach(b => b.classList.remove('is-active'));
        this.classList.add('is-active');
        bookingState.preference = this.getAttribute('data-pref');
      };
    });

    // Step 2 Submission (WhatsApp Trigger + Success Animation + Sound)
    if (step2Form) {
      step2Form.onsubmit = function (e) {
        e.preventDefault();
        const notesInput = document.getElementById('tbSpecialNotes');
        bookingState.notes = notesInput ? notesInput.value.trim() : '';

        const peopleDisplay = bookingState.people >= 5 ? '5+ Guests (Family Feast)' : `${bookingState.people} Person(s)`;

        let msg = `Hello Namma Illam Team,\n\n`;
        msg += `I would like to reserve a table at Namma Illam Heritage Veg Cafe, Alappuzha.\n\n`;
        msg += `Reservation Details:\n`;
        msg += `- Guest Name: ${bookingState.name}\n`;
        msg += `- Contact Number: ${bookingState.phone}\n`;
        msg += `- Date: ${bookingState.dateLabel}\n`;
        msg += `- Time: ${bookingState.time}\n`;
        msg += `- Table Size: ${peopleDisplay}\n`;
        msg += `- Food Preference: ${bookingState.preference}\n`;
        if (bookingState.notes) {
          msg += `- Special Request: ${bookingState.notes}\n`;
        }
        msg += `\nPlease confirm our table reservation.\nThank you!`;

        const encodedMsg = encodeURIComponent(msg);
        const whatsappUrl = `https://wa.me/${CAFE_PHONE}?text=${encodedMsg}`;

        // 1. Play crystal clear audio chime!
        playSuccessChime();

        // 2. Populate Success Screen
        const successName = document.getElementById('tbSuccessName');
        const successDateTime = document.getElementById('tbSuccessDateTime');
        const successParty = document.getElementById('tbSuccessParty');
        const directLink = document.getElementById('tbDirectWaLink');

        if (successName) successName.textContent = bookingState.name;
        if (successDateTime) successDateTime.textContent = `${bookingState.dateLabel} at ${bookingState.time}`;
        if (successParty) successParty.textContent = `${peopleDisplay} · ${bookingState.preference}`;
        if (directLink) directLink.href = whatsappUrl;

        // 3. Switch to animated success screen
        goToStep(3);

        // 4. Open WhatsApp window after a short delay so the user enjoys the animation
        setTimeout(() => {
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }, 1200);
      };
    }

    const doneCloseBtn = document.getElementById('tbDoneCloseBtn');
    if (doneCloseBtn) doneCloseBtn.onclick = closeBookingModal;

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeBookingModal();
    });
  }

  // ========================================================
  // 5. GLOBAL INITIALIZATION
  // ========================================================
  function initBookingSystem() {
    injectBookingModal();
    updateLiveStatusUI();
    setInterval(updateLiveStatusUI, 30000);

    // Click handler for any book table button
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('[data-open-booking], .open-booking-modal, a[href="#bookTable"]');
      if (trigger) {
        e.preventDefault();
        openBookingModal();
      }
    });

    window.playSuccessChime = playSuccessChime;
    window.NammaIllamBooking = {
      open: openBookingModal,
      close: closeBookingModal,
      renderTable: renderTableAnimation,
      playChime: playSuccessChime,
      getStatus: getCafeStatus
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBookingSystem);
  } else {
    initBookingSystem();
  }
})();
