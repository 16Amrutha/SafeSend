// Store selected plan & duration
let selectedPlan = null;
let selectedPrice = 0;
let selectedDuration = null;

// Select all pricing buttons
const pricingButtons = document.querySelectorAll('.pricing-btn');
pricingButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons in the same plan-card
    const siblings = btn.parentElement.querySelectorAll('.pricing-btn');
    siblings.forEach(sib => sib.classList.remove('active'));

    // Add active class to clicked button
    btn.classList.add('active');

    // Store selected plan info
    selectedPlan = btn.dataset.plan;
    selectedPrice = btn.dataset.price;
    selectedDuration = btn.dataset.duration;
  });
});

// Handle subscription button click
const subscribeButtons = document.querySelectorAll('.subscribe-btn');
subscribeButtons.forEach(subBtn => {
  subBtn.addEventListener('click', () => {
    if (!selectedPlan) {
      alert("Please select a subscription type (weekly/monthly/yearly) first!");
      return;
    }

    // Simulate subscription logic
    alert(`You subscribed to ${selectedPlan} (${selectedDuration}) for $${selectedPrice}.`);
    
    // Here you can redirect to payment gateway or store subscription info
    console.log(`Plan: ${selectedPlan}, Duration: ${selectedDuration}, Price: ${selectedPrice}`);
  });
});

// Handle Skip button
const skipBtn = document.getElementById('skipBtn');
skipBtn.addEventListener('click', () => {
  // Mark user as skipped for temporary access (optional)
  localStorage.setItem('skipSubscription', 'true');

  // Redirect to index.html
  window.location.href = 'index.html';
});
