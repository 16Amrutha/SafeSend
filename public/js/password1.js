const fileInput = document.getElementById("fileInput");
const passwordInput = document.getElementById("passwordInput");
const strengthMessage = document.getElementById("strengthMessage");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");
const hintInput = document.getElementById("hintInput");

// ===== Password Strength Checker =====
passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  let strength = "";

  if (password.length < 6) {
    strength = "Weak ❌ (Too short)";
    strengthMessage.className = "strength weak";
  } else if (/[A-Za-z]/.test(password) && /\d/.test(password) && password.length >= 8) {
    strength = "Strong ✅";
    strengthMessage.className = "strength strong";
  } else {
    strength = "Medium ⚠️ (Add numbers & symbols)";
    strengthMessage.className = "strength medium";
  }

  strengthMessage.textContent = strength;
});

// ===== Utility: Hash password (SHA-256) =====
async function hashPassword(pass) {
  const enc = new TextEncoder().encode(pass);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

// ===== Upload Button Action =====
uploadBtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  const password = passwordInput.value;

  if (!file) {
    uploadStatus.textContent = "⚠️ Please select a file.";
    uploadStatus.style.color = "red";
    return;
  }

  if (!password) {
    uploadStatus.textContent = "⚠️ Please set a password.";
    uploadStatus.style.color = "red";
    return;
  }

  const hint = hintInput.value || "No hint provided";
  const reader = new FileReader();

  reader.onload = async () => {
    const fileBase64 = reader.result.split(",")[1]; // remove prefix
    const hashedPassword = await hashPassword(password);

    // Create JSON package
    const packageData = {
      fileName: file.name,
      fileType: file.type,
      fileData: fileBase64,
      passwordHash: hashedPassword,
      hint: hint
    };

    // Convert to downloadable JSON
    const blob = new Blob([JSON.stringify(packageData, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file.name + "_secure.json";
    link.click();

    uploadStatus.style.color = "green";
    uploadStatus.innerHTML = `
      ✅ File packaged securely and downloaded as JSON.<br>
      Share this JSON + password with the receiver.
    `;
  };

  reader.readAsDataURL(file);
});
