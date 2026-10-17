/**
 * RideEase Frontend Application Controller
 * Handles Rider Booking, Driver Lifecycle, Admin Operations, and Map Simulation
 * SPM Tutorial 14 Prototype - Jayni Khimasia & Jiya Patel
 */

// Application State
const state = {
  activeView: 'rider-view',
  pickupKey: 'nirma',
  dropKey: 'airport',
  selectedVehicle: 'mini',
  selectedFare: 290,
  surgeMultiplier: 1.2,
  currentRide: null,
  activeMap: null,
  markers: {
    pickup: null,
    drop: null,
    driverCar: null,
    fleetCars: []
  },
  routePolyline: null,
  animationInterval: null,
  driverCountdownInterval: null
};

// Preset Coordinates
const LOCATIONS = {
  nirma: { name: "Nirma University, SG Highway", lat: 23.1287, lng: 72.5453 },
  vaishnodevi: { name: "Vaishno Devi Circle", lat: 23.1396, lng: 72.5424 },
  airport: { name: "Sardar Vallabhbhai Patel Airport (AMD)", lat: 23.0734, lng: 72.6266 },
  kalupur: { name: "Kalupur Railway Station", lat: 23.0232, lng: 72.6002 },
  sindhubhavan: { name: "Sindhu Bhavan Road (SBR)", lat: 23.0450, lng: 72.5080 },
  iskcon: { name: "ISKCON Crossroads", lat: 23.0278, lng: 72.5074 },
  giftcity: { name: "GIFT City Club, Gandhinagar", lat: 23.1610, lng: 72.6840 },
  prahladnagar: { name: "Prahlad Nagar Garden", lat: 23.0118, lng: 72.5072 }
};

// Available Cabs Fleet for map visual
const FLEET_SPOTS = [
  { id: 'F1', lat: 23.1250, lng: 72.5430, label: 'Swift Dzire' },
  { id: 'F2', lat: 23.1320, lng: 72.5480, label: 'Honda City' },
  { id: 'F3', lat: 23.1210, lng: 72.5390, label: 'Auto' },
  { id: 'F4', lat: 23.1360, lng: 72.5530, label: 'Innova' },
  { id: 'F5', lat: 23.1160, lng: 72.5370, label: 'Grand i10' }
];

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initMap();
  initRiderEvents();
  initDriverEvents();
  initAdminEvents();
  fetchAdminOverview();
  calculateFares();
});

// ==========================================================
// 1. GLOBAL NAVIGATION & TAB SWITCHING
// ==========================================================
function initNavigation() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.getAttribute('data-view');
      switchView(targetView);
    });
  });
}

function switchView(viewId) {
  state.activeView = viewId;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
  });

  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const activeSection = document.getElementById(viewId);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Refresh map layout if Rider View is opened
  if (viewId === 'rider-view' && state.activeMap) {
    setTimeout(() => state.activeMap.invalidateSize(), 200);
  }

  // Handle Split View cloning
  if (viewId === 'split-view') {
    setupSplitView();
  }

  if (viewId === 'admin-view') {
    fetchAdminOverview();
  }
}

