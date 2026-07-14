// Firebase config (replace with your own)
const firebaseConfig = {
  apiKey: "AIzaSyBRggy_SxM6JRxmqkdgFaCN5vIckOz6yvg",
  authDomain: "safe-send-2d2aa.firebaseapp.com",
  projectId: "safe-send-2d2aa",
  storageBucket: "safe-send-2d2aa.appspot.com",
  messagingSenderId: "109214737857",
  appId: "1:109214737857:web:bddeb3a7c63e8e69adbb40",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const tableBody = document.querySelector('#downloadsTable tbody');
const alertsDiv = document.getElementById('alerts');
const exportBtn = document.getElementById('exportBtn');

// Fetch download logs from Firestore
function fetchDownloads() {
  db.collection("downloads").orderBy("timestamp", "desc").onSnapshot(snapshot => {
    tableBody.innerHTML = "";
    let downloadCount = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.username}</td>
        <td>${data.email}</td>
        <td>${new Date(data.timestamp.seconds * 1000).toLocaleString()}</td>
        <td>${data.ip || 'N/A'}</td>
      `;
      tableBody.appendChild(tr);

      // Count downloads per user
      downloadCount[data.email] = (downloadCount[data.email] || 0) + 1;
    });

    // Alert if multiple downloads
    alertsDiv.innerHTML = "";
    for (let email in downloadCount) {
      if (downloadCount[email] > 1) {
        const alertMsg = document.createElement("div");
        alertMsg.textContent = `Alert: ${email} downloaded the file ${downloadCount[email]} times!`;
        alertsDiv.appendChild(alertMsg);
      }
    }

    drawChart(snapshot);
  });
}

// Draw chart
function drawChart(snapshot) {
  const counts = {};
  snapshot.forEach(doc => {
    const date = new Date(doc.data().timestamp.seconds * 1000).toLocaleDateString();
    counts[date] = (counts[date] || 0) + 1;
  });

  const ctx = document.getElementById('downloadsChart').getContext('2d');
  if (window.downloadsChartInstance) window.downloadsChartInstance.destroy();
  window.downloadsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Downloads per Day',
        data: Object.values(counts),
        borderColor: '#ff4c4c',
        backgroundColor: 'rgba(255,76,76,0.2)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });
}

// Export CSV
exportBtn.addEventListener("click", () => {
  let csv = "Username,Email,Timestamp,IP\n";
  tableBody.querySelectorAll("tr").forEach(tr => {
    const row = Array.from(tr.children).map(td => td.textContent);
    csv += row.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'download_logs.csv';
  a.click();
});

// Initialize
fetchDownloads();
