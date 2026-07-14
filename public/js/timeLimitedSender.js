// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyBRggy_SxM6JRxmqkdgFaCN5vIckOz6yvg",
  authDomain: "safe-send-2d2aa.firebaseapp.com",
  projectId: "safe-send-2d2aa",
  storageBucket: "safe-send-2d2aa.appspot.com",
  messagingSenderId: "109214737857",
  appId: "1:109214737857:web:bddeb3a7c63e8e69adbb40",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM elements
const fileInput = document.getElementById('fileInput');
const expiryDateInput = document.getElementById('expiryDate');
const gracePeriodInput = document.getElementById('gracePeriod');
const setTimerBtn = document.getElementById('setTimerBtn');
const filesContainer = document.getElementById('filesContainer');
const notifications = document.getElementById('notifications');

let filesData = {};

// Add new files
setTimerBtn.addEventListener('click', () => {
  const selectedFiles = fileInput.files;
  const expiryTime = new Date(expiryDateInput.value).getTime();
  const gracePeriod = parseInt(gracePeriodInput.value) || 0;

  if (!selectedFiles.length) return alert("Select at least one file");
  if (!expiryDateInput.value) return alert("Set expiry date & time");

  Array.from(selectedFiles).forEach(file => {
    const fileId = `${file.name}-${Date.now()}`;
    filesData[fileId] = {
      name: file.name,
      expiryTime: expiryTime,
      gracePeriod: gracePeriod,
      active: true
    };

    db.ref(`files/${fileId}`).set(filesData[fileId]);
    renderFiles();
    startCountdown(fileId);
  });
});

// Render files in UI
function renderFiles() {
  filesContainer.innerHTML = "";
  Object.keys(filesData).forEach(id => {
    const file = filesData[id];
    const li = document.createElement('li');
    li.id = id;
    li.className = file.active ? '' : 'expired';
    li.innerHTML = `
      <span>${file.name} - <span class="timer">--:--:--</span> - Access: <span class="access">${file.active ? 'Active' : 'Expired'}</span></span>
      <button ${file.active ? '' : 'disabled'} class="extendBtn">Extend</button>
    `;
    filesContainer.appendChild(li);

    // Extend button
    li.querySelector('.extendBtn').addEventListener('click', () => {
      filesData[id].expiryTime += filesData[id].gracePeriod * 60000;
      filesData[id].active = true;
      db.ref(`files/${id}`).set(filesData[id]);
      addNotification(`✅ Access extended for "${filesData[id].name}" by ${filesData[id].gracePeriod} minutes.`);
    });
  });
}

// Countdown function per file
function startCountdown(fileId) {
  const interval = setInterval(() => {
    const file = filesData[fileId];
    if (!file) return clearInterval(interval);

    const now = new Date().getTime();
    let remaining = file.expiryTime - now;

    const li = document.getElementById(fileId);
    const timerSpan = li.querySelector('.timer');
    const accessSpan = li.querySelector('.access');

    if (remaining > 0) {
      let h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      let s = Math.floor((remaining % (1000 * 60)) / 1000);
      timerSpan.textContent = `${h}h ${m}m ${s}s`;
    } else {
      timerSpan.textContent = "00:00:00";
      accessSpan.textContent = "Expired";
      li.classList.add('expired');
      li.querySelector('button').disabled = true;
      file.active = false;
      db.ref(`files/${fileId}`).set(file);
      addNotification(`⚠ "${file.name}" expired and access disabled!`);
      clearInterval(interval);
    }
  }, 1000);
}

// Notifications
function addNotification(msg) {
  const p = document.createElement('p');
  p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  notifications.prepend(p); // newest on top
}
