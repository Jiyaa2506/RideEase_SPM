# Requirements Traceability Matrix (RTM)
## Project: RideEase — An On-Demand Ride-Hailing Mobile Application
**Course:** Software Project Management (Tutorial 14)  
**Authors:** Jayni Khimasia (23BCE115) & Jiya Patel (23BCE123)  
**Closes:** Internal Audit Finding F-3 (Tutorial 11)

---

| Req ID | Requirement Description | Use Case ID | WBS Ref | Source File / Implementation | Test Case Ref | Status |
|---|---|---|---|---|---|---|
| **FR-1** | Rider registration and authentication via phone/email | UC-1 | 1.4.1 | `server.js` (`/api/auth/rider`), `public/index.html` | `TC-AUTH-01` | **Implemented** |
| **FR-2** | Driver registration, document upload & admin verification | UC-10, UC-14 | 1.4.1 | `server.js` (`/api/admin/drivers/:id/verify`), `public/js/app.js` | `TC-AUTH-02` | **Implemented** |
| **FR-3** | Request ride by entering pickup & destination | UC-3 | 1.4.2 | `public/index.html` (Location Selector), `public/js/app.js` | `TC-RIDE-01` | **Implemented** |
| **FR-4** | Match rider with nearest available driver using GPS | UC-3, UC-11 | 1.4.2 | `server.js` (`/api/rides/request`), Haversine logic | `Test Group 3` (`tests/run-tests.js`) | **Implemented** |
| **FR-5** | Calculate estimated fare with dynamic surge pricing | UC-3 | 1.4.4 | `server.js` (`/api/fare/estimate`), `public/js/app.js` | `Test Group 2` (`tests/run-tests.js`) | **Implemented** |
| **FR-6** | Display driver live location, vehicle details & ETA | UC-4 | 1.4.2 | `public/js/app.js` (`setupActiveRideView`), Leaflet map | `TC-MAP-01` | **Implemented** |
| **FR-7** | Turn-by-turn navigation & status updates for driver | UC-12 | 1.4.3 | `public/index.html` (Driver View), `public/js/app.js` | `TC-DRV-01` | **Implemented** |
| **FR-8** | Digital payment processing & invoice receipt | UC-5 | 1.4.4 | `server.js` (`/api/rides/:id/complete`), `receipt-breakdown` | `TC-PAY-01` | **Implemented** |
| **FR-9** | Two-way rating & feedback review system | UC-6 | 1.4.5 | `server.js` (`/api/rides/:id/rate`), Star rating modal | `TC-RAT-01` | **Implemented** |
| **FR-10**| Maintain accessible ride history | UC-7 | 1.4.2 | `server.js` (`/api/rides/history`) | `TC-HIST-01` | **Implemented** |
| **FR-11**| Ride cancellation before trip starts | UC-8 | 1.4.2 | `server.js` (`/api/rides/:id/cancel`), `btnCancelActiveRide` | `TC-CANC-01` | **Implemented** |
| **FR-12**| Emergency SOS button & Share Trip | UC-9 | 1.4.2 | `server.js` (`/api/rides/:id/sos`), `btnSosTrigger` | `TC-SOS-01` | **Implemented** |
| **FR-13**| Administrative dashboard for fleet & reports | UC-15 | 1.4.6 | `public/index.html` (Admin View), `server.js` (`/api/admin`) | `TC-ADM-01` | **Implemented** |
| **FR-14**| Status alerts & notifications for ride progression | UC-4 | 1.4.2 | `public/js/app.js` (`showToast`), Driver Alert modal | `TC-NOTIF-01` | **Implemented** |
| **NFR-1**| Matching speed within 10 seconds | - | 1.4.2 | Nearest-driver sort in `server.js` (Executes in < 2.5s) | `Test Group 3` | **Satisfied** |
| **NFR-3**| System Availability target >= 99.5% | - | 1.7 | `server.js` (`/api/health` 99.5% uptime badge) | `Test Group 5` | **Satisfied** |
| **NFR-4**| Security & tokenized transactions | - | 1.3.4 | 4-Digit Security OTP & No raw card storage | `Test Group 4` | **Satisfied** |
| **NFR-5**| Usability: intuitive Uber-like booking | - | 1.3.3 | Polished Responsive Dark UI with Leaflet Maps | `TC-UI-01` | **Satisfied** |
