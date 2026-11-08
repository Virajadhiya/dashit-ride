// DashIt Passenger Web App Core Logic
// DashIt Private Limited

// State variables
let currentCity = 'Bangalore';
let map, userMarker, routePolyline;
let nearbyCaptains = [];
let assignedCaptainMarker = null;
let currentBooking = {
  service: 'bike',
  serviceName: 'DashIt Bike',
  fare: 48,
  pickup: 'Indiranagar 100ft Road, Metro Gate 2',
  drop: 'Sony World Junction, Koramangala',
  distance: 4.8,
  otp: '5829'
};

let audioCtx = null;
let isTrackingInterval = null;

// Audio Synthesizer for High-Tech Sound FX
function playTone(freq, type = 'sine', duration = 0.15, vol = 0.2) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio unsupported or user hasn't interacted yet
  }
}

function playSuccessChime() {
  playTone(587.33, 'sine', 0.12, 0.25); // D5
  setTimeout(() => playTone(880, 'sine', 0.25, 0.3), 120); // A5
}

function playRadarPing() {
  playTone(920, 'triangle', 0.1, 0.15);
}

function playCelebrationFanfare() {
  playTone(523.25, 'triangle', 0.1, 0.2);
  setTimeout(() => playTone(659.25, 'triangle', 0.1, 0.2), 100);
  setTimeout(() => playTone(783.99, 'triangle', 0.1, 0.2), 200);
  setTimeout(() => playTone(1046.50, 'sine', 0.35, 0.3), 300);
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  updateLiveClock();
  setInterval(updateLiveClock, 30000);

  initLeafletMap();
  registerServiceWorker();
});

// Live Status Bar Clock
function updateLiveClock() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const timeElem = document.getElementById('liveTime');
  if (timeElem) timeElem.textContent = `${hours}:${minutes}`;
}

