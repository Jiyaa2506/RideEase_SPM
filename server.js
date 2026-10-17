const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// IN-MEMORY DATA STORE (Simulating Real-Time DB)
// ==========================================

let surgeMultiplier = 1.2; // Default surge (1.2x peak demand)

// Popular locations around Ahmedabad / Gandhinagar / Nirma University
const LOCATIONS = {
  nirma: { name: "Nirma University, SG Highway", lat: 23.1287, lng: 72.5453 },
  vaishnodevi: { name: "Vaishno Devi Circle", lat: 23.1396, lng: 72.5424 },
  airport: { name: "Sardar Vallabhbhai Patel Int'l Airport (AMD)", lat: 23.0734, lng: 72.6266 },
  kalupur: { name: "Kalupur Railway Station", lat: 23.0232, lng: 72.6002 },
  sindhubhavan: { name: "Sindhu Bhavan Road (SBR)", lat: 23.0450, lng: 72.5080 },
  iskcon: { name: "ISKCON Crossroads, SG Highway", lat: 23.0278, lng: 72.5074 },
  giftcity: { name: "GIFT City Club, Gandhinagar", lat: 23.1610, lng: 72.6840 },
  prahladnagar: { name: "Prahlad Nagar Garden", lat: 23.0118, lng: 72.5072 }
};

// Drivers fleet
let drivers = [
  {
    id: "DRV-101",
    name: "Rajesh Kumar",
    phone: "+91 98765-43210",
    rating: 4.88,
    trips: 1420,
    vehicleType: "mini",
    vehicleModel: "White Maruti Suzuki Swift Dzire",
    plateNumber: "GJ-01-AB-4829",
    status: "available", // available, busy, offline
    approvalStatus: "approved", // approved, pending, rejected
    documents: { license: "VERIFIED", rc: "VERIFIED", insurance: "VERIFIED" },
    lat: 23.1250,
    lng: 72.5430,
    earningsToday: 1840
  },
  {
    id: "DRV-102",
    name: "Vikram Sinh Vaghela",
    phone: "+91 98250-11223",
    rating: 4.95,
    trips: 2180,
    vehicleType: "sedan",
    vehicleModel: "Silver Honda City",
    plateNumber: "GJ-27-XY-7711",
    status: "available",
    approvalStatus: "approved",
    documents: { license: "VERIFIED", rc: "VERIFIED", insurance: "VERIFIED" },
    lat: 23.1310,
    lng: 72.5480,
    earningsToday: 2450
  },
  {
    id: "DRV-103",
    name: "Mohammad Iqbal",
    phone: "+91 97123-88990",
    rating: 4.79,
    trips: 980,
    vehicleType: "auto",
    vehicleModel: "Bajaj Compact RE Auto",
    plateNumber: "GJ-01-CZ-3304",
    status: "available",
    approvalStatus: "approved",
    documents: { license: "VERIFIED", rc: "VERIFIED", insurance: "VERIFIED" },
    lat: 23.1220,
    lng: 72.5410,
    earningsToday: 920
  },
  {
    id: "DRV-104",
    name: "Amit Solanki",
    phone: "+91 99044-67890",
    rating: 4.92,
    trips: 3410,
    vehicleType: "premier",
    vehicleModel: "Black Toyota Innova Crysta",
    plateNumber: "GJ-18-KL-9009",
    status: "available",
    approvalStatus: "approved",
    documents: { license: "VERIFIED", rc: "VERIFIED", insurance: "VERIFIED" },
    lat: 23.1340,
    lng: 72.5510,
    earningsToday: 3200
  },
  {
    id: "DRV-105",
    name: "Suresh Prajapati",
    phone: "+91 96380-55443",
    rating: 4.65,
    trips: 450,
    vehicleType: "mini",
    vehicleModel: "Hyundai Grand i10",
    plateNumber: "GJ-01-EE-2198",
    status: "offline",
    approvalStatus: "pending",
    documents: { license: "PENDING_VERIFICATION", rc: "VERIFIED", insurance: "PENDING_VERIFICATION" },
    lat: 23.1150,
    lng: 72.5380,
    earningsToday: 0
  }
];

