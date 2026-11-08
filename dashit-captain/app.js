// DashIt Captain Partner Web App Core Logic
// DashIt Private Limited

let captainMap, captainMarker, surgeCircles = [];
let isDutyOnline = true;
let isSurgeVisible = true;
let currentAppMode = 'cockpit'; // 'cockpit' or 'registration'
let currentActiveTab = 'cockpit';

let audioCtx = null;
let incomingAlertInterval = null;
let countdownTimerInterval = null;
let countdownSecs = 15;

let todayEarnings = 1480;

// High-tech Audio Synthesizer
function playCaptainTone(freq, type = 'sine', duration = 0.15, vol = 0.25) {
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
    // Audio unsupported or un-interacted
  }
}

// Siren Alert for Incoming Ride Ping
function startIncomingRideSiren() {
  stopIncomingRideSiren();
  let toggle = false;
  incomingAlertInterval = setInterval(() => {
    toggle = !toggle;
    playCaptainTone(toggle ? 950 : 750, 'sawtooth', 0.18, 0.35);
  }, 220);
}

function stopIncomingRideSiren() {
  if (incomingAlertInterval) {
    clearInterval(incomingAlertInterval);
    incomingAlertInterval = null;
  }
}

function playCashPayoutChime() {
  playCaptainTone(523.25, 'triangle', 0.1, 0.3); // C5
  setTimeout(() => playCaptainTone(659.25, 'triangle', 0.1, 0.3), 100); // E5
  setTimeout(() => playCaptainTone(783.99, 'triangle', 0.1, 0.3), 200); // G5
  setTimeout(() => playCaptainTone(1046.50, 'triangle', 0.4, 0.4), 300); // C6
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  updateLiveClock();
  setInterval(updateLiveClock, 30000);

  initCaptainMap();
  registerCaptainServiceWorker();
});

// Live Clock
function updateLiveClock() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const timeElem = document.getElementById('liveTime');
  if (timeElem) timeElem.textContent = `${hours}:${minutes}`;
}

