// =======================
// Firebase Initialization
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyBRggy_SxM6JRxmqkdgFaCN5vIckOz6yvg",
  authDomain: "safe-send-2d2aa.firebaseapp.com",
  projectId: "safe-send-2d2aa",
  storageBucket: "safe-send-2d2aa.appspot.com",
  messagingSenderId: "109214737857",
  appId: "1:109214737857:web:bddeb3a7c63e8e69adbb40",
};
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const db = firebase.firestore();

// =======================
// Element References
// =======================
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileDetails = document.getElementById('fileDetails');
const fileList = document.getElementById('fileList');
const browseBtn = uploadBox.querySelector('.browse-btn');
const getStartedBtn = document.getElementById('getStartedBtn');
const uploadSection = document.getElementById('upload');
const uploadBtn = document.getElementById('uploadBtn');

const featureCards = document.querySelectorAll('.feature-card');
const modal = document.getElementById('featureModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const closeModalBtn = document.getElementById('closeModal');
const featureContinueBtn = document.getElementById('featureContinueBtn');

const subscriptionModal = document.getElementById('subscriptionModal');
const closeSubBtn = document.getElementById('closeSub');
const upgradeBtn = document.getElementById('upgradeBtn');
const skipBtn = document.getElementById('skipBtn');

const encDecModal = document.getElementById('encDecModal');
const closeEncDecBtn = document.getElementById('closeEncDec');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');

const roleModal = document.getElementById('roleModal');
const closeRoleBtn = document.getElementById('closeRole');
const senderBtn = document.getElementById('senderBtn');
const receiverBtn = document.getElementById('receiverBtn');

let selectedFiles = [];
let selectedFeature = '';
let selectedType = '';

// =======================
// File Upload Handlers
// =======================
browseBtn.addEventListener('click', () => fileInput.click());

uploadBox.addEventListener('dragover', e => {
  e.preventDefault();
  uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));

uploadBox.addEventListener('drop', e => {
  e.preventDefault();
  uploadBox.classList.remove('dragover');
  addFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => addFiles(fileInput.files));

function addFiles(files) {
  const allowedTypes = [
    'image/png','image/jpeg','application/pdf','text/plain',
    'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  for(let file of files){
    if(!allowedTypes.includes(file.type)){
      alert(`${file.name} is not supported.`);
      continue;
    }
    if(!selectedFiles.some(f => f.name === file.name && f.size === file.size)){
      selectedFiles.push(file);
    }
  }
  renderFileList();
}

function renderFileList() {
  fileList.innerHTML = '';
  selectedFiles.forEach((file,index)=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${file.name} (${Math.round(file.size/1024)} KB)</span> <span class="delete-btn" role="button" tabindex="0">✖</span>`;
    fileList.appendChild(li);
    setTimeout(()=>li.classList.add('show'), index*100);
    li.querySelector('.delete-btn').addEventListener('click',()=>{
      selectedFiles.splice(index,1);
      renderFileList();
    });
  });
  fileDetails.style.display = selectedFiles.length>0?'block':'none';
  uploadBtn.disabled = selectedFiles.length===0;
}

getStartedBtn.addEventListener('click', e=>{
  e.preventDefault();
  uploadSection.scrollIntoView({behavior:'smooth'});
  uploadSection.classList.add('show');
});

uploadBtn.addEventListener('click', ()=>{
  if(selectedFiles.length===0) return alert("No files selected!");
  const tick = document.getElementById('tick');
  const uploadMessage = document.getElementById('uploadMessage');
  if(tick) tick.style.display='none';
  if(uploadMessage) uploadMessage.style.display='none';
  let percent=0;
  const interval=setInterval(()=>{
    percent+=2;
    if(percent>100) percent=100;
    if(percent===100){
      clearInterval(interval);
      if(tick) tick.style.display='block';
      if(uploadMessage){
        uploadMessage.innerHTML='<h3 style="color:#68e986;">Files Uploaded Successfully!</h3>';
        uploadMessage.style.display='block';
      }
      selectedFiles=[];
      renderFileList();
    }
  },50);
});

// =======================
// Feature Card Handling
// =======================
function revealCards(){
  const windowHeight = window.innerHeight;
  featureCards.forEach(card=>{
    const cardTop = card.getBoundingClientRect().top;
    if(cardTop<windowHeight-100) card.classList.add('show');
  });
}

featureCards.forEach(card=>{
  card.addEventListener('click', ()=>{
    modalTitle.textContent=card.querySelector('h3').textContent;
    modalDescription.textContent=card.querySelector('p').textContent;
    modal.style.display='flex';
    featureContinueBtn.dataset.feature = card.dataset.feature;
    featureContinueBtn.dataset.type = card.dataset.type;
  });
});

closeModalBtn.addEventListener('click',()=>modal.style.display='none');
closeSubBtn.addEventListener('click',()=>subscriptionModal.style.display='none');
closeEncDecBtn.addEventListener('click',()=>encDecModal.style.display='none');
closeRoleBtn.addEventListener('click',()=>roleModal.style.display='none');

window.addEventListener('click',e=>{
  if(e.target===modal) modal.style.display='none';
  if(e.target===subscriptionModal) subscriptionModal.style.display='none';
  if(e.target===encDecModal) encDecModal.style.display='none';
  if(e.target===roleModal) roleModal.style.display='none';
});
window.addEventListener('keyup',e=>{
  if(e.key==='Escape'){
    modal.style.display='none';
    subscriptionModal.style.display='none';
    encDecModal.style.display='none';
    roleModal.style.display='none';
  }
});

encryptBtn.addEventListener('click',()=>{
  encDecModal.style.display='none';
  window.location.href='encryption.html';
});
decryptBtn.addEventListener('click',()=>{
  encDecModal.style.display='none';
  window.location.href='decrypt.html';
});

upgradeBtn?.addEventListener('click',()=>window.location.href='subscription.html');
skipBtn?.addEventListener('click',()=>{
  localStorage.setItem('skipSubscription','true');
  subscriptionModal.style.display='none';
  const feature = localStorage.getItem('pendingPremiumFeature');
  if(feature){
    const keyFeatures={
      "Real-time Notifications":"notification.html",
      "Time-Limited Access":"time-limited.html",
      "Download Tracking":"download-tracking.html"
    };
    localStorage.removeItem('pendingPremiumFeature');
    window.location.href = keyFeatures[feature];
  }
});

// Feature Continue → Role Modal for free features
featureContinueBtn.addEventListener('click',()=>{
  selectedFeature=featureContinueBtn.dataset.feature;
  selectedType=featureContinueBtn.dataset.type;
  if(localStorage.getItem("loggedIn")!=="true"){
    localStorage.setItem('redirectFeature', selectedFeature);
    localStorage.setItem('redirectFeatureType', selectedType);
    window.location.href='login.html';
    return;
  }
  modal.style.display='none';
  if(selectedType==="free"){
    roleModal.style.display='flex';
  }else{
    redirectUser("sender");
  }
});

// Sender/Receiver flow
senderBtn.addEventListener('click',()=>redirectUser("sender"));
receiverBtn.addEventListener('click',()=>redirectUser("receiver"));

function redirectUser(role){
  roleModal.style.display='none';
  const redirectMap={
    "End-to-End Encryption":{sender:"encryption.html",receiver:"decrypt.html"},
    "Password Protected":{sender:"password1.html",receiver:"password2.html"},
    "Real-time Notifications":{sender:"notificationSender.html",receiver:"notificationReceiver.html"},
    "Time-Limited Access":{sender:"timeLimitedSender.html",receiver:"timeLimitedReceiver.html"},
    "Download Tracking":{sender:"trackingSender.html",receiver:"trackingReceiver.html"}
  };
  const targetPage=redirectMap[selectedFeature][role];
  if(selectedType==="premium"){
    const skipped = localStorage.getItem('skipSubscription')==='true';
    if(!skipped){
      localStorage.setItem('pendingPremiumFeature',selectedFeature);
      subscriptionModal.style.display='flex';
      return;
    }
  }
  if(targetPage) window.location.href=targetPage;
}

// Initial load
window.addEventListener('load',()=>{
  revealCards();
  featureCards.forEach(card=>card.classList.add('show'));
});

// Login button toggle
const loginBtn = document.getElementById("loginBtn");
if(localStorage.getItem("loggedIn")==="true"){
  loginBtn.innerText="Logout";
  loginBtn.href="#";
  loginBtn.onclick=()=>{
    localStorage.removeItem("loggedIn");
    window.location.reload();
  };
}
window.addEventListener('scroll',revealCards);

