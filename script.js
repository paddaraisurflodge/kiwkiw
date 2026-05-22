/* ─────────────────────────────────────────
   FOOTER INJECT
   Clones the footer template into every page
───────────────────────────────────────── */
function injectFooters() {
  const tpl = document.getElementById('footer-tpl');
  if (!tpl) return;
  const pages = [
    'home', 'about', 'accommodation', 'bar',
    'surf', 'gallery', 'promo', 'contact', 'location', 'booking'
  ];
  pages.forEach(id => {
    const el = document.getElementById('footer-' + id);
    if (el) el.appendChild(tpl.content.cloneNode(true));
  });
}
injectFooters();

/* ─────────────────────────────────────────
   PAGE ROUTING
───────────────────────────────────────── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + id);
  if (el) {
    el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  closeAllDropdowns();
  updateNavActive(id);
  closeAllCals();
}

function updateNavActive(id) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const map = {
    home:          'nav-home',
    surf:          'nav-surf',
    promo:         'nav-promo',
    contact:       'nav-contact',
    location:      'nav-location',
    accommodation: 'nav-lodge',
    about:         'nav-lodge',
    bar:           'nav-lodge',
    gallery:       'nav-lodge',
  };
  if (map[id]) {
    const btn = document.getElementById(map[id]);
    if (btn) btn.classList.add('active');
  }
}

/* ─────────────────────────────────────────
   DROPDOWNS
───────────────────────────────────────── */
function toggleDropdown(id) {
  const dd  = document.getElementById(id);
  const btn = dd.previousElementSibling;
  const isOpen = dd.classList.contains('open');
  closeAllDropdowns();
  if (!isOpen) {
    dd.classList.add('open');
    btn.classList.add('open');
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('open'));
}

// Close dropdown when clicking outside
function handleOutsideClick(e) {
  if (!e.target.closest('.date-picker-wrap')) closeAllCals();
  if (!e.target.closest('.nav-item')) closeAllDropdowns();
}
document.addEventListener('click', handleOutsideClick);
document.addEventListener('touchstart', handleOutsideClick, { passive: true });

/* ─────────────────────────────────────────
   MOBILE MENU
───────────────────────────────────────── */
function toggleMob() {
  const menu   = document.getElementById('mob-menu');
  const isOpen = menu.classList.toggle('open');
  document.getElementById('icon-menu').style.display  = isOpen ? 'none'  : 'block';
  document.getElementById('icon-close').style.display = isOpen ? 'block' : 'none';
}

function closeMob() {
  document.getElementById('mob-menu').classList.remove('open');
  document.getElementById('icon-menu').style.display  = 'block';
  document.getElementById('icon-close').style.display = 'none';
  document.querySelectorAll('.mob-sub').forEach(s => s.classList.remove('open'));
  document.querySelectorAll('.mob-section-btn').forEach(b => b.classList.remove('open'));
}

function toggleMobSub(btn) {
  const sub    = btn.nextElementSibling;
  const isOpen = sub.classList.contains('open');
  // Close all subs first
  document.querySelectorAll('.mob-sub').forEach(s => s.classList.remove('open'));
  document.querySelectorAll('.mob-section-btn').forEach(b => b.classList.remove('open'));
  if (!isOpen) {
    sub.classList.add('open');
    btn.classList.add('open');
  }
}

/* ─────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────── */
function openLightbox(src) {
  document.getElementById('lightbox').classList.add('open');
  document.getElementById('lightbox-img').src = src;
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

/* ─────────────────────────────────────────
   IMAGE SLIDER
───────────────────────────────────────── */
const sliderState = {};

function initSlider(id, total) {
  sliderState[id] = { current: 0, total };
}

function slideRoom(id, dir) {
  if (!sliderState[id]) return;
  const s = sliderState[id];
  s.current = (s.current + dir + s.total) % s.total;
  applySlide(id);
}

function goToSlide(id, idx) {
  if (!sliderState[id]) return;
  sliderState[id].current = idx;
  applySlide(id);
}

function applySlide(id) {
  const s     = sliderState[id];
  const track = document.getElementById('track-' + id);
  const dotsEl = document.getElementById('dots-' + id);
  if (track)  track.style.transform = `translateX(-${s.current * 100}%)`;
  if (dotsEl) dotsEl.querySelectorAll('.slider-dot').forEach((d, i) => {
    d.classList.toggle('active', i === s.current);
  });
}

function addSwipe(sliderId) {
  const el = document.getElementById('slider-' + sliderId);
  if (!el) return;
  let startX = 0, isDragging = false;

  // Touch
  el.addEventListener('touchstart', e => {
    startX     = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });
  el.addEventListener('touchend', e => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) slideRoom(sliderId, diff > 0 ? 1 : -1);
    isDragging = false;
  }, { passive: true });

  // Mouse drag
  el.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; });
  el.addEventListener('mouseup',   e => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) slideRoom(sliderId, diff > 0 ? 1 : -1);
    isDragging = false;
  });
  el.addEventListener('mouseleave', () => { isDragging = false; });
}