// Leaflet Map Initialization
function initLeafletMap() {
  // Bangalore coordinates
  const defaultLat = 12.9716;
  const defaultLng = 77.6412;

  map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([defaultLat, defaultLng], 14);

  // Clean OpenStreetMap Tiles (100% Free, NO API key required, NO watermark)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Ensure map tiles calculate correct container dimensions on deployment
  setTimeout(() => { if (map) map.invalidateSize(); }, 150);
  setTimeout(() => { if (map) map.invalidateSize(); }, 500);
  setTimeout(() => { if (map) map.invalidateSize(); }, 1200);
  window.addEventListener('resize', () => { if (map) map.invalidateSize(); });

  // Add User Marker
  const userIcon = L.divIcon({
    className: 'custom-user-pin',
    html: `
      <div class="user-marker-pulse">
        <div class="user-marker-ring"></div>
        <div class="user-marker-dot"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  userMarker = L.marker([defaultLat, defaultLng], { icon: userIcon }).addTo(map);

  // Spawn Nearby Captains (Simulated moving fleet)
  spawnNearbyCaptains(defaultLat, defaultLng);
}

// Spawn simulated nearby DashIt captains
function spawnNearbyCaptains(centerLat, centerLng) {
  // Clear existing
  nearbyCaptains.forEach(c => map.removeLayer(c.marker));
  nearbyCaptains = [];

  const types = [
    { type: 'bike', icon: '🏍️', name: 'DashIt Bike', label: '2m' },
    { type: 'bike', icon: '🏍️', name: 'DashIt Bike', label: '3m' },
    { type: 'auto', icon: '🛺', name: 'DashIt Auto', label: '4m' },
    { type: 'auto', icon: '🛺', name: 'DashIt Auto', label: '5m' },
    { type: 'cab', icon: '🚗', name: 'DashIt Cab', label: '6m' },
    { type: 'cab', icon: '🚗', name: 'DashIt Cab', label: '8m' },
  ];

  types.forEach((item, index) => {
    // Generate slight offset
    const angle = (index * 60) * (Math.PI / 180);
    const dist = 0.003 + (index * 0.0015);
    const lat = centerLat + Math.cos(angle) * dist;
    const lng = centerLng + Math.sin(angle) * dist;

    const captainIcon = L.divIcon({
      className: 'captain-marker-pin',
      html: `
        <div class="captain-vehicle-marker" id="capMarker-${index}">
          <div class="captain-vehicle-bubble">
            <span>${item.icon}</span>
            <span>${item.label}</span>
          </div>
        </div>
      `,
      iconSize: [40, 30],
      iconAnchor: [20, 15]
    });

    const marker = L.marker([lat, lng], { icon: captainIcon }).addTo(map);
    nearbyCaptains.push({
      id: index,
      marker: marker,
      lat: lat,
      lng: lng,
      angle: angle,
      type: item.type
    });
  });

  // Micro-roaming simulation
  setInterval(() => {
    nearbyCaptains.forEach(c => {
      c.lat += (Math.random() - 0.5) * 0.0003;
      c.lng += (Math.random() - 0.5) * 0.0003;
      c.marker.setLatLng([c.lat, c.lng]);
    });
  }, 3000);
}

// City Switcher
function switchCityPrompt() {
  const cities = ['Bangalore', 'Mumbai', 'Delhi-NCR', 'Hyderabad', 'Pune'];
  const nextCity = cities[(cities.indexOf(currentCity) + 1) % cities.length];
  currentCity = nextCity;
  document.getElementById('selectedCityName').textContent = currentCity;
  showToast(`Switched city to ${currentCity}`);
  playTone(440);
}

// Recenter Map
function recenterMap() {
  if (userMarker && map) {
    map.flyTo(userMarker.getLatLng(), 15, { duration: 1.2 });
    playTone(600);
  }
}

// Destination setting helpers
function setDestination(name, distance, fare) {
  document.getElementById('dropInput').value = name;
  currentBooking.drop = name;
  currentBooking.distance = distance;
  currentBooking.fare = fare;
  showRideComparisonState();
}

function useCurrentLocation() {
  showToast('GPS: Location locked at Indiranagar 100ft Rd');
  playTone(520);
}

// UI Bottom Sheet State Switchers
function showRideComparisonState() {
  playTone(480);
  const dropVal = document.getElementById('dropInput').value || 'Sony World Junction, Koramangala';
  currentBooking.drop = dropVal;
  document.getElementById('routeSummaryLabel').textContent = `Route: ${currentBooking.distance} km • Est. 14 mins`;

  // Draw simulated route line on map
  drawSimulatedRoute();

  document.getElementById('sheetStateSearch').classList.add('hidden');
  document.getElementById('sheetStateComparison').classList.remove('hidden');
  document.getElementById('sheetStateSearching').classList.add('hidden');
  document.getElementById('sheetStateAssigned').classList.add('hidden');
  document.getElementById('sheetStateInProgress').classList.add('hidden');
  document.getElementById('sheetStateCompleted').classList.add('hidden');
}

function backToSearchState() {
  playTone(400);
  if (routePolyline) {
    map.removeLayer(routePolyline);
  }
  document.getElementById('sheetStateComparison').classList.add('hidden');
  document.getElementById('sheetStateSearch').classList.remove('hidden');
}

function selectCategory(cat) {
  playTone(520);
  currentBooking.service = cat;
  if (cat === 'bike') pickRideOption('bike', 48, 'DashIt Bike');
  if (cat === 'auto') pickRideOption('auto', 76, 'DashIt Auto');
  if (cat === 'cab') pickRideOption('cab', 139, 'DashIt Cab Mini');
  if (cat === 'parcel') pickRideOption('parcel', 52, 'DashIt Parcel');
  showRideComparisonState();
}

function pickRideOption(cat, fare, name) {
  playTone(600, 'sine', 0.1);
  currentBooking.service = cat;
  currentBooking.fare = fare;
  currentBooking.serviceName = name;

  // Toggle active class on cards
  document.querySelectorAll('.ride-option-card').forEach(card => card.classList.remove('active'));
  const card = document.getElementById(`rideCard-${cat}`);
  if (card) card.classList.add('active');

  const ctaBtn = document.getElementById('bookRideCtaBtn');
  if (ctaBtn) {
    ctaBtn.innerHTML = `<span>Book ${name} &bull; ₹${fare}</span> <i data-lucide="zap" class="w-5 h-5 fill-dashNavy"></i>`;
    if (window.lucide) lucide.createIcons();
  }
}

// Draw polyline on map
function drawSimulatedRoute() {
  if (routePolyline) {
    map.removeLayer(routePolyline);
  }
  const start = [12.9716, 77.6412];
  const end = [12.9352, 77.6245];

  const waypoints = [
    start,
    [12.9650, 77.6380],
    [12.9520, 77.6320],
    [12.9410, 77.6280],
    end
  ];

  routePolyline = L.polyline(waypoints, {
    color: '#76D600',
    weight: 6,
    opacity: 0.9,
    dashArray: '10, 8',
    lineCap: 'round'
  }).addTo(map);

  map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
}

// State 2: Searching Captain Simulation
let searchInterval = null;
function startCaptainSearchSimulation() {
  playSuccessChime();
  document.getElementById('sheetStateComparison').classList.add('hidden');
  document.getElementById('sheetStateSearching').classList.remove('hidden');

  document.getElementById('searchingRideType').textContent = currentBooking.serviceName;
  document.getElementById('searchingFare').textContent = `₹${currentBooking.fare}`;

  // Periodic radar audio
  searchInterval = setInterval(() => {
    playRadarPing();
  }, 1800);

  // Auto trigger captain match after 4.5 seconds
  setTimeout(() => {
    if (!document.getElementById('sheetStateSearching').classList.contains('hidden')) {
      simulateCaptainFound();
    }
  }, 4500);
}

function cancelSearch() {
  if (searchInterval) clearInterval(searchInterval);
  playTone(350);
  showToast('Booking cancelled');
  backToSearchState();
}

// State 3: Captain Assigned
function simulateCaptainFound() {
  if (searchInterval) clearInterval(searchInterval);
  playSuccessChime();
  showToast('🎉 Captain found! Rajesh Kumar is on the way.');

  // Generate random 4-digit OTP
  const randOtp = Math.floor(1000 + Math.random() * 9000);
  currentBooking.otp = randOtp;
  document.getElementById('startOtpDisplay').textContent = randOtp;

  document.getElementById('sheetStateSearching').classList.add('hidden');
  document.getElementById('sheetStateAssigned').classList.remove('hidden');

  // Place Captain Marker moving towards pickup
  const captainLat = 12.9760;
  const captainLng = 77.6445;

  const capIcon = L.divIcon({
    className: 'captain-assigned-icon',
    html: `
      <div style="background:#0A192F; border:2px solid #76D600; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.3); font-size:18px;">
        🏍️
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });

  if (assignedCaptainMarker) map.removeLayer(assignedCaptainMarker);
  assignedCaptainMarker = L.marker([captainLat, captainLng], { icon: capIcon }).addTo(map);

  map.flyTo([captainLat, captainLng], 15, { duration: 1.5 });
}

