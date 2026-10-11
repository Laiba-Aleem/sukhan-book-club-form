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