function setupSplitView() {
  const splitRider = document.getElementById('splitRiderMount');
  const splitDriver = document.getElementById('splitDriverMount');
  
  splitRider.innerHTML = `
    <div style="background:var(--bg-card); padding:1.25rem; border-radius:12px; border:1px solid var(--border-color)">
      <h4>Rider Simulation Controls</h4>
      <p style="font-size:0.85rem; color:var(--text-muted); margin:8px 0 16px;">
        Book from Rider tab or switch back here to observe live synchronized state between Passenger and Captain.
      </p>
      <div style="font-size:0.9rem;">Current Booking Status: <strong style="color:var(--accent-color)">${state.currentRide ? state.currentRide.status : 'NO ACTIVE RIDE'}</strong></div>
      ${state.currentRide ? `
        <div style="margin-top:12px; padding:10px; background:#0b0f19; border-radius:8px;">
          <div>Driver: <strong>${state.currentRide.driver.name}</strong> (${state.currentRide.driver.plateNumber})</div>
          <div>Ride PIN: <strong style="color:#34d399; font-size:1.2rem;">${state.currentRide.otp}</strong></div>
          <div>Fare: <strong>₹${state.currentRide.fare}</strong></div>
        </div>
      ` : ''}
    </div>
  `;

  splitDriver.innerHTML = `
    <div style="background:var(--bg-card); padding:1.25rem; border-radius:12px; border:1px solid var(--border-color)">
      <h4>Driver Companion Live Sync</h4>
      <p style="font-size:0.85rem; color:var(--text-muted); margin:8px 0 16px;">
        Captain Rajesh Kumar (GJ-01-AB-4829) Status: <strong style="color:#34d399">ONLINE</strong>
      </p>
      <div style="font-size:0.9rem;">Driver Action State: <strong style="color:#fbbf24">${state.currentRide ? state.currentRide.status : 'WAITING FOR REQUESTS'}</strong></div>
      <div style="margin-top:1rem;">
        <button class="btn btn-outline btn-sm" onclick="switchView('driver-view')">Open Full Driver Screen</button>
      </div>
    </div>
  `;
}

// ==========================================================
// 2. LEAFLET INTERACTIVE MAP SYSTEM
// ==========================================================
function initMap() {
  const nirmaPos = [LOCATIONS.nirma.lat, LOCATIONS.nirma.lng];
  
  state.activeMap = L.map('rideMap', {
    center: [23.0900, 72.5600],
    zoom: 12,
    zoomControl: true
  });

  // Modern clean dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(state.activeMap);

  // Render static fleet cars
  renderFleetMarkers();

  // Set initial pickup and drop markers
  updateMapRoute();

  document.getElementById('btnRecenterMap').addEventListener('click', () => {
    if (state.markers.pickup && state.markers.drop) {
      const group = new L.featureGroup([state.markers.pickup, state.markers.drop]);
      state.activeMap.fitBounds(group.getBounds().pad(0.2));
    }
  });
}

