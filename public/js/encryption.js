const fileInput = document.getElementById("fileInput");
const dragDropArea = document.getElementById("dragDropArea");
const encryptBtn = document.getElementById("encryptBtn");
const filesContainer = document.getElementById("filesContainer");
const loader = document.getElementById("loader");

// Modal Elements
const keyModal = document.getElementById("keyModal");
const aesKeyInput = document.getElementById("aesKeyInput");
const copyKeyBtn = document.getElementById("copyKeyBtn");
const closeModal = document.querySelector(".close");

// AES Encryption
async function generateAESKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt","decrypt"]);
}

async function exportKey(aesKey) {
  const raw = await crypto.subtle.exportKey("raw", aesKey);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

async function encryptData(data, aesKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, data);

  // Prepend IV to encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return combined; // now returns ciphertext + IV together
}


// Display File
function displayEncryptedFile(name, fileData, noteData, aesKeyB64) {
  const card = document.createElement("div");
  card.classList.add("fileItem");

  const leftDiv = document.createElement("div");
  const nameSpan = document.createElement("span");
  nameSpan.textContent = `🔒 ${name} - Encrypted ✅`;

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
    const blob = new Blob([fileData], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.enc`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const noteBtn = document.createElement("button");
  noteBtn.classList.add("downloadBtn");
  noteBtn.textContent = "Download Note";
  noteBtn.addEventListener("click", () => {
    if (!noteData) return alert("No note attached");
    const blob = new Blob([noteData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}_note.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  rightDiv.appendChild(downloadBtn);
  if(noteData) rightDiv.appendChild(noteBtn);

  card.appendChild(leftDiv);
  card.appendChild(rightDiv);
  filesContainer.appendChild(card);

  // Animate progress bar
  let width = 0;
  const interval = setInterval(() => {
    if(width >= 100) clearInterval(interval);
    else { width += 10; progressBar.style.width = width + "%"; }
  }, 50);

  // Show AES Key Modal
  aesKeyInput.value = aesKeyB64;
  keyModal.style.display = "flex";
}

// Modal Copy Button
copyKeyBtn.addEventListener("click", () => {
  aesKeyInput.select();
  aesKeyInput.setSelectionRange(0, 99999);
  document.execCommand("copy");
  alert("AES Key copied! Send it securely to the receiver.");
});

// Close Modal
closeModal.addEventListener("click", () => { keyModal.style.display = "none"; });
window.addEventListener("click", e => { if(e.target == keyModal) keyModal.style.display = "none"; });

// Drag & Drop
dragDropArea.addEventListener("dragover", e => { e.preventDefault(); dragDropArea.classList.add("hover"); });
dragDropArea.addEventListener("dragleave", () => dragDropArea.classList.remove("hover"));
dragDropArea.addEventListener("drop", e => {
  e.preventDefault();
  dragDropArea.classList.remove("hover");
  fileInput.files = e.dataTransfer.files;
});

// Encrypt Button
encryptBtn.addEventListener("click", async () => {
  const files = fileInput.files;
  const noteText = document.getElementById("note").value.trim();

  if (!files.length) return alert("Select files first.");
  loader.classList.remove("hidden");

  for (const file of files) {
    const aesKey = await generateAESKey();
    const aesKeyB64 = await exportKey(aesKey);

    // ✅ Encrypt file properly
    const fileBuffer = await file.arrayBuffer();
    const encryptedFile = await encryptData(fileBuffer, aesKey);

    // ✅ Encrypt note properly
    let noteEncrypted = null;
    if (noteText) {
      const encoder = new TextEncoder();
      const noteBuffer = encoder.encode(noteText);
      noteEncrypted = await encryptData(noteBuffer, aesKey);
    }

    displayEncryptedFile(file.name, encryptedFile, noteEncrypted, aesKeyB64);
  }

  loader.classList.add("hidden");
  fileInput.value = "";
  document.getElementById("note").value = "";
});

