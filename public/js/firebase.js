// public/js/firebase.js
// --- Firebase v9.22.0 modular CDN ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc,
  collection, query, where, orderBy, onSnapshot,
  serverTimestamp, addDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

import {
  getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import {
  getMessaging, getToken, onMessage, isSupported
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js";

import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// ✅ Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBRggy_SxM6JRxmqkdgFaCN5vIckOz6yvg",
  authDomain: "safe-send-2d2aa.firebaseapp.com",
  projectId: "safe-send-2d2aa",
  storageBucket: "safe-send-2d2aa.appspot.com",
  messagingSenderId: "109214737857",
  appId: "1:109214737857:web:bddeb3a7c63e8e69adbb40",
};

// === Init Firebase ===
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// ---------- Auth helper ----------
export async function ensureAuth() {
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) return resolve(user);
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        resolve(result.user);
      } catch (e) {
        reject(e);
      }
    });
  });
}

// ---------- Prefs ----------
export async function getUserPrefs(uid) {
  const ref = doc(db, "userNotificationPrefs", uid); // unified name
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : { email: false, push: false, mobile: false };
}

export async function saveUserPrefs(uid, prefs) {
  const ref = doc(db, "userNotificationPrefs", uid);
  await setDoc(ref, { ...prefs, updatedAt: serverTimestamp() }, { merge: true });
}

// ---------- Access logs listener (sender) ----------
export function listenToAccessLogs(uid, cb) {
  const q = query(
    collection(db, "fileAccessLogs"),
    where("ownerUid", "==", uid),
    orderBy("accessedAt", "desc")
  );
  return onSnapshot(q, cb);
}

// ---------- Messaging helper ----------
export async function setupMessaging(uid, vapidKey) {
  if (!(await isSupported())) return { supported: false };
  const messaging = getMessaging();

  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return { supported: true, enabled: false };

    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: reg });
    if (!token) return { supported: true, enabled: false };

    await addDoc(collection(db, "users", uid, "fcmTokens"), {
      token,
      platform: "web",
      createdAt: serverTimestamp()
    });

    onMessage(messaging, (payload) => {
      console.log("FCM foreground message:", payload);
    });

    return { supported: true, enabled: true, token };
  } catch (err) {
    console.error("setupMessaging error:", err);
    return { supported: true, enabled: false, error: err };
  }
}

// === Exports ===
export {
  app,
  auth,
  db,
  storage, storageRef, uploadBytes, getDownloadURL,
  collection, query, where, orderBy, onSnapshot, serverTimestamp, addDoc, doc
};
