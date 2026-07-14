const decryptFileInput = document.getElementById("decryptFileInput");
const decryptDropArea = document.getElementById("decryptDropArea");
const aesKeyInput = document.getElementById("aesKeyInput");
const decryptBtn = document.getElementById("decryptBtn");
const decryptedContainer = document.getElementById("decryptedContainer");
const decryptLoader = document.getElementById("decryptLoader");
const toast = document.getElementById("toast");

// --------------------- Toast Notification ---------------------
function showToast(message, duration = 2500) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), duration);
}

// --------------------- Drag & Drop ---------------------
decryptDropArea.addEventListener("dragover", e => {
  e.preventDefault();
  decryptDropArea.classList.add("hover");
});

decryptDropArea.addEventListener("dragleave", () => {
  decryptDropArea.classList.remove("hover");
});

decryptDropArea.addEventListener("drop", e => {
  e.preventDefault();
  decryptDropArea.classList.remove("hover");
  decryptFileInput.files = e.dataTransfer.files;
});

// --------------------- AES Key Import ---------------------
async function importAESKey(base64Key) {
  const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["decrypt"]);
}

// --------------------- Decrypt Data ---------------------
async function decryptData(encryptedBuffer, aesKey) {
  // IV is first 12 bytes
  const iv = encryptedBuffer.slice(0, 12);
  const ciphertext = encryptedBuffer.slice(12);

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, ciphertext);
  return decrypted;
}


// --------------------- Download Blob ---------------------
function downloadBlob(data, filename, type = "application/octet-stream") {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --------------------- Display Decrypted File ---------------------
function displayDecryptedFile(name, decryptedData) {
  const card = document.createElement("div");
  card.classList.add("fileItem");

  const leftDiv = document.createElement("div");
  const nameSpan = document.createElement("span");
  nameSpan.textContent = `📂 ${name.replace(".enc", "")} - Decrypted ✅`;

  const progressContainer = document.createElement("div");
  progressContainer.classList.add("progress-container");
  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");
  progressContainer.appendChild(progressBar);

  leftDiv.appendChild(nameSpan);
  leftDiv.appendChild(progressContainer);

  const rightDiv = document.createElement("div");
  const downloadBtn = document.createElement("button");
  downloadBtn.classList.add("downloadBtn");
  downloadBtn.textContent = "Download File";
  downloadBtn.addEventListener("click", () => {
    downloadBlob(decryptedData, name.replace(".enc", ""));
  });

  rightDiv.appendChild(downloadBtn);
  card.appendChild(leftDiv);
  card.appendChild(rightDiv);
  decryptedContainer.appendChild(card);

  // Animate progress bar
  let width = 0;
  const interval = setInterval(() => {
    if(width >= 100) clearInterval(interval);
    else { width += 10; progressBar.style.width = width + "%"; }
  }, 50);
}

// --------------------- Decrypt Button ---------------------
decryptBtn.addEventListener("click", async () => {
  const files = decryptFileInput.files;
  const base64Key = aesKeyInput.value.trim();

  if(!files.length) return showToast("Select an encrypted file.");
  if(!base64Key) return showToast("Paste the AES key first.");

  decryptLoader.classList.remove("hidden");
  const file = files[0];
  const fullBuffer = new Uint8Array(await file.arrayBuffer());

  try {
    const aesKey = await importAESKey(base64Key);
    const decrypted = await decryptData(fullBuffer, aesKey);
    displayDecryptedFile(file.name, decrypted);
    showToast("Decryption successful!");
  } catch (err) {
    console.error(err);
    showToast("Decryption failed! Check the AES key or file.");
  }

  decryptLoader.classList.add("hidden");
  decryptFileInput.value = "";
  aesKeyInput.value = "";
});