// State 4: Trip in Progress
function simulateStartTrip() {
  playTone(650, 'triangle', 0.2);
  showToast('🚀 Ride Started! OTP 5829 Verified by Captain.');

  document.getElementById('sheetStateAssigned').classList.add('hidden');
  document.getElementById('sheetStateInProgress').classList.remove('hidden');
  document.getElementById('inProgressDropName').textContent = currentBooking.drop;

  // Animate marker along route
  let step = 0;
  const routePoints = [
    [12.9716, 77.6412],
    [12.9650, 77.6380],
    [12.9520, 77.6320],
    [12.9410, 77.6280],
    [12.9352, 77.6245]
  ];

  if (isTrackingInterval) clearInterval(isTrackingInterval);
  isTrackingInterval = setInterval(() => {
    if (step < routePoints.length) {
      if (assignedCaptainMarker) assignedCaptainMarker.setLatLng(routePoints[step]);
      if (userMarker) userMarker.setLatLng(routePoints[step]);
      step++;
    }
  }, 2000);
}

// State 5: Ride Completed
function simulateCompleteTrip() {
  if (isTrackingInterval) clearInterval(isTrackingInterval);
  playCelebrationFanfare();
  showToast('✅ Trip completed! ₹48 debited from DashIt Wallet.');

  document.getElementById('sheetStateInProgress').classList.add('hidden');
  document.getElementById('sheetStateCompleted').classList.remove('hidden');
}

// Reset back to map
function resetToInitialMapState() {
  playTone(500);
  if (routePolyline) map.removeLayer(routePolyline);
  if (assignedCaptainMarker) map.removeLayer(assignedCaptainMarker);

  document.getElementById('sheetStateCompleted').classList.add('hidden');
  document.getElementById('sheetStateSearch').classList.remove('hidden');

  recenterMap();
}

// Rating & Tips
function rateCaptain(stars) {
  playTone(600 + (stars * 50));
  const btns = document.querySelectorAll('#starRatingGroup .star-btn');
  btns.forEach((btn, idx) => {
    if (idx < stars) {
      btn.classList.add('text-amber-400');
      btn.classList.remove('text-slate-300');
    } else {
      btn.classList.remove('text-amber-400');
      btn.classList.add('text-slate-300');
    }
  });
  showToast(`Rated ${stars} Stars! Thank you for the feedback.`);
}

function addTip(amount) {
  playTone(700);
  showToast(`Added ₹${amount} tip for Rajesh Kumar!`);
}