// Init both room sliders
initSlider('r1', 4);
initSlider('r2', 4);
addSwipe('r1');
addSwipe('r2');

/* ─────────────────────────────────────────
   FRIDAY-ONLY CALENDAR PICKER
───────────────────────────────────────── */
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS_SHORT = ['Mo','Tu','We','Th','Fr','Sa','Su'];

const calState = {
  in:  { year: 0, month: 0 },
  out: { year: 0, month: 0 },
};
let selectedIn  = '';
let selectedOut = '';

function toYMD(y, m, d) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function parseYMD(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtDisplay(ymd) {
  const d = parseYMD(ymd);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initCalendars() {
  const now = new Date();
  calState.in.year   = now.getFullYear();
  calState.in.month  = now.getMonth();
  calState.out.year  = now.getFullYear();
  calState.out.month = now.getMonth();
  renderCal('in');
  renderCal('out');
}

function renderCal(which) {
  const { year, month } = calState[which];
  document.getElementById(`cal-${which}-label`).textContent = `${MONTHS[month]} ${year}`;

  const grid = document.getElementById(`cal-${which}-grid`);
  grid.innerHTML = '';

  // Day-of-week headers
  DAYS_SHORT.forEach((d, i) => {
    const el = document.createElement('div');
    el.className = 'cal-dow' + (i === 4 ? ' fri' : '');
    el.textContent = d;
    grid.appendChild(el);
  });

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const firstDay = new Date(year, month, 1).getDay();
  // Monday-first offset: Sunday(0) → 6, Mon(1) → 0, etc.
  const monFirst    = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty cells before day 1
  for (let i = 0; i < monFirst; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow  = date.getDay();
    const ymd  = toYMD(year, month, d);
    const isFri  = dow === 5;
    const isPast = date < today;

    let isBeforeMinOut = false;
    if (which === 'out' && selectedIn) {
      const minOut = new Date(parseYMD(selectedIn).getTime() + 7 * 86400000);
      minOut.setHours(0, 0, 0, 0);
      if (date < minOut) isBeforeMinOut = true;
    }

    const el = document.createElement('div');
    let cls = 'cal-day';
    if (!isFri)                                     cls += ' not-fri';
    else if (isPast || (which === 'out' && isBeforeMinOut)) cls += ' past';
    else                                            cls += ' friday-avail';

    if (which === 'in'  && ymd === selectedIn)  cls += ' selected';
    if (which === 'out' && ymd === selectedOut) cls += ' selected';

    el.className   = cls;
    el.textContent = d;

    if (cls.includes('friday-avail')) {
      el.addEventListener('click', () => selectDate(which, ymd));
    }
    grid.appendChild(el);
  }
}

function selectDate(which, ymd) {
  if (which === 'in') {
    selectedIn = ymd;
    document.getElementById('bk-in').value = ymd;

    const displayEl = document.getElementById('dp-in-display');
    displayEl.textContent = fmtDisplay(ymd);
    displayEl.classList.remove('placeholder');

    // Reset checkout if it's now too early
    if (selectedOut) {
      const minOut = new Date(parseYMD(ymd).getTime() + 7 * 86400000);
      if (parseYMD(selectedOut) < minOut) {
        selectedOut = '';
        document.getElementById('bk-out').value = '';
        const outDisplay = document.getElementById('dp-out-display');
        outDisplay.textContent = 'Select Friday';
        outDisplay.classList.add('placeholder');
      }
    }
    closeCal('in');
    // Sync checkout calendar to same month
    calState.out.year  = calState.in.year;
    calState.out.month = calState.in.month;
    renderCal('out');

  } else {
    selectedOut = ymd;
    document.getElementById('bk-out').value = ymd;

    const displayEl = document.getElementById('dp-out-display');
    displayEl.textContent = fmtDisplay(ymd);
    displayEl.classList.remove('placeholder');
    closeCal('out');
  }

  bkCheckPromoEligibility();
  bkUpdateSummary();
}

function calNav(which, dir) {
  let { year, month } = calState[which];
  month += dir;
  if (month < 0)  { month = 11; year--; }
  if (month > 11) { month = 0;  year++; }
  calState[which] = { year, month };
  renderCal(which);
}

function toggleCal(which) {
  const popup  = document.getElementById(`cal-${which}`);
  const btn    = document.getElementById(`dp-${which}-btn`);
  const isOpen = popup.classList.contains('open');
  closeAllCals();
  if (!isOpen) {
    popup.classList.add('open');
    btn.classList.add('open');
    renderCal(which);
  }
}

function closeCal(which) {
  document.getElementById(`cal-${which}`)?.classList.remove('open');
  document.getElementById(`dp-${which}-btn`)?.classList.remove('open');
}

function closeAllCals() {
  ['in', 'out'].forEach(w => {
    document.getElementById(`cal-${w}`)?.classList.remove('open');
    document.getElementById(`dp-${w}-btn`)?.classList.remove('open');
  });
}

// Init calendars on load
initCalendars();

/* ─────────────────────────────────────────
   BOOKING LOGIC
───────────────────────────────────────── */

// Currency conversion rates (relative to USD)
const BK_RATES = {
  USD: 1,
  IDR: 17500,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.53,
  SGD: 1.34,
  JPY: 154,
  CAD: 1.36,
  MYR: 4.70,
  THB: 35.5,
};
const BK_SYM = {
  USD: '$', IDR: 'Rp', EUR: '€', GBP: '£',
  AUD: 'A$', SGD: 'S$', JPY: '¥', CAD: 'C$',
  MYR: 'RM', THB: '฿',
};
const BK_NO_DEC      = ['IDR', 'JPY']; // currencies without decimal places
const PROMO_DEADLINE  = '2026-08-31';
const PROMO_MIN_NIGHTS = 7;

// Booking state
let bkRoomUSD   = 75;
let bkRoomName  = 'Room 1';
let bkDiscount  = 0;
let bkPromoName = 'No Promo';
let bkMinGuests = 1;
let bkMaxGuests = 4;
let bkGuests    = 1;

/* -- Guest counter -- */
function updateGuestUI() {
  const display = document.getElementById('guest-display');
  const minus   = document.getElementById('guest-minus');
  const plus    = document.getElementById('guest-plus');
  const info    = document.getElementById('guest-max-info');
  if (!display) return;

  display.textContent = bkGuests + (bkGuests === 1 ? ' Guest' : ' Guests');
  minus.disabled = bkGuests <= bkMinGuests;
  plus.disabled  = bkGuests >= bkMaxGuests;
  info.textContent = bkMaxGuests >= 99
    ? 'Flexible occupancy for ' + bkRoomName
    : 'Minimum ' + bkMinGuests + ' guests for ' + bkRoomName;

  bkUpdateSummary();
}

function changeGuests(d) {
  bkGuests = Math.min(bkMaxGuests, Math.max(bkMinGuests, bkGuests + d));
  updateGuestUI();
}

/* -- Promo eligibility -- */
function bkCheckPromoEligibility() {
  const inVal    = document.getElementById('bk-in').value;
  const outVal   = document.getElementById('bk-out').value;
  const promoOpt = document.getElementById('promo-surf-pkg');
  const promoMsg = document.getElementById('promo-msg');
  if (!promoOpt) return;

  let eligible = false;
  let reason   = '';

  if (inVal && outVal && outVal > inVal) {
    const nights       = Math.round((new Date(outVal) - new Date(inVal)) / 86400000);
    const checkoutValid = outVal <= PROMO_DEADLINE;

    if (nights < PROMO_MIN_NIGHTS && !checkoutValid) {
      reason = 'Promo requires minimum 7 nights & check-out before 31 Aug 2026.';
    } else if (nights < PROMO_MIN_NIGHTS) {
      reason = 'Promo requires minimum 7 nights.';
    } else if (!checkoutValid) {
      reason = 'Promo valid for check-out before 31 August 2026.';
    } else {
      eligible = true;
    }
  } else {
    reason = 'Select check-in & check-out dates to see promo eligibility.';
  }

  promoOpt.classList.toggle('promo-disabled', !eligible);

  if (promoMsg) {
    promoMsg.style.display = eligible ? 'none' : 'block';
    promoMsg.textContent   = reason;
  }

  // Reset promo selection if no longer eligible
  if (!eligible && bkDiscount > 0) {
    selectPromo(document.querySelector('.promo-option:first-child'), 0, 'No Promo');
  }
}

/* -- Room selection -- */
function selectRoom(el, priceUSD, name, sub, minGuests, maxGuests) {
  document.querySelectorAll('.room-option').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  bkRoomUSD   = priceUSD;
  bkRoomName  = name;
  bkMinGuests = minGuests;
  bkMaxGuests = maxGuests;
  // Clamp current guest count to new room limits
  if (bkGuests < bkMinGuests) bkGuests = bkMinGuests;
  if (bkGuests > bkMaxGuests) bkGuests = bkMaxGuests;
  updateGuestUI();
}

/* -- Promo selection -- */
function selectPromo(el, discount, name) {
  document.querySelectorAll('.promo-option').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  bkDiscount  = discount;
  bkPromoName = name;
  bkUpdateSummary();
}

/* -- Currency formatter -- */
function bkFmt(amountUSD) {
  const cur = document.getElementById('bk-currency')
    ? document.getElementById('bk-currency').value
    : 'USD';
  const val = amountUSD * (BK_RATES[cur] || 1);
  const sym = BK_SYM[cur] || '$';
  return BK_NO_DEC.includes(cur)
    ? sym + Math.round(val).toLocaleString()
    : sym + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* -- Summary update -- */
function bkUpdateSummary() {
  const inVal  = document.getElementById('bk-in').value;
  const outVal = document.getElementById('bk-out').value;
  const get = id => document.getElementById(id);
  if (!get('sum-room')) return;

  get('sum-room').textContent   = bkRoomName;
  get('sum-guests').textContent = bkGuests + (bkGuests === 1 ? ' Guest' : ' Guests');
  get('sum-in').textContent     = inVal  ? fmtDisplay(inVal)  : '—';
  get('sum-out').textContent    = outVal ? fmtDisplay(outVal) : '—';
  get('sum-promo').textContent  = bkDiscount > 0 ? '-$' + bkDiscount + '/night' : 'None';

  if (inVal && outVal && outVal > inVal) {
    const nights   = Math.round((new Date(outVal) - new Date(inVal)) / 86400000);
    const totalUSD = (bkRoomUSD * bkGuests - bkDiscount) * nights;
    get('sum-nights').textContent = nights + (nights === 1 ? ' night' : ' nights');
    get('sum-rate').textContent   = bkFmt(bkRoomUSD) + ' / person / night';
    get('sum-total').textContent  = bkFmt(totalUSD);
  } else {
    get('sum-nights').textContent = '—';
    get('sum-rate').textContent   = bkFmt(bkRoomUSD) + ' / person / night';
    get('sum-total').textContent  = '—';
  }
}

/* ─────────────────────────────────────────
   BOOKING — SEND VIA WHATSAPP
───────────────────────────────────────── */
function bkSendWA() {
  const nama   = document.getElementById('bk-nama').value.trim();
  const email  = document.getElementById('bk-email').value.trim();
  const inVal  = document.getElementById('bk-in').value;
  const outVal = document.getElementById('bk-out').value;
  const pesan  = document.getElementById('bk-pesan').value.trim();
  const cur    = document.getElementById('bk-currency').value;

  if (!nama || !email || !inVal || !outVal) {
    alert('Please fill in all required fields including check-in and check-out dates.');
    return;
  }

  const nights   = Math.round((new Date(outVal) - new Date(inVal)) / 86400000);
  const total    = (bkRoomUSD * bkGuests - bkDiscount) * nights;

  // Save to admin dashboard
  adminSaveBooking({
    name: nama, email, room: bkRoomName, guests: bkGuests,
    checkIn: inVal, checkOut: outVal, nights, totalUSD: total,
    promo: bkPromoName, notes: pesan, status: 'new',
    createdAt: new Date().toISOString(),
  });

  const text =
    `Booking Paddarai Surf Lodge%0A` +
    `Name: ${encodeURIComponent(nama)}%0A` +
    `Email: ${encodeURIComponent(email)}%0A` +
    `Room: ${encodeURIComponent(bkRoomName)}%0A` +
    `Guests: ${bkGuests}%0A` +
    `Promo: ${encodeURIComponent(bkPromoName)}%0A` +
    `Check In: ${inVal}%0A` +
    `Check Out: ${outVal}%0A` +
    `Duration: ${nights} night(s)%0A` +
    `Currency: ${cur}%0A` +
    `Rate: $${bkRoomUSD}/person/night%0A` +
    `Total: ${encodeURIComponent(bkFmt(total))}%0A` +
    `Message: ${encodeURIComponent(pesan)}`;

  window.open('https://wa.me/6281374192584?text=' + text, '_blank');
}

function bkSendWAAnimated(e) {
  const btn  = e.currentTarget;
  addRipple(btn, e);
  btn.classList.add('sending');
  btn.textContent = 'Opening WhatsApp...';
  setTimeout(() => {
    btn.classList.remove('sending');
    btn.textContent = 'Send via WhatsApp →';
    bkSendWA();
  }, 550);
}

/* ─────────────────────────────────────────
   BOOKING — SEND VIA EMAIL
───────────────────────────────────────── */
function bkSendEmail() {
  const nama   = document.getElementById('bk-nama').value.trim();
  const email  = document.getElementById('bk-email').value.trim();
  const inVal  = document.getElementById('bk-in').value;
  const outVal = document.getElementById('bk-out').value;
  const pesan  = document.getElementById('bk-pesan').value.trim();
  const cur    = document.getElementById('bk-currency').value;

  if (!nama || !email || !inVal || !outVal) {
    alert('Please fill in all required fields including check-in and check-out dates.');
    return;
  }

  const nights = Math.round((new Date(outVal) - new Date(inVal)) / 86400000);
  const total  = (bkRoomUSD * bkGuests - bkDiscount) * nights;

  // Save to admin dashboard
  adminSaveBooking({
    name: nama, email, room: bkRoomName, guests: bkGuests,
    checkIn: inVal, checkOut: outVal, nights, totalUSD: total,
    promo: bkPromoName, notes: pesan, status: 'new',
    createdAt: new Date().toISOString(),
  });

  const subject = encodeURIComponent('Booking Request — Paddarai Surf Lodge');
  const body = encodeURIComponent(
`Booking Request — Paddarai Surf Lodge
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name       : ${nama}
Email      : ${email}
Room       : ${bkRoomName}
Guests     : ${bkGuests} Guest(s)
Promo      : ${bkPromoName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Check In   : ${inVal}
Check Out  : ${outVal}
Duration   : ${nights} Night(s)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Currency   : ${cur}
Rate       : $${bkRoomUSD} / person / night
Total      : ${bkFmt(total)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Additional Notes:
${pesan || '-'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent via Paddarai Surf Lodge Booking Form`
  );

  window.location.href = `mailto:paddaraisurflodge@gmail.com?subject=${subject}&body=${body}`;
}

function bkSendEmailAnimated(e) {
  const btn = e.currentTarget;
  addRipple(btn, e);
  btn.classList.add('sending');
  btn.textContent = 'Opening Email...';
  setTimeout(() => {
    btn.classList.remove('sending');
    btn.textContent = 'Send via Email →';
    bkSendEmail();
  }, 550);
}

/* -- Shared ripple helper -- */
function addRipple(btn, e) {
  const r    = document.createElement('span');
  r.className = 'ripple-wave';
  const size  = Math.max(btn.offsetWidth, btn.offsetHeight);
  const rect  = btn.getBoundingClientRect();
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
  btn.appendChild(r);
  setTimeout(() => r.remove(), 600);
}

/* ─────────────────────────────────────────
   VIEW ROOM FROM BOOKING PAGE
───────────────────────────────────────── */
function viewRoomFromBooking(roomId) {
  showPage('accommodation');
  setTimeout(() => {
    const slider = document.getElementById('slider-' + roomId);
    if (!slider) return;
    slider.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const card = slider.closest('.room-card');
    if (card) {
      card.style.outline = '2px solid var(--black)';
      setTimeout(() => { card.style.outline = ''; }, 1800);
    }
  }, 120);
}

/* ─────────────────────────────────────────
   ADMIN — LOCAL STORAGE DATA LAYER
───────────────────────────────────────── */
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'paddarai2026';

let adminBookings      = JSON.parse(localStorage.getItem('paddarai_bookings') || '[]');
let adminCurrentFilter = 'all';

function adminSaveBooking(b) {
  b.id = Date.now();
  adminBookings.unshift(b);
  localStorage.setItem('paddarai_bookings', JSON.stringify(adminBookings));
  // Refresh dashboard if it's currently open
  const dash = document.getElementById('admin-dashboard');
  if (dash && dash.style.display === 'block') adminRender();
}

function adminLogin() {
  const u   = document.getElementById('admin-user').value.trim();
  const p   = document.getElementById('admin-pass').value;
  const err = document.getElementById('admin-err');

  if (u === ADMIN_USER && p === ADMIN_PASS) {
    document.getElementById('admin-login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display    = 'block';
    adminRender();
  } else {
    err.style.display = 'block';
    setTimeout(() => { err.style.display = 'none'; }, 3000);
  }
}

function adminLogout() {
  document.getElementById('admin-login-screen').style.display = 'flex';
  document.getElementById('admin-dashboard').style.display    = 'none';
  document.getElementById('admin-user').value = '';
  document.getElementById('admin-pass').value = '';
}

function adminFilter(f) {
  adminCurrentFilter = f;
  document.querySelectorAll('[id^=filter-]').forEach(b => b.classList.remove('active'));
  document.getElementById('filter-' + f).classList.add('active');
  adminRender();
}

function adminChangeStatus(id, status) {
  const b = adminBookings.find(x => x.id === id);
  if (b) {
    b.status = status;
    localStorage.setItem('paddarai_bookings', JSON.stringify(adminBookings));
    adminRender();
  }
}

function adminDelete(id) {
  if (!confirm('Delete this booking?')) return;
  adminBookings = adminBookings.filter(x => x.id !== id);
  localStorage.setItem('paddarai_bookings', JSON.stringify(adminBookings));
  adminRender();
}

function adminAddSample() {
  const samples = [
    {
      name: 'Alex Torres', email: 'alex@surf.com', room: 'Room 2',
      guests: 2, checkIn: '2026-06-06', checkOut: '2026-06-13', nights: 7,
      totalUSD: 420, promo: '7 Nights Surf Package', notes: 'Intermediate surfer', status: 'confirmed',
    },
    {
      name: 'Yuki Tanaka', email: 'yuki@gmail.com', room: 'Room 1',
      guests: 3, checkIn: '2026-05-16', checkOut: '2026-05-23', nights: 7,
      totalUSD: 1050, promo: 'No Promo', notes: '', status: 'new',
    },
    {
      name: 'Sarah & Mark', email: 'sarah@email.com', room: 'Room 2',
      guests: 2, checkIn: '2026-07-11', checkOut: '2026-07-18', nights: 7,
      totalUSD: 420, promo: '7 Nights Surf Package', notes: 'Honeymoon trip', status: 'new',
    },
  ];
  const s = samples[Math.floor(Math.random() * samples.length)];
  s.createdAt = new Date().toISOString();
  adminSaveBooking(s);
  adminRender();
}

function adminExport() {
  if (!adminBookings.length) { alert('No bookings to export.'); return; }
  const headers = ['ID','Name','Email','Room','Guests','Check In','Check Out','Nights','Total USD','Promo','Status','Notes','Created'];
  const rows    = adminBookings.map(b => [
    b.id, b.name, b.email, b.room, b.guests,
    b.checkIn, b.checkOut, b.nights, b.totalUSD,
    b.promo, b.status, b.notes || '', b.createdAt,
  ]);
  const csv  = [headers, ...rows].map(r => r.map(v => '"' + String(v || '').replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'paddarai_bookings.csv';
  a.click();
}

function adminRender() {
  adminBookings = JSON.parse(localStorage.getItem('paddarai_bookings') || '[]');
  const filtered  = adminCurrentFilter === 'all'
    ? adminBookings
    : adminBookings.filter(b => b.status === adminCurrentFilter);

  const confirmed = adminBookings.filter(b => b.status === 'confirmed');
  const newB      = adminBookings.filter(b => b.status === 'new');

  // Stats
  document.getElementById('stat-total').textContent     = adminBookings.length;
  document.getElementById('stat-new').textContent       = newB.length;
  document.getElementById('stat-confirmed').textContent = confirmed.length;
  document.getElementById('stat-revenue').textContent   = '$' + confirmed.reduce((s, b) => s + (b.totalUSD || 0), 0).toLocaleString();
  document.getElementById('stat-guests').textContent    = adminBookings.reduce((s, b) => s + (b.guests || 0), 0);
  document.getElementById('stat-nights').textContent    = adminBookings.reduce((s, b) => s + (b.nights || 0), 0);

  // Room popularity bars
  const r1   = adminBookings.filter(b => b.room && b.room.includes('Room 1')).length;
  const r2   = adminBookings.filter(b => b.room && b.room.includes('Room 2')).length;
  const maxR = Math.max(r1, r2, 1);
  const setBar = (id, count) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.width = Math.round((count / maxR) * 100) + '%';
      el.querySelector('span').textContent = count || '';
    }
  };
  setBar('bar-r1', r1);
  setBar('bar-r2', r2);

  // Table rows
  const tbody      = document.getElementById('bookings-tbody');
  const emptyState = document.getElementById('empty-state');
  tbody.innerHTML  = '';

  if (!filtered.length) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach((b, i) => {
    const statusClass = {
      new:       'status-new',
      confirmed: 'status-confirmed',
      cancelled: 'status-cancelled',
    }[b.status] || 'status-new';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-muted);font-size:11px;">#${i + 1}</td>
      <td>
        <div style="font-weight:500;">${escHtml(b.name)}</div>
        <div style="font-size:11px;color:var(--text-muted);">${escHtml(b.email)}</div>
      </td>
      <td>${escHtml(b.room)}</td>
      <td>${b.checkIn}</td>
      <td>${b.checkOut}</td>
      <td>${b.nights}</td>
      <td>${b.guests}</td>
      <td style="font-weight:600;">$${(b.totalUSD || 0).toLocaleString()}</td>
      <td style="font-size:11px;color:var(--text-muted);">${b.promo === 'No Promo' ? '—' : escHtml(b.promo || '—')}</td>
      <td>
        <span class="status-badge ${statusClass}">
          <span style="width:6px;height:6px;border-radius:50%;background:currentColor;opacity:0.7;flex-shrink:0;display:inline-block"></span>
          ${b.status}
        </span>
      </td>
      <td>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          ${b.status !== 'confirmed'
            ? `<button onclick="adminChangeStatus(${b.id},'confirmed')" style="background:#e8f5e9;color:#2e7d32;border:none;padding:4px 8px;border-radius:3px;font-size:11px;cursor:pointer;font-family:'DM Sans';">✓</button>`
            : ''}
          ${b.status !== 'cancelled'
            ? `<button onclick="adminChangeStatus(${b.id},'cancelled')" style="background:#fce4e4;color:#c62828;border:none;padding:4px 8px;border-radius:3px;font-size:11px;cursor:pointer;font-family:'DM Sans';">✕</button>`
            : ''}
          <button onclick="adminDelete(${b.id})" style="background:var(--light-gray);color:var(--text-muted);border:none;padding:4px 8px;border-radius:3px;font-size:11px;cursor:pointer;font-family:'DM Sans';">Del</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* -- HTML escape helper -- */
function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─────────────────────────────────────────
   HIDDEN ADMIN ACCESS
   Click logo 5× within 2 seconds
───────────────────────────────────────── */
let logoClicks = 0;
let logoTimer  = null;

document.querySelector('.logo-wrap').addEventListener('click', function () {
  logoClicks++;
  clearTimeout(logoTimer);
  logoTimer = setTimeout(() => { logoClicks = 0; }, 2000);
  if (logoClicks >= 5) {
    logoClicks = 0;
    showPage('admin');
  }
});

/* ─────────────────────────────────────────
   INITIALISE ON LOAD
───────────────────────────────────────── */
bkUpdateSummary();
bkCheckPromoEligibility();
updateGuestUI();
updateNavActive('home');

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMob();
  }
});

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function initScrollAnims() {
  document.querySelectorAll('.scroll-anim').forEach(el => {
    scrollObserver.observe(el);
  });
}
initScrollAnims();