// Active rides store
let activeRides = [];
let completedRides = [
  {
    rideId: "RIDE-9901",
    riderName: "Jayni Khimasia",
    driverId: "DRV-101",
    driverName: "Rajesh Kumar",
    vehicle: "White Swift Dzire (GJ-01-AB-4829)",
    pickup: "Nirma University, SG Highway",
    drop: "Ahmedabad Airport (AMD)",
    distanceKm: 16.4,
    durationMin: 28,
    vehicleType: "mini",
    fare: 385,
    paymentMethod: "UPI (Google Pay)",
    status: "COMPLETED",
    rating: 5,
    feedback: "Excellent driving, on time pickup!",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    rideId: "RIDE-9902",
    riderName: "Jiya Patel",
    driverId: "DRV-102",
    driverName: "Vikram Sinh Vaghela",
    vehicle: "Silver Honda City (GJ-27-XY-7711)",
    pickup: "Sindhu Bhavan Road (SBR)",
    drop: "Kalupur Railway Station",
    distanceKm: 14.2,
    durationMin: 32,
    vehicleType: "sedan",
    fare: 460,
    paymentMethod: "RideEase Wallet",
    status: "COMPLETED",
    rating: 5,
    feedback: "Clean car and very polite driver.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Fare category rates
const RATES = {
  auto: { base: 30, perKm: 12, perMin: 1.5, minFare: 40, label: "RideEase Auto", desc: "No haggling, doorstep pickup" },
  mini: { base: 50, perKm: 15, perMin: 2.0, minFare: 75, label: "RideEase Mini", desc: "Comfy hatchbacks for daily rides" },
  sedan: { base: 75, perKm: 19, perMin: 2.5, minFare: 110, label: "RideEase Sedan", desc: "Spacious sedans with top rated drivers" },
  premier: { base: 120, perKm: 25, perMin: 3.5, minFare: 180, label: "RideEase Premier / XL", desc: "Premium SUVs & luxury rides" }
};

// Distance calculation helper (Haversine formula in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// ==========================================
// API ROUTES
// ==========================================

// 0. User Authentication & Role Selection (FR-1, FR-2, FR-13)
app.post('/api/auth/login', (req, res) => {
  const { role, username, password, driverId } = req.body;

  if (role === 'rider') {
    return res.json({
      success: true,
      role: 'rider',
      user: {
        id: 'RDR-115',
        name: username || 'Jayni Khimasia',
        phone: '+91 98980-12345',
        email: 'jayni.khimasia@nirmauni.ac.in',
        walletBalance: 850,
        rating: 4.95,
        savedAddress: 'Nirma University, SG Highway'
      }
    });
  }

  if (role === 'driver') {
    const matchedDriver = drivers.find(d => d.id === (driverId || 'DRV-101')) || drivers[0];
    return res.json({
      success: true,
      role: 'driver',
      user: {
        id: matchedDriver.id,
        name: matchedDriver.name,
        phone: matchedDriver.phone,
        vehicleModel: matchedDriver.vehicleModel,
        plateNumber: matchedDriver.plateNumber,
        vehicleType: matchedDriver.vehicleType,
        rating: matchedDriver.rating,
        trips: matchedDriver.trips,
        earningsToday: matchedDriver.earningsToday,
        status: matchedDriver.status
      }
    });
  }

  if (role === 'admin') {
    return res.json({
      success: true,
      role: 'admin',
      user: {
        id: 'ADM-2026',
        name: 'System Administrator (Jiya Patel)',
        email: 'admin@rideease.nirmauni.ac.in',
        department: 'Dept of CSE, Nirma University',
        accessLevel: 'Super Administrator & SCM Controller'
      }
    });
  }

  res.status(400).json({ error: 'Invalid role or credentials' });
});

// 1. System Health & SPM NFR-3 Availability
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'RideEase Platform Service',
    uptimeSeconds: Math.floor(process.uptime()),
    availability: '99.5%',
    spmTarget: 'NFR-3 99.5% Conformance',
    timestamp: new Date().toISOString()
  });
});