// Main Tab Navigation
function switchMainTab(tab) {
  playTone(450);

  // Update nav buttons
  ['ride', 'activity', 'wallet', 'account'].forEach(t => {
    const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) btn.classList.remove('active');
  });

  const activeBtn = document.getElementById(`tabBtn${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Hide all screens
  document.getElementById('rideTabContent').style.display = tab === 'ride' ? 'block' : 'none';
  document.getElementById('activityTabContent').classList.toggle('show', tab === 'activity');
  document.getElementById('walletTabContent').classList.toggle('show', tab === 'wallet');
  document.getElementById('accountTabContent').classList.toggle('show', tab === 'account');
}

// Rebook from History
function rebookRide(service, pickup, drop) {
  switchMainTab('ride');
  document.getElementById('pickupInput').value = pickup;
  document.getElementById('dropInput').value = drop;
  selectCategory(service);
  showToast(`Rebooking ${service.toUpperCase()} ride...`);
}

// Wallet Funds Simulation
function addWalletFunds(amt) {
  playSuccessChime();
  showToast(`₹${amt} added successfully via UPI!`);
}

function copyReferralCode() {
  navigator.clipboard.writeText('DASHIT7789');
  showToast('Referral code DASHIT7789 copied!');
  playTone(650);
}

// Modal Handlers
function openChatModal() {
  playTone(500);
  const modal = document.getElementById('chatModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.setProperty('display', 'flex', 'important');
  }
}
function closeChatModal() {
  playTone(350);
  const modal = document.getElementById('chatModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
  }
}
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  if (!input.value.trim()) return;

  const msgContainer = document.getElementById('chatMessages');
  const userBubble = document.createElement('div');
  userBubble.className = 'bg-dashNavy text-white p-2.5 rounded-2xl max-w-[80%] ml-auto rounded-tr-none';
  userBubble.textContent = input.value;
  msgContainer.appendChild(userBubble);
  input.value = '';
  playTone(600);

  setTimeout(() => {
    const reply = document.createElement('div');
    reply.className = 'bg-slate-100 text-slate-700 p-2.5 rounded-2xl max-w-[80%] rounded-tl-none';
    reply.textContent = 'Got it, reaching in 1 min!';
    msgContainer.appendChild(reply);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    playTone(720);
  }, 1000);
}

function simulateCallCaptain() {
  playTone(550);
  alert('📞 Calling DashIt Captain Rajesh Kumar (+91 98450 12345)... [Demo Call]');
}

function shareLiveTrip() {
  playTone(550);
  if (navigator.share) {
    navigator.share({
      title: 'Track my DashIt Ride',
      text: 'Track my live DashIt bike taxi trip en route to Koramangala:',
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    showToast('Live trip tracking link copied to clipboard!');
  }
}

function openSafetyModal() {
  playTone(450);
  const modal = document.getElementById('safetyModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.setProperty('display', 'flex', 'important');
  }
}
function closeSafetyModal() {
  playTone(350);
  const modal = document.getElementById('safetyModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
  }
}
function triggerSOSAlert() {
  playTone(200, 'sawtooth', 0.5, 0.4);
  alert('🚨 EMERGENCY SOS TRIGGERED!\n\n1. Alert sent to Police Control Room (112).\n2. Live GPS location shared with Emergency Contacts.\n3. DashIt Safety Response Team is dialing your phone.');
}

function openNotificationModal() {
  showToast('🎁 Offer: Flat ₹30 OFF using coupon DASHFIRST');
}

function openSavedPlacesModal() {
  alert('Saved Places:\n1. 🏠 Home: Indiranagar 100ft Rd\n2. 🏢 Office: Embassy TechVillage, Outer Ring Rd');
}

function openPaymentSelector() {
  const choice = prompt('Select Payment Method:\n1. DashIt Wallet (₹240)\n2. Google Pay / PhonePe (UPI)\n3. Cash to Driver', '1');
  if (choice === '1') document.getElementById('currentPaymentLabel').textContent = 'DashIt Wallet (₹240)';
  if (choice === '2') document.getElementById('currentPaymentLabel').textContent = 'UPI (GPay / PhonePe)';
  if (choice === '3') document.getElementById('currentPaymentLabel').textContent = 'Cash on Drop';
  showToast('Payment method updated');
}

// Toast notification helper
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.remove('opacity-0', 'pointer-events-none');
  toast.classList.add('opacity-100');
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0', 'pointer-events-none');
  }, 2800);
}

// Desktop Frame vs Fullscreen Mode Toggle
function toggleDeviceMode() {
  const container = document.getElementById('deviceContainer');
  const btn = document.getElementById('toggleViewBtn');
  const isFullscreen = container.classList.toggle('mode-fullscreen');

  if (isFullscreen) {
    btn.textContent = '📱 Switch to Mobile Bezel';
  } else {
    btn.textContent = '🖥️ Switch to Fullscreen';
  }

  // Refresh Leaflet map sizing
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 350);
}

// Service Worker for PWA / APK Conversion
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
