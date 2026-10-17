# Changelog

All notable changes to the **RideEase** On-Demand Ride-Hailing Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.0.1] - 2026-10-17
### Fixed
- **Authentication & Ride OTP Verification (MR-7):** Resolved OTP verification race condition where delayed SMS token generated an erroneous timeout. Added immediate synchronized 4-digit PIN exchange between Rider and Driver interfaces.
- **Audit Non-Conformance F-7:** Established formal Software Configuration Management (SCM) plan, GitFlow branching model, baseline tags, and CI/CD pipelines.

---

## [v1.0.0] - 2026-10-12
### Added
- **Rider Experience Module (WBS 1.4.2):**
  - Instant location input with preset locations (Nirma University, Vaishno Devi Circle, Airport, Railway Station, GIFT City, etc.).
  - Interactive Leaflet.js map with dynamic route waypoints and real-time cab pins.
  - Multi-tier vehicle selection (Auto, Mini, Sedan, Premier).
  - Dynamic surge pricing estimation engine (FR-5).
  - Cashless payment options (UPI, Wallet, Card, Cash).
  - In-app safety features: SOS emergency alert (FR-12) and Share Trip link.
  - Digital invoice/receipt generator (FR-8) and 5-star two-way rating system (FR-9).
- **Driver Companion Module (WBS 1.4.3):**
  - Online/Offline toggle with real-time status broadcasting.
  - Incoming ride request modal with 15-second countdown timer.
  - Turn-by-turn navigation simulation and trip status lifecycle (`DRIVER_ASSIGNED` -> `DRIVER_ARRIVED` -> `IN_TRANSIT` -> `COMPLETED`).
  - Driver daily earnings and trip counter.
- **Admin Operations Dashboard (WBS 1.4.6, FR-13):**
  - Real-time fleet monitoring and active ride count.
  - Driver onboarding and document verification (Driving license, RC, Insurance).
  - Operational surge multiplier slider (1.0x to 2.5x) with instant broadcast.
  - SPM Earned Value Metrics (PV, EV, AC, SPI 0.970, CPI 0.926) and Defect Burndown chart (Tutorial 10 & 11).
- **Automated Test Suite (WBS 1.6):**
  - Unit tests for Haversine distance, dynamic surge pricing, driver matching algorithm, and OTP verification.
- **Deployment & Documentation (Milestone M7):**
  - Node.js Express full-stack architecture with REST API endpoints.
  - SCM baseline tags and repository release notes.

---

## [v0.1.0-baseline] - 2026-07-21
### Added
- Initial project initiation, Software Requirements Specification (SRS), Software Project Management Plan (SPMP), and Work Breakdown Structure (WBS) baselines (Milestones M1–M3).
