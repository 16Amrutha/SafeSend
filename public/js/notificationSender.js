// === Firebase imports ===
import {
  db,
  ensureAuth,
  getUserPrefs,
  saveUserPrefs,
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "./firebase.js";

// UI references
const activityFeed = document.getElementById("activityFeed");
const notifyEmail = document.getElementById("notifyEmail");
const notifyPush = document.getElementById("notifyPush");
const notifyMobile = document.getElementById("notifyMobile");
const saveBtn = document.getElementById("savePrefsBtn");
const toast = document.getElementById("toast");

let currentUser = null;

// Show toast
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Load preferences for logged in user
async function loadPrefs(uid) {
  const prefs = await getUserPrefs(uid);
  notifyEmail.checked = prefs.email || false;
  notifyPush.checked = prefs.push || false;
  notifyMobile.checked = prefs.mobile || false;
}

// Save preferences
async function savePrefs() {
  if (!currentUser) return;
  const prefs = {
    email: notifyEmail.checked,
    push: notifyPush.checked,
    mobile: notifyMobile.checked,
  };
  await saveUserPrefs(currentUser.uid, prefs);
  showToast("Preferences saved ✅");
}

// Listen for save click
saveBtn.addEventListener("click", savePrefs);

// Real-time file activity listener
function listenToActivity(uid) {
  const q = query(
    collection(db, "fileAccessLogs"),
    where("ownerUid", "==", uid),
    orderBy("accessedAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    activityFeed.innerHTML = "";
    if (snapshot.empty) {
      activityFeed.innerHTML = "<li class='empty'>No activity yet 🚀</li>";
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.classList.add("activity-item");
      li.innerHTML = `
        <div class="icon">📂</div>
        <div class="details">
          <p><strong>${data.accessedByName}</strong> accessed <em>${data.fileName}</em></p>
          <span class="time">${data.accessedAt?.toDate?.().toLocaleString?.() || "just now"}</span>
        </div>
      `;
      activityFeed.appendChild(li);
    });
  });
}

// === Init ===
(async () => {
  try {
    currentUser = await ensureAuth("Owner");
    await loadPrefs(currentUser.uid);
    listenToActivity(currentUser.uid);
  } catch (err) {
    console.error("Error initializing notification sender:", err);
    showToast("⚠️ Error loading dashboard");
  }
})();
