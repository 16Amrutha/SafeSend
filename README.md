# Safe Send — Secure File Sharing

Safe Send is a static, browser-based web app for secure file sharing. It provides client-side encryption/decryption and optional features such as password protection, time-limited access, real-time notifications, and download tracking.

> Live hosting is configured via **Firebase Hosting** (see `firebase.json`).

---

## Features

- **End-to-End Encryption (E2EE)**
  - Encrypt files locally in your browser before uploading.
  - Decrypt locally on the receiver side using a shared AES key.
- **Password Protected**
  - Support for password-based access control (UI flow provided in the app).
- **Real-time Notifications**
  - Sender/receiver notifications are supported (Firebase + messaging hooks).
- **Time-Limited Access**
  - Optional expiration/time restriction for access to shared content.
- **Download Tracking**
  - Track access/download events (access logs + UI support).

---

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JS (static pages)
- **Web Crypto:** AES-GCM encryption/decryption in the browser
- **Firebase:**
  - **Authentication** (Auth helpers in `public/js/firebase.js`)
  - **Firestore** (document storage / access logs / prefs)
  - **Storage** (file storage helpers)
  - **Messaging / Push** (FCM/Web Push helper functions exist in `public/js/firebase.js`)
- **Hosting:** Firebase Hosting serves the `public/` directory

---

## Project Structure

- `firebase.json` — Firebase Hosting configuration
- `public/` — all web assets served by Firebase
  - `index.html` — Landing page + feature selection + redirect logic
  - `login.html` — Sign in / Sign up UI
  - `encryption.html` — Client-side encryption UI
  - `decrypt.html` — Client-side decryption UI
  - `password1.html`, `password2.html` — Password-protection related pages
  - `notificationSender.html` — Notification sender UI
  - `timeLimitedSender.html` — Time-limited access sender UI
  - `trackingSender.html` — Download tracking sender UI
  - `subscription.html` — Premium upgrade page
  - `404.html` — Not found page
  - `css/` — Styling
  - `js/` — App logic
    - `encryption.js` — AES-GCM key generation + file/note encryption
    - `decrypt.js` — AES-GCM key import + file decryption
    - `firebase.js` — Firebase config + Firestore/Auth/Storage/messaging helpers

---

## How Encryption Works (E2EE)

1. Open **`encryption.html`**.
2. Select one or more files (drag & drop supported).
3. Click **Encrypt Files**.
4. An **AES-GCM key** is generated in the browser and displayed in a modal.
5. The encrypted output is downloaded locally:
   - Encrypted file: `originalName.enc`
   - Optional encrypted note: `originalName_note.txt`
6. Share the AES key securely with the receiver.

---

## How Decryption Works

1. Open **`decrypt.html`**.
2. Drag & drop an encrypted file (e.g., `*.enc`) into the drop area.
3. Paste the **AES key** you received from the sender.
4. Click **Decrypt File**.
5. The decrypted file is downloaded locally.

---

## Running / Deploying

### Deploy to Firebase Hosting

1. Install Firebase CLI (if you don’t already have it):
   - `npm i -g firebase-tools`
2. Login:
   - `firebase login`
3. Deploy:
   - `firebase deploy`

Firebase Hosting is configured with:
- `public` as the deploy directory (see `firebase.json`).

---

## Configuration Notes

- Firebase project configuration is located in **`public/js/firebase.js`**.
- For production use, you should avoid committing sensitive credentials and tighten security rules in Firebase (Auth/Firestore/Storage rules).

---

## Troubleshooting

- **Push/notification features not working:**
  - Ensure browser notification permissions are granted.
  - Verify Firebase Messaging setup (service worker registration and VAPID key flow).
- **Decryption fails:**
  - Confirm you pasted the correct AES key.
  - Ensure the uploaded file is the correct encrypted format (`.enc`) produced by the app.

---