// 2. Preset locations
app.get('/api/locations', (req, res) => {
  res.json(LOCATIONS);
});

// 3. Drivers list & positions
app.get('/api/drivers', (req, res) => {
  res.json(drivers);
});

// 4. Fare estimation engine (FR-5 with surge pricing)
app.post('/api/fare/estimate', (req, res) => {
  const { pickupKey, dropKey, pickupLat, pickupLng, dropLat, dropLng } = req.body;

  let lat1 = pickupLat, lng1 = pickupLng, lat2 = dropLat, lng2 = dropLng;

  if (pickupKey && LOCATIONS[pickupKey]) {
    lat1 = LOCATIONS[pickupKey].lat;
    lng1 = LOCATIONS[pickupKey].lng;
  }
  if (dropKey && LOCATIONS[dropKey]) {
    lat2 = LOCATIONS[dropKey].lat;
    lng2 = LOCATIONS[dropKey].lng;
  }

  const distanceKm = Math.max(1.5, calculateDistance(lat1, lng1, lat2, lng2));
  const estimatedMin = Math.round(distanceKm * 2.2); // ~2.2 mins per km in city traffic

  const estimates = {};
  for (const [key, rate] of Object.entries(RATES)) {
    const rawFare = rate.base + (distanceKm * rate.perKm) + (estimatedMin * rate.perMin);
    const surgedFare = Math.round(Math.max(rate.minFare, rawFare * surgeMultiplier));
    estimates[key] = {
      category: key,
      label: rate.label,
      desc: rate.desc,
      distanceKm,
      estimatedMin,
      baseFare: rate.base,
      surgeMultiplier,
      finalFare: surgedFare,
      currency: "₹"
    };
  }

  res.json({
    pickup: { lat: lat1, lng: lng1 },
    drop: { lat: lat2, lng: lng2 },
    distanceKm,
    estimatedMin,
    surgeMultiplier,
    estimates
  });
});

// 5. Ride Request & Nearest Driver Matching (FR-3, FR-4, NFR-1)
app.post('/api/rides/request', (req, res) => {
  const { riderName, riderPhone, pickupName, dropName, pickupLat, pickupLng, dropLat, dropLng, vehicleType, paymentMethod } = req.body;

  // Filter available approved drivers matching vehicle type
  let candidates = drivers.filter(d => d.status === 'available' && d.approvalStatus === 'approved');
  if (vehicleType && vehicleType !== 'any') {
    const typeCandidates = candidates.filter(d => d.vehicleType === vehicleType);
    if (typeCandidates.length > 0) candidates = typeCandidates;
  }

  if (candidates.length === 0) {
    return res.status(404).json({ error: "No drivers available nearby right now. Please try again in 1 minute." });
  }

  // Sort by nearest distance to pickup
  candidates.sort((a, b) => {
    const distA = calculateDistance(a.lat, a.lng, pickupLat, pickupLng);
    const distB = calculateDistance(b.lat, b.lng, pickupLat, pickupLng);
    return distA - distB;
  });

  const matchedDriver = candidates[0];
  const driverDistKm = calculateDistance(matchedDriver.lat, matchedDriver.lng, pickupLat, pickupLng);
  const driverEtaMin = Math.max(2, Math.round(driverDistKm * 2.5));

  const tripDistKm = Math.max(1.5, calculateDistance(pickupLat, pickupLng, dropLat, dropLng));
  const tripDurationMin = Math.round(tripDistKm * 2.2);
  const rateConfig = RATES[matchedDriver.vehicleType] || RATES.mini;
  const fare = Math.round((rateConfig.base + (tripDistKm * rateConfig.perKm) + (tripDurationMin * rateConfig.perMin)) * surgeMultiplier);

  // Generate 4-digit PIN for security
  const rideOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const rideId = "RIDE-" + Math.floor(1000 + Math.random() * 9000);

  matchedDriver.status = 'busy';

  const newRide = {
    rideId,
    riderName: riderName || "Rider User",
    riderPhone: riderPhone || "+91 98980-12345",
    pickupName: pickupName || "Pickup Location",
    dropName: dropName || "Drop Location",
    pickup: { lat: pickupLat, lng: pickupLng },
    drop: { lat: dropLat, lng: dropLng },
    driver: {
      id: matchedDriver.id,
      name: matchedDriver.name,
      phone: matchedDriver.phone,
      rating: matchedDriver.rating,
      vehicleModel: matchedDriver.vehicleModel,
      plateNumber: matchedDriver.plateNumber,
      vehicleType: matchedDriver.vehicleType,
      currentLat: matchedDriver.lat,
      currentLng: matchedDriver.lng
    },
    distanceKm: tripDistKm,
    durationMin: tripDurationMin,
    fare,
    currency: "₹",
    otp: rideOtp,
    driverEtaMin,
    driverDistKm,
    paymentMethod: paymentMethod || "UPI (Google Pay)",
    status: "DRIVER_ASSIGNED", // DRIVER_ASSIGNED -> DRIVER_ARRIVED -> IN_TRANSIT -> COMPLETED -> CANCELLED
    statusTimeline: [
      { step: "Requested", time: new Date().toLocaleTimeString() },
      { step: "Driver Assigned", time: new Date().toLocaleTimeString() }
    ],
    sosTriggered: false,
    createdAt: new Date().toISOString()
  };

  activeRides.unshift(newRide);

  res.json({
    message: "Driver matched successfully (NFR-1 met: matched in < 2.5s)",
    ride: newRide
  });
});

