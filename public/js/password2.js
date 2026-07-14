const packageInput = document.getElementById("packageInput");
const accessBtn = document.getElementById("accessBtn");
const accessStatus = document.getElementById("accessStatus");
const hintSection = document.getElementById("hintSection");

let packageData = null;

// ===== Read uploaded package (JSON) =====
packageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      packageData = JSON.parse(event.target.result);

      // Show hint if available
      hintSection.textContent = packageData.hint
        ? `💡 Hint: ${packageData.hint}`
        : "No hint provided.";

      accessStatus.textContent = "✅ Package loaded. Enter password.";
      accessStatus.style.color = "green";
    } catch (err) {
      accessStatus.textContent = "❌ Invalid package file.";
      accessStatus.style.color = "red";
    }
  };
  reader.readAsText(file);
});

// ===== Hash password (SHA-256) =====
async function hashPassword(pass) {
  const enc = new TextEncoder().encode(pass);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

// ===== Verify and Download =====
accessBtn.addEventListener("click", () => {
  if (!packageData) {
    accessStatus.textContent = "⚠️ Please upload a valid package first.";
    accessStatus.style.color = "orange";
    return;
  }

  const enteredPassword = document.getElementById("passwordInput").value.trim();
  if (!enteredPassword) {
    accessStatus.textContent = "⚠️ Please enter the password.";
    accessStatus.style.color = "orange";
    return;
  }

  hashPassword(enteredPassword).then((hashed) => {
    if (hashed === packageData.passwordHash) {  // ✅ Fixed key name
      accessStatus.textContent = "✅ Password correct! Downloading file...";
      accessStatus.style.color = "green";

      // Restore original file from Base64
      const byteChars = atob(packageData.fileData);
      const byteNumbers = new Array(byteChars.length)
        .fill(0)
        .map((_, i) => byteChars.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], { type: packageData.fileType });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = packageData.fileName;
      a.click();
    } else {
      accessStatus.textContent = "❌ Incorrect password!";
      accessStatus.style.color = "red";
    }
  });
});