function renderFleetMarkers() {
  const carIcon = L.divIcon({
    className: 'custom-car-pin',
    html: `<div style="background:#0f172a; color:#10b981; border:2px solid #10b981; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.5); font-size:14px;"><i class="fa-solid fa-car-side"></i></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  FLEET_SPOTS.forEach(spot => {
    const marker = L.marker([spot.lat, spot.lng], { icon: carIcon })
      .addTo(state.activeMap)
      .bindPopup(`<b>RideEase Available</b><br>${spot.label}`);
    state.markers.fleetCars.push(marker);
  });
}

function updateMapRoute() {
  const pickup = LOCATIONS[state.pickupKey];
  const drop = LOCATIONS[state.dropKey];

  if (!pickup || !drop) return;

  // Custom Pickup Icon
  const pickupIcon = L.divIcon({
    className: 'pickup-pin',
    html: `<div style="background:#10b981; color:#000; border:2px solid #fff; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; box-shadow:0 4px 12px rgba(16,185,129,0.5);"><i class="fa-solid fa-circle-dot"></i></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  // Custom Drop Icon
  const dropIcon = L.divIcon({
    className: 'drop-pin',
    html: `<div style="background:#ef4444; color:#fff; border:2px solid #fff; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; box-shadow:0 4px 12px rgba(239,68,68,0.5);"><i class="fa-solid fa-flag"></i></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  if (state.markers.pickup) state.activeMap.removeLayer(state.markers.pickup);
  if (state.markers.drop) state.activeMap.removeLayer(state.markers.drop);
  if (state.routePolyline) state.activeMap.removeLayer(state.routePolyline);

  state.markers.pickup = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
    .addTo(state.activeMap)
    .bindPopup(`<b>Pickup:</b> ${pickup.name}`);

  state.markers.drop = L.marker([drop.lat, drop.lng], { icon: dropIcon })
    .addTo(state.activeMap)
    .bindPopup(`<b>Destination:</b> ${drop.name}`);

  // Generate intermediate curve path coordinates
  const latLngs = generateRouteWaypoints(pickup.lat, pickup.lng, drop.lat, drop.lng);

  state.routePolyline = L.polyline(latLngs, {
    color: '#10b981',
    weight: 5,
    opacity: 0.85,
    dashArray: '8, 8',
    lineCap: 'round'
  }).addTo(state.activeMap);

  const group = new L.featureGroup([state.markers.pickup, state.markers.drop]);
  state.activeMap.fitBounds(group.getBounds().pad(0.25));
}

function generateRouteWaypoints(lat1, lng1, lat2, lng2) {
  const points = [];
  const steps = 25;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add slight curve for realism
    const midCurve = Math.sin(t * Math.PI) * 0.008;
    const lat = lat1 + (lat2 - lat1) * t + midCurve;
    const lng = lng1 + (lng2 - lng1) * t - midCurve;
    points.push([lat, lng]);
  }
  return points;
}

// ==========================================================
// 3. RIDER APPLICATION CONTROLLER & FARE ENGINE
// ==========================================================
function initRiderEvents() {
  const pickupSelect = document.getElementById('pickupSelect');
  const dropSelect = document.getElementById('dropSelect');

  pickupSelect.addEventListener('change', (e) => {
    state.pickupKey = e.target.value;
    updateMapRoute();
    calculateFares();
  });

  dropSelect.addEventListener('change', (e) => {
    state.dropKey = e.target.value;
    updateMapRoute();
    calculateFares();
  });

  // Vehicle Cards selection
  const vehicleCards = document.querySelectorAll('.vehicle-card');
  vehicleCards.forEach(card => {
    card.addEventListener('click', () => {
      vehicleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedVehicle = card.getAttribute('data-type');
      
      const priceElem = card.querySelector('.vehicle-price');
      const fareText = priceElem ? priceElem.textContent : '₹290';
      const cleanPrice = parseInt(fareText.replace(/[^\d]/g, ''), 10);
      state.selectedFare = cleanPrice;

      const btn = document.getElementById('btnRequestRide');
      const title = card.querySelector('.vehicle-title').childNodes[0].textContent.trim();
      btn.querySelector('.btn-text').textContent = `Book ${title}`;
      document.getElementById('btnSelectedFare').textContent = `₹${cleanPrice}`;
    });
  });

  // Request Ride CTA
  document.getElementById('btnRequestRide').addEventListener('click', handleRideRequest);

  // Cancel Request matching
  document.getElementById('btnCancelMatching').addEventListener('click', () => {
    showRiderStep('bookingStepLocations');
    showToast('Ride search cancelled', 'info');
  });

  // Cancel Active Ride (FR-11)
  document.getElementById('btnCancelActiveRide').addEventListener('click', () => {
    if (confirm("Are you sure you want to cancel this ride? (No cancellation fee within 2 mins)")) {
      cancelCurrentRide("Rider changed plans");
    }
  });

  // SOS Emergency Trigger (FR-12)
  document.getElementById('btnSosTrigger').addEventListener('click', triggerEmergencySOS);

  // Share Trip
  document.getElementById('btnShareRide').addEventListener('click', () => {
    const link = `https://rideease.app/track/${state.currentRide ? state.currentRide.rideId : 'DEMO'}`;
    navigator.clipboard ? navigator.clipboard.writeText(link) : null;
    showToast(`Trip tracking link copied: ${link}`, 'info');
  });

  // Rating Stars
  const stars = document.querySelectorAll('#starRating i');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.getAttribute('data-star'), 10);
      stars.forEach((s, idx) => {
        s.classList.toggle('selected', idx < rating);
      });
    });
  });

  // Submit Rating
  document.getElementById('btnSubmitRating').addEventListener('click', () => {
    showToast("Feedback submitted. Thank you for rating!", "success");
    showRiderStep('bookingStepLocations');
    state.currentRide = null;
    if (state.markers.driverCar) {
      state.activeMap.removeLayer(state.markers.driverCar);
      state.markers.driverCar = null;
    }
  });
}