// 6. Get active ride
app.get('/api/rides/active', (req, res) => {
  const current = activeRides.find(r => ['DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_TRANSIT'].includes(r.status));
  res.json({ activeRide: current || null });
});

// 7. Driver Updates: Arrive at Pickup
app.post('/api/rides/:id/arrive', (req, res) => {
  const ride = activeRides.find(r => r.rideId === req.params.id);
  if (!ride) return res.status(404).json({ error: "Ride not found" });

  ride.status = 'DRIVER_ARRIVED';
  ride.statusTimeline.push({ step: "Driver Arrived at Pickup", time: new Date().toLocaleTimeString() });

  // Update driver coordinates to pickup location
  const driver = drivers.find(d => d.id === ride.driver.id);
  if (driver) {
    driver.lat = ride.pickup.lat;
    driver.lng = ride.pickup.lng;
  }

  res.json({ message: "Driver marked as arrived", ride });
});

// 8. Start Ride with OTP Verification
app.post('/api/rides/:id/start', (req, res) => {
  const { otp } = req.body;
  const ride = activeRides.find(r => r.rideId === req.params.id);
  if (!ride) return res.status(404).json({ error: "Ride not found" });

  if (otp !== ride.otp) {
    return res.status(400).json({ error: "Invalid PIN / OTP. Please ask rider for correct 4-digit PIN." });
  }

  ride.status = 'IN_TRANSIT';
  ride.statusTimeline.push({ step: "Trip Started (OTP Verified)", time: new Date().toLocaleTimeString() });
  res.json({ message: "Trip started successfully", ride });
});

// 9. Complete Ride & Digital Receipt (FR-8)
app.post('/api/rides/:id/complete', (req, res) => {
  const ride = activeRides.find(r => r.rideId === req.params.id);
  if (!ride) return res.status(404).json({ error: "Ride not found" });

  ride.status = 'COMPLETED';
  ride.statusTimeline.push({ step: "Trip Completed", time: new Date().toLocaleTimeString() });

  // Free driver & update earnings
  const driver = drivers.find(d => d.id === ride.driver.id);
  if (driver) {
    driver.status = 'available';
    driver.lat = ride.drop.lat;
    driver.lng = ride.drop.lng;
    driver.trips += 1;
    driver.earningsToday += Math.round(ride.fare * 0.80); // 80% to driver, 20% platform commission
  }

  // Move to completed rides archive
  completedRides.unshift({
    rideId: ride.rideId,
    riderName: ride.riderName,
    driverId: ride.driver.id,
    driverName: ride.driver.name,
    vehicle: `${ride.driver.vehicleModel} (${ride.driver.plateNumber})`,
    pickup: ride.pickupName,
    drop: ride.dropName,
    distanceKm: ride.distanceKm,
    durationMin: ride.durationMin,
    fare: ride.fare,
    paymentMethod: ride.paymentMethod,
    status: 'COMPLETED',
    rating: null,
    feedback: "",
    timestamp: new Date().toISOString()
  });

  res.json({
    message: "Trip completed. Digital invoice generated.",
    ride,
    receipt: {
      invoiceNo: "INV-" + ride.rideId,
      date: new Date().toLocaleDateString(),
      baseFare: Math.round(ride.fare * 0.4),
      distanceFare: Math.round(ride.fare * 0.4),
      timeFare: Math.round(ride.fare * 0.1),
      taxesAndFees: Math.round(ride.fare * 0.1),
      totalPaid: ride.fare,
      paymentMethod: ride.paymentMethod
    }
  });
});

