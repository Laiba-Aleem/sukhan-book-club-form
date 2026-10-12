# Sukhan | Book Club Registration Form

A registration form for **Sukhan**, a fictional Urdu–English book club. Readers enter through an illustrated opening screen with an ink-spread transition, fill in the form, and every registration is saved as a new row in a Google Sheet.

## Live Site

[add your GitHub Pages link here]

## Screenshots

**Opening screen**

<img width="1365" height="639" alt="image" src="https://github.com/user-attachments/assets/a2de41a0-34a3-434d-a79f-21dd4bd9fa15" />


**Registration form**

<img width="1365" height="640" alt="image" src="https://github.com/user-attachments/assets/7912fda6-52b0-4e69-b359-6456f1bbe3e4" />


**On mobile**

<img width="234" height="519" alt="image" src="https://github.com/user-attachments/assets/6d961508-bd23-4a72-b354-956fce96a60d" />


**Entries saved in Google Sheets** (sample data only)

<img width="1021" height="638" alt="image" src="https://github.com/user-attachments/assets/23f91d78-0b52-4e53-a32b-d401d692cee4" />


## Tech Stack

- HTML5, CSS3 (custom properties, Flexbox, media queries), Bootstrap 5
- JavaScript (vanilla): validation, `fetch`, ink transition
- Google Apps Script and Google Sheets (backend)
- Google Fonts: Cormorant Garamond, DM Sans

## Features

- Opening screen with a different artwork for landscape and portrait screens
- Ink-spread transition into the form (plain CSS and JS); skipped for users who prefer reduced motion
- Responsive split layout: sticky book photo on laptop, banner on phones
- Chip-style choices for genres, reading language and how the reader will join
- Form validation: required fields, email format, phone number, at least one attendance choice
- Submissions saved to Google Sheets with an automatic timestamp
- Submit button locks while sending, so a double click cannot create two entries
- Server-side check and a lock in the script, so simultaneous submissions do not overwrite each other

## How It Works

```
Form (HTML + JS)  →  fetch POST  →  Google Apps Script (doPost)  →  Google Sheet
```

## How to Run Locally

1. Clone the repository
2. Open the folder in VS Code and start **Live Server** on `index.html`

To use your own Sheet: create a Sheet with the headers `Timestamp | Name | Email | WhatsApp | City | Genres | Language | Book | Attendance`, paste `apps-script/Code.gs` into **Extensions → Apps Script**, deploy it as a web app (*Execute as: Me*, *Access: Anyone*), and paste the web app URL into `SCRIPT_URL` in `js/script.js`.

## Project Structure

```
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   └── intro.js
├── images/
├── apps-script/
│   └── Code.gs
└── screenshots/
```

## Future Improvements

- Duplicate-email check and a confirmation email to the reader
- Spam protection (the web app URL is visible in the page source)

## Built By

Laiba Aleem | 2026