async function calculateFares() {
  try {
    const res = await fetch('/api/fare/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupKey: state.pickupKey,
        dropKey: state.dropKey
      })
    });
    const data = await res.json();

    document.getElementById('tripDist').textContent = `${data.distanceKm} km`;
    document.getElementById('tripEta').textContent = `${data.estimatedMin} mins`;
    document.getElementById('surgeText').textContent = `${data.surgeMultiplier}x Peak Surge`;
    document.getElementById('mapSurgeFactor').textContent = data.surgeMultiplier;
    state.surgeMultiplier = data.surgeMultiplier;

    for (const [key, val] of Object.entries(data.estimates)) {
      const el = document.getElementById(`fare-${key}`);
      if (el) el.textContent = `₹${val.finalFare}`;
    }

    const currentSelected = data.estimates[state.selectedVehicle];
    if (currentSelected) {
      state.selectedFare = currentSelected.finalFare;
      document.getElementById('btnSelectedFare').textContent = `₹${currentSelected.finalFare}`;
    }
  } catch (err) {
    console.error("Fare estimate failed, using local fallback", err);
  }
}

async function handleRideRequest() {
  showRiderStep('bookingStepMatching');
  
  // Progress bar animation for radar
  const progress = document.getElementById('matchingProgress');
  progress.style.width = '10%';
  setTimeout(() => progress.style.width = '60%', 800);
  setTimeout(() => progress.style.width = '100%', 1800);

  const pickup = LOCATIONS[state.pickupKey];
  const drop = LOCATIONS[state.dropKey];
  const paymentMethod = document.getElementById('paymentMethodSelect').value;

  try {
    const res = await fetch('/api/rides/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        riderName: "Jayni Khimasia",
        riderPhone: "+91 98980-12345",
        pickupName: pickup.name,
        dropName: drop.name,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropLat: drop.lat,
        dropLng: drop.lng,
        vehicleType: state.selectedVehicle,
        paymentMethod
      })
    });

    const data = await res.json();
    if (data.ride) {
      setTimeout(() => {
        state.currentRide = data.ride;
        setupActiveRideView(data.ride);
        showToast("Captain Assigned! (Matched in 2.1s per NFR-1)", "success");

        // Sync with Driver Companion View
        triggerDriverIncomingAlert(data.ride);
      }, 2000);
    } else {
      showToast(data.error || "Driver matching error", "error");
      showRiderStep('bookingStepLocations');
    }
  } catch (err) {
    showToast("Network error in matching", "error");
    showRiderStep('bookingStepLocations');
  }
}

function setupActiveRideView(ride) {
  showRiderStep('bookingStepActiveRide');

  document.getElementById('activeDriverName').textContent = ride.driver.name;
  document.getElementById('activeDriverVehicle').textContent = ride.driver.vehicleModel;
  document.getElementById('activeDriverPlate').textContent = ride.driver.plateNumber;
  document.getElementById('activeDriverRating').textContent = ride.driver.rating;
  document.getElementById('activeRideOtp').textContent = ride.otp;
  document.getElementById('activePickupName').textContent = ride.pickupName;
  document.getElementById('activeDropName').textContent = ride.dropName;
  document.getElementById('activeTotalFare').textContent = `₹${ride.fare}`;

  document.getElementById('rideStatusText').textContent = "Captain is heading to pickup";
  document.getElementById('rideStatusSub').textContent = `Arriving in ${ride.driverEtaMin} mins`;

  // Place active driver car on map
  const driverCarIcon = L.divIcon({
    className: 'active-car-pin',
    html: `<div style="background:#0b0f19; color:#38bdf8; border:3px solid #38bdf8; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 4px 16px rgba(56,189,248,0.7);"><i class="fa-solid fa-car-side"></i></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  if (state.markers.driverCar) state.activeMap.removeLayer(state.markers.driverCar);

  state.markers.driverCar = L.marker([ride.driver.currentLat, ride.driver.currentLng], { icon: driverCarIcon })
    .addTo(state.activeMap)
    .bindPopup(`<b>${ride.driver.name}</b><br>${ride.driver.vehicleModel}`);
}

function showRiderStep(stepId) {
  document.querySelectorAll('#rider-view .booking-step').forEach(step => {
    step.classList.remove('active');
  });
  const el = document.getElementById(stepId);
  if (el) el.classList.add('active');
}

async function cancelCurrentRide(reason) {
  if (!state.currentRide) return;
  try {
    await fetch(`/api/rides/${state.currentRide.rideId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, cancelledBy: 'rider' })
    });
    showToast("Ride cancelled successfully", "warning");
    showRiderStep('bookingStepLocations');
    if (state.markers.driverCar) {
      state.activeMap.removeLayer(state.markers.driverCar);
      state.markers.driverCar = null;
    }
    state.currentRide = null;
  } catch (err) {
    console.error(err);
  }
}