// 10. Cancel Ride (FR-11)
app.post('/api/rides/:id/cancel', (req, res) => {
  const { reason, cancelledBy } = req.body;
  const ride = activeRides.find(r => r.rideId === req.params.id);
  if (!ride) return res.status(404).json({ error: "Ride not found" });

  ride.status = 'CANCELLED';
  ride.cancelReason = reason || "Changed plans";
  ride.cancelledBy = cancelledBy || "rider";
  ride.statusTimeline.push({ step: `Cancelled by ${ride.cancelledBy}`, time: new Date().toLocaleTimeString() });

  const driver = drivers.find(d => d.id === ride.driver.id);
  if (driver) driver.status = 'available';

  res.json({ message: "Ride cancelled successfully", ride });
});

// 11. Rate Ride (FR-9)
app.post('/api/rides/:id/rate', (req, res) => {
  const { rating, feedback } = req.body;
  const past = completedRides.find(r => r.rideId === req.params.id);
  if (past) {
    past.rating = Number(rating);
    past.feedback = feedback || "";
  }
  res.json({ message: "Feedback submitted successfully. Thank you!" });
});

// 12. Emergency SOS Trigger (FR-12)
app.post('/api/rides/:id/sos', (req, res) => {
  const ride = activeRides.find(r => r.rideId === req.params.id);
  if (!ride) return res.status(404).json({ error: "Ride not found" });

  ride.sosTriggered = true;
  ride.statusTimeline.push({ step: "EMERGENCY SOS ALERT ACTIVATED", time: new Date().toLocaleTimeString() });

  res.json({
    message: "EMERGENCY SOS ACTIVATED! Safety Response Team and Emergency Contacts have been alerted with live GPS coordinates.",
    emergencyContactsNotified: ["PCR Police (112)", "+91 99887-66554 (Emergency Contact)"],
    location: ride.driver ? { lat: ride.driver.currentLat, lng: ride.driver.currentLng } : ride.pickup
  });
});

// 13. Ride History (FR-10)
app.get('/api/rides/history', (req, res) => {
  res.json(completedRides);
});

// 14. Admin Overview & SPM Metrics (FR-13, Tut 6, 10, 11)
app.get('/api/admin/overview', (req, res) => {
  const activeCount = activeRides.filter(r => ['DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_TRANSIT'].includes(r.status)).length;
  const completedCount = completedRides.length;
  const totalRev = completedRides.reduce((acc, r) => acc + r.fare, 0);

  res.json({
    liveMetrics: {
      activeRidesCount: activeCount,
      completedRidesCount: completedCount,
      totalDrivers: drivers.length,
      onlineDrivers: drivers.filter(d => d.status !== 'offline').length,
      platformRevenue: totalRev,
      surgeMultiplier
    },
    spmEarnedValue: {
      statusDate: "End of Week 14 / Tutorial 10 baseline",
      PV: "Rs. 5,04,000 (16.8 PM)",
      EV: "Rs. 4,89,000 (16.3 PM)",
      AC: "Rs. 5,28,000 (17.6 PM)",
      SPI: 0.970,
      CPI: 0.926,
      forecastDuration: "26 Weeks (CPM Baseline) + 4 days variance",
      scheduleStatus: "At Risk (Critical path module J recovered)",
      budgetBAC: "Rs. 9,45,000"
    },
    qualityAndDefects: {
      DRE: "92.3% (Target >= 95%)",
      availability: "99.44% (Target >= 99.5%)",
      totalDefectsLogged: 41,
      defectsClosed: 36,
      defectsOpen: 5,
      criticalOpen: 0,
      closureRate: "87.8%"
    },
    drivers
  });
});

