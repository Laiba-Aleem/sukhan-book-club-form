// ------------------------------------------------------------
// Sukhan form: validate -> send to Google Apps Script -> show result
// ------------------------------------------------------------

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxGPDSkXliqmu2Od8S2OJ9rc6lxjng-EkVi1L6VhnXR4daINu9K4aOtiX9dmthaF3b-/exec';

// grab the elements we need once
const form       = document.getElementById('sukhanForm');
const submitBtn  = document.getElementById('submitBtn');
const message    = document.getElementById('formMessage');
const successBox = document.getElementById('successBox');
const againBtn   = document.getElementById('againBtn');

// ---------- helpers ----------
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// remove spaces/dashes, then accept 10-15 digits with an optional leading +
const cleanPhone = (v) => v.replace(/[\s-]/g, '');
const isPhone    = (v) => /^\+?\d{10,15}$/.test(cleanPhone(v));

function clearErrors() {
  form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  document.getElementById('languageError').hidden   = true;
  document.getElementById('attendanceError').hidden = true;
  message.hidden = true;
}

// returns true only if everything is fine
function validate() {
  clearErrors();
  let firstBad = null;                       // so we can focus the first mistake

  const flag = (el) => { el.classList.add('is-invalid'); firstBad = firstBad || el; };

  const name = form.elements.name;
  if (name.value.trim().length < 2) flag(name);

  const email = form.elements.email;
  if (!isEmail(email.value.trim())) flag(email);

  const phone = form.elements.whatsapp;
  if (!isPhone(phone.value)) flag(phone);

  // language: one radio must be chosen
  if (!form.querySelector('input[name="language"]:checked')) {
    document.getElementById('languageError').hidden = false;
    firstBad = firstBad || document.getElementById('lang1');
  }

  // attendance: at least one checkbox
  if (!form.querySelector('input[name="attendance"]:checked')) {
    document.getElementById('attendanceError').hidden = false;
    firstBad = firstBad || document.getElementById('att1');
  }

  if (firstBad) firstBad.focus();
  return !firstBad;
}

// ---------- when the user fixes something, remove its error ----------
form.addEventListener('input', (e) => {
  e.target.classList.remove('is-invalid');
  if (e.target.name === 'language')   document.getElementById('languageError').hidden = true;
  if (e.target.name === 'attendance') document.getElementById('attendanceError').hidden = true;
});

// ---------- submit ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();                        // stop the browser from reloading the page
  if (!validate()) return;

  // FormData reads every field by its name="" ; URLSearchParams keeps repeated names (genres)
  const data = new URLSearchParams(new FormData(form));
  data.set('name',     form.elements.name.value.trim());
  data.set('whatsapp', cleanPhone(form.elements.whatsapp.value));

  submitBtn.disabled = true;                 // no double clicks
  submitBtn.textContent = 'Sending…';

  try {
    const response = await fetch(SCRIPT_URL, { method: 'POST', body: data });
    const result   = await response.json();

    if (result.result !== 'success') throw new Error(result.message || 'Unknown error');

    form.hidden = true;                      // hide the form, show the thank-you
    successBox.hidden = false;
    form.reset();
  } catch (err) {
    console.error(err);
    message.textContent = 'Something went wrong. Please try again in a moment.';
    message.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Join the circle';
  }
});

// "Register another reader"
againBtn.addEventListener('click', () => {
  successBox.hidden = true;
  form.hidden = false;
  clearErrors();
});
// ------------------------------------------------------------
// Opening screen: click "Enter the circle" -> ink spreads -> form appears
// ------------------------------------------------------------

const intro    = document.getElementById('intro');
const enterBtn = document.getElementById('enterBtn');
const inkLayer = intro.querySelector('.ink-layer');
const main     = document.querySelector('main');

// users who asked their device for less motion get no ink animation
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const INK_GREENS = ['#1B4332', '#14352A', '#1B4332', '#234F3C'];
const rand = (min, max) => min + Math.random() * (max - min);

// a random "organic" border-radius so every blot is a different blob, not a perfect circle
function blobRadius() {
  const r = () => Math.round(rand(38, 62));
  return `${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`;
}

function addInk(xPct, yPct, sizeVmax, delayMs, color) {
  const el = document.createElement('span');
  el.className = 'ink';
  el.style.left   = xPct + '%';
  el.style.top    = yPct + '%';
  el.style.width  = sizeVmax + 'vmax';
  el.style.height = sizeVmax + 'vmax';
  el.style.background = color;
  el.style.borderRadius = blobRadius();
  el.style.animationDelay = Math.round(delayMs) + 'ms';
  inkLayer.appendChild(el);
}

function playInk() {
  // where the button is, in % of the screen: the ink starts there
  const b  = enterBtn.getBoundingClientRect();
  const ox = ((b.left + b.width / 2) / window.innerWidth)  * 100;
  const oy = ((b.top + b.height / 2) / window.innerHeight) * 100;

  // 1) small droplets splashing around the button
  for (let i = 0; i < 14; i++) {
    const angle  = rand(0, Math.PI * 2);
    const radius = rand(4, 28);                       // distance in %
    const x = ox + Math.cos(angle) * radius;
    const y = oy + Math.sin(angle) * radius * 1.4;
    const gold = Math.random() < 0.25;
    addInk(x, y, rand(2.5, 8), rand(0, 160), gold ? '#A9843A' : INK_GREENS[i % 4]);
  }

  // 2) big blots on a 3x3 grid (with jitter) so the whole screen gets covered
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 17 + col * 33 + rand(-8, 8);
      const y = 17 + row * 33 + rand(-8, 8);
      const dist = Math.hypot(x - ox, y - oy);        // further from the button = later
      addInk(x, y, rand(55, 75), 60 + dist * 4.5, INK_GREENS[(row + col) % 4]);
    }
  }
}

function openForm() {
  document.body.classList.remove('intro-active');     // lets the form fade in (CSS)
  main.removeAttribute('inert');                      // form becomes clickable again
  intro.classList.add('is-open');                     // hides the opening, ink fades out
  setTimeout(() => intro.remove(), 1500);             // clean up when everything is done
}

enterBtn.addEventListener('click', () => {
  enterBtn.disabled = true;                           // no double clicks
  if (reduceMotion) {
    openForm();
  } else {
    playInk();
    setTimeout(openForm, 850);                        // by now the ink covers the screen
  }
});