async function triggerEmergencySOS() {
  if (!state.currentRide) return;
  try {
    const res = await fetch(`/api/rides/${state.currentRide.rideId}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    alert(`🚨 EMERGENCY SOS BROADCASTED!\n\n${data.message}\nContacts: ${data.emergencyContactsNotified.join(', ')}`);
    showToast("Emergency Services & PCR 112 Alerted!", "error");
  } catch (err) {
    console.error(err);
  }
}

// ==========================================================
// 4. DRIVER COMPANION APP CONTROLLER
// ==========================================================
function initDriverEvents() {
  const toggle = document.getElementById('driverOnlineToggle');
  const label = document.getElementById('driverStatusLabel');

  toggle.addEventListener('change', () => {
    const isOnline = toggle.checked;
    label.textContent = isOnline ? 'ONLINE' : 'OFFLINE';
    label.style.color = isOnline ? '#34d399' : '#94a3b8';
    showToast(isOnline ? "Captain is now ONLINE" : "Captain went OFFLINE", "info");
  });

  // Decline button
  document.getElementById('btnDriverDecline').addEventListener('click', () => {
    clearInterval(state.driverCountdownInterval);
    showDriverScreenState('driverStateWaiting');
    showToast("Request declined", "warning");
  });

  // Accept button
  document.getElementById('btnDriverAccept').addEventListener('click', handleDriverAccept);

  // Mark arrived button
  document.getElementById('btnDriverMarkArrived').addEventListener('click', handleDriverMarkArrived);

  // Verify OTP and start trip
  document.getElementById('btnDriverStartTrip').addEventListener('click', handleDriverStartTrip);

  // Complete Trip
  document.getElementById('btnDriverCompleteTrip').addEventListener('click', handleDriverCompleteTrip);
}

function showDriverScreenState(stateId) {
  document.querySelectorAll('.driver-screen-state').forEach(st => {
    st.classList.remove('active');
  });
  const el = document.getElementById(stateId);
  if (el) el.classList.add('active');
}

function triggerDriverIncomingAlert(ride) {
  showDriverScreenState('driverStateIncoming');
  document.getElementById('incomingFare').textContent = `₹${ride.fare}`;
  document.getElementById('incomingPickup').textContent = ride.pickupName;
  document.getElementById('incomingDrop').textContent = ride.dropName;

  // 15-second countdown timer
  let countdown = 15;
  const countEl = document.getElementById('driverCountdown');
  countEl.textContent = `${countdown}s`;

  clearInterval(state.driverCountdownInterval);
  state.driverCountdownInterval = setInterval(() => {
    countdown--;
    countEl.textContent = `${countdown}s`;
    if (countdown <= 0) {
      clearInterval(state.driverCountdownInterval);
      showDriverScreenState('driverStateWaiting');
    }
  }, 1000);
}

function handleDriverAccept() {
  clearInterval(state.driverCountdownInterval);
  showDriverScreenState('driverStateTransit');

  if (state.currentRide) {
    document.getElementById('driverPassengerName').textContent = state.currentRide.riderName;
    document.getElementById('driverTransitFare').textContent = `₹${state.currentRide.fare}`;
    document.getElementById('driverCollectAmount').textContent = state.currentRide.fare;
  }

  document.getElementById('driverActionArrivedBox').style.display = 'block';
  document.getElementById('driverActionStartBox').style.display = 'none';
  document.getElementById('driverActionCompleteBox').style.display = 'none';

  showToast("Ride Accepted! Navigating to Pickup...", "success");
}

async function handleDriverMarkArrived() {
  if (!state.currentRide) return;
  try {
    await fetch(`/api/rides/${state.currentRide.rideId}/arrive`, { method: 'POST' });
    
    document.getElementById('driverActionArrivedBox').style.display = 'none';
    document.getElementById('driverActionStartBox').style.display = 'block';

    // Update rider view
    document.getElementById('rideStatusText').textContent = "Captain Rajesh has Arrived!";
    document.getElementById('rideStatusSub').textContent = "Please share your 4-digit PIN to begin trip";

    // Move driver marker to pickup location
    if (state.markers.driverCar && state.currentRide.pickup) {
      state.markers.driverCar.setLatLng([state.currentRide.pickup.lat, state.currentRide.pickup.lng]);
    }

    showToast("Arrived at pickup location", "info");
  } catch (err) {
    console.error(err);
  }
}

async function handleDriverStartTrip() {
  if (!state.currentRide) return;
  const inputPin = document.getElementById('driverOtpInput').value.trim();

  try {
    const res = await fetch(`/api/rides/${state.currentRide.rideId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: inputPin })
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Invalid PIN", "error");
      return;
    }

    document.getElementById('driverActionStartBox').style.display = 'none';
    document.getElementById('driverActionCompleteBox').style.display = 'block';

    // Update instruction
    document.getElementById('driverNavDist').textContent = "In 1.2 km";
    document.getElementById('driverNavStreet').textContent = `Follow Airport Road to ${state.currentRide.dropName}`;

    // Update rider view
    document.getElementById('rideStatusText').textContent = "Trip in Progress 🚗";
    document.getElementById('rideStatusSub').textContent = `Heading to ${state.currentRide.dropName}`;

    showToast("PIN Verified! Trip Started.", "success");

    // Animate car traversal on map
    animateCarOnRoute();

  } catch (err) {
    showToast("Verification error", "error");
  }
}