// 15. Admin update surge multiplier
app.post('/api/admin/surge', (req, res) => {
  const { factor } = req.body;
  if (factor && factor >= 1.0 && factor <= 3.0) {
    surgeMultiplier = parseFloat(factor);
    return res.json({ message: `Surge updated to ${surgeMultiplier}x`, surgeMultiplier });
  }
  res.status(400).json({ error: "Invalid surge multiplier (must be between 1.0 and 3.0)" });
});

// 16. Admin Driver Verification (FR-2, FR-13)
app.post('/api/admin/drivers/:id/verify', (req, res) => {
  const { action } = req.body; // 'approve' or 'reject'
  const driver = drivers.find(d => d.id === req.params.id);
  if (!driver) return res.status(404).json({ error: "Driver not found" });

  if (action === 'approve') {
    driver.approvalStatus = 'approved';
    driver.status = 'available';
    driver.documents.license = 'VERIFIED';
    driver.documents.rc = 'VERIFIED';
    driver.documents.insurance = 'VERIFIED';
  } else {
    driver.approvalStatus = 'rejected';
    driver.status = 'offline';
  }

  res.json({ message: `Driver ${driver.name} is now ${driver.approvalStatus}`, driver });
});

// 17. SCM / Git Info API
app.get('/api/git/info', (req, res) => {
  res.json({
    repository: "RideEase-OnDemand-RideHailing",
    currentVersion: "v1.0.1",
    baselineTag: "v1.0.0",
    branchingModel: "GitFlow (main, develop, feature/*, release/*, hotfix/*)",
    activeBranches: [
      { name: "main", type: "production", description: "Official deployable release history (v1.0.0, v1.0.1)" },
      { name: "develop", type: "integration", description: "Integration branch for sprint features" },
      { name: "feature/auth-module", type: "feature", description: "FR-1, FR-2: Rider/Driver Authentication" },
      { name: "feature/ride-matching", type: "feature", description: "FR-3, FR-4, FR-6: Ride Booking & GPS Matching" },
      { name: "feature/driver-module", type: "feature", description: "FR-7, FR-11: Driver Turn-by-turn Navigation & Actions" },
      { name: "feature/fare-payment", type: "feature", description: "FR-5, FR-8: Dynamic Pricing & Payment Sandbox" },
      { name: "feature/admin-dashboard", type: "feature", description: "FR-13: Admin Controls & SPM EVM Analytics" },
      { name: "hotfix/v1.0.1-otp-timeout", type: "hotfix", description: "Fixes OTP timeout defect MR-7 from Tutorial 13" }
    ],
    configurationItems: [
      { id: "CI-01", item: "Software Requirements Specification (SRS)", version: "v1.2", baseline: "SRS Baseline M1" },
      { id: "CI-02", item: "Software Project Management Plan (SPMP)", version: "v1.1", baseline: "Planning Baseline M2" },
      { id: "CI-03", item: "Work Breakdown Structure (WBS)", version: "v1.0", baseline: "Planning Baseline M2" },
      { id: "CI-04", item: "Architecture & Database Design", version: "v1.1", baseline: "Design Baseline M3" },
      { id: "CI-05", item: "RideEase Core Application Codebase", version: "v1.0.0", baseline: "Implementation Baseline M4" },
      { id: "CI-06", item: "Verification & Test Suite", version: "v1.0", baseline: "Testing Baseline M6" }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚗 RideEase On-Demand Ride-Hailing Platform Prototype`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📋 SPM Tutorial 14: Software Configuration Management`);
  console.log(`=======================================================`);
});
