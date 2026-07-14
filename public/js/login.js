// public/js/login.js
import { db } from "./firebase.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  /* ----- Elements ----- */
  const signupTab = document.getElementById("signupTab");
  const signinTab = document.getElementById("signinTab");
  const signupForm = document.getElementById("signupForm");
  const signinForm = document.getElementById("signinForm");

  const signupSubmit = document.getElementById("signupSubmit");
  const signinBtn = document.getElementById("signinBtn");

  const signupMessage = document.getElementById("signupMessage");
  const signinMessage = document.getElementById("signinMessage");

  /* ----- Tab Switch ----- */
  signinTab.onclick = () => toggleTab(true);
  signupTab.onclick = () => toggleTab(false);

  function toggleTab(showSignin) {
    if (showSignin) {
      signinTab.classList.add("active");
      signupTab.classList.remove("active");
      signinForm.classList.add("active");
      signupForm.classList.remove("active");
    } else {
      signupTab.classList.add("active");
      signinTab.classList.remove("active");
      signupForm.classList.add("active");
      signinForm.classList.remove("active");
    }
    signupMessage.textContent = "";
    signinMessage.textContent = "";
  }

  /* ----- Helper: hash password ----- */
  async function hashPassword(password) {
    if (!password) {
      throw new Error("Password is empty or undefined");
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /* ----- Sign Up ----- */
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    signupMessage.textContent = "";

    const nameInput = document.getElementById("signupName");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");
    const confirmPasswordInput = document.getElementById("signupConfirmPassword");

    if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
      signupMessage.textContent = "Form inputs not found!";
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!name || !email || !password || !confirmPassword) {
      signupMessage.textContent = "All fields are required.";
      return;
    }

    if (password !== confirmPassword) {
      signupMessage.textContent = "Passwords do not match.";
      return;
    }

    try {
      const userDoc = doc(db, "users", email);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        signupMessage.textContent = "Email already registered.";
        return;
      }

      const hashedPassword = await hashPassword(password);

      await setDoc(userDoc, {
        name,
        email,
        password: hashedPassword,
        createdAt: serverTimestamp()
      });

      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userEmail", email);
      signupMessage.textContent = "Signup successful! Redirecting…";
      setTimeout(() => window.location.href = "index.html", 1000);

    } catch (err) {
      signupMessage.textContent = "Signup failed: " + err.message;
    }
  });

  /* ----- Sign In ----- */
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    signinMessage.textContent = "";

    const emailInput = document.getElementById("signinEmail");
    const passwordInput = document.getElementById("signinPassword");

    if (!emailInput || !passwordInput) {
      signinMessage.textContent = "Form inputs not found!";
      return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      signinMessage.textContent = "All fields are required.";
      return;
    }

    try {
      const userDoc = doc(db, "users", email);
      const docSnap = await getDoc(userDoc);

      if (!docSnap.exists()) {
        signinMessage.textContent = "Email not registered.";
        return;
      }

      const userData = docSnap.data();
      const hashedPassword = await hashPassword(password);

      if (userData.password !== hashedPassword) {
        signinMessage.textContent = "Incorrect password.";
        return;
      }

      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userEmail", email);
      signinMessage.textContent = "Login successful! Redirecting…";
      setTimeout(() => window.location.href = "index.html", 1000);

    } catch (err) {
      signinMessage.textContent = "Login failed: " + err.message;
    }
  });

});