function animateCarOnRoute() {
  if (!state.markers.driverCar || !state.currentRide) return;

  const waypoints = generateRouteWaypoints(
    state.currentRide.pickup.lat, state.currentRide.pickup.lng,
    state.currentRide.drop.lat, state.currentRide.drop.lng
  );

  let step = 0;
  clearInterval(state.animationInterval);
  state.animationInterval = setInterval(() => {
    if (step < waypoints.length) {
      state.markers.driverCar.setLatLng(waypoints[step]);
      step++;
    } else {
      clearInterval(state.animationInterval);
    }
  }, 400);
}

async function handleDriverCompleteTrip() {
  if (!state.currentRide) return;
  clearInterval(state.animationInterval);

  try {
    const res = await fetch(`/api/rides/${state.currentRide.rideId}/complete`, { method: 'POST' });
    const data = await res.json();

    showDriverScreenState('driverStateWaiting');
    showToast("Trip Completed! Payout credited to Captain wallet.", "success");

    // Update driver daily earnings counter
    const currentEarn = parseInt(document.getElementById('driverTodayEarnings').textContent.replace(/[^\d]/g, ''), 10);
    document.getElementById('driverTodayEarnings').textContent = `₹${currentEarn + Math.round(state.currentRide.fare * 0.8)}`;

    // Show Rider Receipt View (FR-8)
    showRiderReceipt(data.receipt, state.currentRide);

  } catch (err) {
    console.error(err);
  }
}