// Leaflet Map Initialization
function initCaptainMap() {
  const lat = 12.9352;
  const lng = 77.6245; // Koramangala, Bangalore

  captainMap = L.map('captainMap', {
    zoomControl: false,
    attributionControl: false
  }).setView([lat, lng], 14);

  // Clean OpenStreetMap tiles (100% Free, NO API key, NO watermark) with dark cockpit filter
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    className: 'dark-map-tiles',
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(captainMap);

  // Ensure map tiles calculate correct container dimensions on deployment
  setTimeout(() => { if (captainMap) captainMap.invalidateSize(); }, 150);
  setTimeout(() => { if (captainMap) captainMap.invalidateSize(); }, 500);
  setTimeout(() => { if (captainMap) captainMap.invalidateSize(); }, 1200);
  window.addEventListener('resize', () => { if (captainMap) captainMap.invalidateSize(); });

  // Captain Marker
  const captainIcon = L.divIcon({
    className: 'captain-current-pin',
    html: `
      <div style="background:#76D600; border:3px solid #0A192F; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(118,214,0,0.8); font-size:18px;">
        🏍️
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  captainMarker = L.marker([lat, lng], { icon: captainIcon }).addTo(captainMap);

  // Surge Price Heatmap Zones
  renderSurgeHeatmaps(lat, lng);
}

function renderSurgeHeatmaps(centerLat, centerLng) {
  // Zone 1: Koramangala Tech Park
  const surge1 = L.circle([centerLat + 0.005, centerLng + 0.004], {
    color: '#F59E0B',
    fillColor: '#F59E0B',
    fillOpacity: 0.25,
    radius: 700
  }).addTo(captainMap);

  // Zone 2: Indiranagar 100ft Rd
  const surge2 = L.circle([centerLat + 0.025, centerLng + 0.015], {
    color: '#EF4444',
    fillColor: '#EF4444',
    fillOpacity: 0.3,
    radius: 900
  }).addTo(captainMap);

  surgeCircles = [surge1, surge2];
}

function toggleSurgeHeatmap() {
  playCaptainTone(480);
  isSurgeVisible = !isSurgeVisible;
  surgeCircles.forEach(c => {
    if (isSurgeVisible) captainMap.addLayer(c);
    else captainMap.removeLayer(c);
  });
  document.getElementById('surgeToggleLabel').textContent = isSurgeVisible ? 'Surge Heatmap (1.4x)' : 'Surge Hidden';
  showCaptainToast(isSurgeVisible ? 'Surge zones visible' : 'Surge zones hidden');
}

// Master Duty Toggle (Online/Offline)
function toggleDutyOnline() {
  playCaptainTone(550);
  isDutyOnline = !isDutyOnline;

  const track = document.getElementById('dutyToggleSwitch');
  const label = document.getElementById('dutySwitchLabel');
  const overlay = document.getElementById('offlineOverlay');
  const heading = document.getElementById('dutyStatusHeading');

  if (isDutyOnline) {
    track.classList.add('online');
    label.textContent = 'ONLINE';
    label.className = 'text-xs font-bold text-dashGreen';
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.setProperty('display', 'none', 'important');
    }
    heading.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="text-white">ONLINE & ACCEPTING</span>
    `;
    showCaptainToast('🟢 You are now ONLINE & ready for rides!');
  } else {
    track.classList.remove('online');
    label.textContent = 'OFFLINE';
    label.className = 'text-xs font-bold text-slate-400';
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.style.setProperty('display', 'flex', 'important');
    }
    heading.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
      <span class="text-slate-400">OFFLINE</span>
    `;
    showCaptainToast('🔴 You are now OFFLINE.');
  }
}

// App Mode Switcher (Cockpit vs Registration Flow)
function switchAppMode(mode) {
  playCaptainTone(500);
  currentAppMode = mode;

  const btnCockpit = document.getElementById('btnModeCockpit');
  const btnReg = document.getElementById('btnModeRegistration');
  const cockpitContainer = document.getElementById('cockpitModeContainer');
  const regContainer = document.getElementById('registrationModeContainer');

  if (mode === 'cockpit') {
    btnCockpit.classList.add('active');
    btnReg.classList.remove('active');
    cockpitContainer.classList.remove('hidden');
    regContainer.classList.add('hidden');
    setTimeout(() => {
      if (captainMap) captainMap.invalidateSize();
    }, 200);
  } else {
    btnReg.classList.add('active');
    btnCockpit.classList.remove('active');
    cockpitContainer.classList.add('hidden');
    regContainer.classList.remove('hidden');
  }
}

// Registration Submit & Demo Activation
function completeRegistrationDemo() {
  playCashPayoutChime();
  alert('🎉 DASHIT CAPTAIN ONBOARDING APPROVED!\n\nWelcome Rajesh Naik! Your driving license, RC, and Aadhaar have been verified via DashIt AI.\n\nYou have unlocked: 0% Platform Commission for your first 30 days!');
  switchAppMode('cockpit');
  showCaptainToast('Welcome aboard, Captain Rajesh!');
}

// =========================================================================
// INCOMING RIDE REQUEST SIMULATION
// =========================================================================
function triggerSimulatedRideRequest() {
  if (!isDutyOnline) {
    toggleDutyOnline();
  }

  const modal = document.getElementById('incomingTripModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.setProperty('display', 'flex', 'important');
  }

  startIncomingRideSiren();

  countdownSecs = 15;
  document.getElementById('rideCountdownVal').textContent = countdownSecs;

  if (countdownTimerInterval) clearInterval(countdownTimerInterval);
  countdownTimerInterval = setInterval(() => {
    countdownSecs--;
    document.getElementById('rideCountdownVal').textContent = countdownSecs;
    if (countdownSecs <= 0) {
      declineTripRequest();
    }
  }, 1000);
}

function declineTripRequest() {
  stopIncomingRideSiren();
  if (countdownTimerInterval) clearInterval(countdownTimerInterval);
  const modal = document.getElementById('incomingTripModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
  }
  playCaptainTone(320);
  showCaptainToast('Ride declined');
}

function acceptTripRequest() {
  stopIncomingRideSiren();
  if (countdownTimerInterval) clearInterval(countdownTimerInterval);
  const modal = document.getElementById('incomingTripModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
  }

  playCaptainTone(880, 'sine', 0.3, 0.35);
  showCaptainToast('🎉 Ride Accepted! Head to pickup.');

  // Show active trip HUD Step 1
  const hud = document.getElementById('captainTripHud');
  const pickup = document.getElementById('hudPickupState');
  if (hud) {
    hud.classList.remove('hidden');
    hud.style.setProperty('display', 'block', 'important');
  }
  if (pickup) {
    pickup.classList.remove('hidden');
    pickup.style.setProperty('display', 'block', 'important');
  }
  const otpState = document.getElementById('hudOtpState');
  const drivingState = document.getElementById('hudDrivingState');
  const completeState = document.getElementById('hudCompleteState');
  if (otpState) { otpState.classList.add('hidden'); otpState.style.setProperty('display', 'none', 'important'); }
  if (drivingState) { drivingState.classList.add('hidden'); drivingState.style.setProperty('display', 'none', 'important'); }
  if (completeState) { completeState.classList.add('hidden'); completeState.style.setProperty('display', 'none', 'important'); }
}

// Trip Step 1: Arrived at Pickup
function captainArrivedAtPickup() {
  playCaptainTone(600);
  showCaptainToast('📍 Arrived at pickup location.');

  const p = document.getElementById('hudPickupState');
  const o = document.getElementById('hudOtpState');
  if (p) { p.classList.add('hidden'); p.style.setProperty('display', 'none', 'important'); }
  if (o) { o.classList.remove('hidden'); o.style.setProperty('display', 'block', 'important'); }
}

// Trip Step 2: Verify OTP & Start Ride
function verifyOtpAndStartRide() {
  const otpVal = document.getElementById('driverOtpInput').value;
  if (!otpVal || otpVal.length < 4) {
    alert('Please enter a 4-digit OTP');
    return;
  }

  playCaptainTone(750, 'triangle', 0.25);
  showCaptainToast('✅ OTP 5829 Verified! Trip Started.');

  const o = document.getElementById('hudOtpState');
  const d = document.getElementById('hudDrivingState');
  if (o) { o.classList.add('hidden'); o.style.setProperty('display', 'none', 'important'); }
  if (d) { d.classList.remove('hidden'); d.style.setProperty('display', 'block', 'important'); }
}

// Trip Step 3: Complete Trip
function captainCompleteTrip() {
  playCashPayoutChime();
  todayEarnings += 85;
  document.getElementById('topBarEarningsVal').textContent = `₹${todayEarnings}`;

  const d = document.getElementById('hudDrivingState');
  const c = document.getElementById('hudCompleteState');
  if (d) { d.classList.add('hidden'); d.style.setProperty('display', 'none', 'important'); }
  if (c) { c.classList.remove('hidden'); c.style.setProperty('display', 'block', 'important'); }
}

// Trip Step 4: Ready for Next Ride
function captainReadyForNextRide() {
  playCaptainTone(500);
  const hud = document.getElementById('captainTripHud');
  if (hud) {
    hud.classList.add('hidden');
    hud.style.setProperty('display', 'none', 'important');
  }
  showCaptainToast('🟢 Ready for next ride request.');
}

// Captain Tab Navigation
function switchCaptainTab(tab) {
  playCaptainTone(450);
  currentActiveTab = tab;

  // Toggle active class on nav buttons
  ['Cockpit', 'Earnings', 'Performance', 'Profile'].forEach(t => {
    const btn = document.getElementById(`capTab${t}`);
    if (btn) btn.classList.remove('active');
  });

  const activeBtn = document.getElementById(`capTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Show/Hide Tabs
  document.getElementById('cockpitModeContainer').style.display = tab === 'cockpit' ? 'flex' : 'none';
  document.getElementById('captainTabEarnings').classList.toggle('show', tab === 'earnings');
  document.getElementById('captainTabPerformance').classList.toggle('show', tab === 'performance');
  document.getElementById('captainTabProfile').classList.toggle('show', tab === 'profile');

  if (tab === 'cockpit' && captainMap) {
    setTimeout(() => captainMap.invalidateSize(), 200);
  }
}

// Instant Payout Request
function requestInstantPayout() {
  playCashPayoutChime();
  alert(`💸 INSTANT UPI PAYOUT PROCESSED!\n\nAmount: ₹${todayEarnings}.00\nDestination UPI: rajesh.naik@okhdfcbank\nStatus: Credited Instantly via IMPS/UPI\nBank Ref: DASH884910294`);
  showCaptainToast(`₹${todayEarnings} transferred to your UPI account!`);
}

function triggerCaptainSOS() {
  playCaptainTone(200, 'sawtooth', 0.5, 0.4);
  alert('🚨 DRIVER EMERGENCY SOS ACTIVE!\n\n1. Alert sent to DashIt Captain Safety Control Center.\n2. Audio Recording Activated.\n3. Police Dispatch notified with your GPS coordinates.');
}

// Toast helper
function showCaptainToast(msg) {
  const toast = document.getElementById('captainToast');
  const toastMsg = document.getElementById('captainToastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.remove('opacity-0', 'pointer-events-none');
  toast.classList.add('opacity-100');
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0', 'pointer-events-none');
  }, 2600);
}

// Device Mode Switcher (Desktop Frame vs Fullscreen)
function toggleDeviceMode() {
  const container = document.getElementById('deviceContainer');
  const btn = document.getElementById('toggleViewBtn');
  const isFullscreen = container.classList.toggle('mode-fullscreen');

  if (isFullscreen) {
    btn.textContent = '📱 Switch to Mobile Bezel';
  } else {
    btn.textContent = '🖥️ Switch to Fullscreen';
  }

  setTimeout(() => {
    if (captainMap) captainMap.invalidateSize();
  }, 350);
}

// Service Worker Registration
function registerCaptainServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