function showRiderReceipt(receipt, ride) {
  showRiderStep('bookingStepReceipt');

  document.getElementById('receiptRideId').textContent = receipt.invoiceNo;
  document.getElementById('receiptMetrics').textContent = `${ride.distanceKm} km (${ride.durationMin} mins)`;
  document.getElementById('receiptBaseFare').textContent = `₹${receipt.baseFare + receipt.distanceFare}`;
  document.getElementById('receiptSurge').textContent = `₹${Math.round(receipt.totalPaid * 0.15)}`;
  document.getElementById('receiptTotal').textContent = `₹${receipt.totalPaid}`;
  document.getElementById('receiptPayment').textContent = receipt.paymentMethod;
  document.getElementById('ratingDriverName').textContent = ride.driver.name.split(' ')[0];
}

// ==========================================================
// 5. ADMIN DASHBOARD & SPM METRICS
// ==========================================================
function initAdminEvents() {
  const slider = document.getElementById('adminSurgeSlider');
  const display = document.getElementById('adminSurgeDisplay');

  slider.addEventListener('input', (e) => {
    display.textContent = `${e.target.value}x`;
  });

  document.getElementById('btnUpdateSurge').addEventListener('click', async () => {
    const val = parseFloat(slider.value);
    try {
      const res = await fetch('/api/admin/surge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factor: val })
      });
      const data = await res.json();
      showToast(data.message, "success");
      calculateFares();
    } catch (err) {
      showToast("Error updating surge", "error");
    }
  });
}

async function fetchAdminOverview() {
  try {
    const res = await fetch('/api/admin/overview');
    const data = await res.json();

    document.getElementById('adminActiveCount').textContent = `${data.liveMetrics.activeRidesCount} Rides`;
    document.getElementById('adminRevenue').textContent = `₹${data.liveMetrics.platformRevenue}`;

    renderDriverTable(data.drivers);
  } catch (err) {
    console.error("Admin overview fetch failed", err);
  }
}

function renderDriverTable(driverList) {
  const tbody = document.getElementById('adminDriverTableBody');
  if (!tbody) return;

  tbody.innerHTML = driverList.map(d => `
    <tr>
      <td><code>${d.id}</code></td>
      <td>
        <strong>${d.name}</strong><br>
        <span style="font-size:0.75rem; color:var(--text-muted);">${d.phone}</span>
      </td>
      <td>
        ${d.vehicleModel}<br>
        <span style="color:#38bdf8; font-size:0.75rem; font-weight:700;">${d.plateNumber}</span>
      </td>
      <td>
        <span class="badge ${d.documents.license === 'VERIFIED' ? 'badge-health' : 'badge-git'}">
          ${d.documents.license === 'VERIFIED' ? '✓ Verified' : '⏳ Pending'}
        </span>
      </td>
      <td><i class="fa-solid fa-star text-yellow-400"></i> ${d.rating} (${d.trips})</td>
      <td>
        <span style="font-weight:700; color:${d.status === 'offline' ? '#94a3b8' : '#34d399'};">
          ${d.status.toUpperCase()}
        </span>
      </td>
      <td>
        ${d.approvalStatus === 'pending' ? `
          <button class="btn btn-success btn-sm" onclick="verifyDriver('${d.id}', 'approve')">Approve</button>
        ` : `
          <button class="btn btn-outline btn-sm" onclick="verifyDriver('${d.id}', 'reject')">Suspend</button>
        `}
      </td>
    </tr>
  `).join('');
}

async function verifyDriver(driverId, action) {
  try {
    const res = await fetch(`/api/admin/drivers/${driverId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    showToast(data.message, "success");
    fetchAdminOverview();
  } catch (err) {
    showToast("Error updating driver", "error");
  }
}

// ==========================================================
// 6. UTILITY TOAST NOTIFICATIONS
// ==========================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';
  if (type === 'warning') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
