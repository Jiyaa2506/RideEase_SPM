# 🚗 RideEase — On-Demand Ride-Hailing Mobile Platform

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Passing-emerald)](https://github.com)
[![Release Version](https://img.shields.io/badge/Release-v1.0.1-blue)](CHANGELOG.md)
[![SPM Conformance](https://img.shields.io/badge/SPM-Tutorial%201--14-purple)](SCM_PLAN.md)
[![Availability](https://img.shields.io/badge/NFR--3%20Availability-99.5%25-green)](http://localhost:3000/api/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Course:** Software Project Management (SPM) — Tutorial 14: Software Configuration Management  
> **Institution:** Department of Computer Science & Engineering, Institute of Technology, Nirma University  
> **Student Authors:** Jayni Khimasia (`23BCE115`) & Jiya Patel (`23BCE123`)  
> **Academic Session:** July – December 2026

---

## 📌 Executive Overview
**RideEase** is a production-grade working prototype of an on-demand ride-hailing mobile application modeled on industry leaders such as **Uber** and **Ola**. The project synthesizes and implements the software project management concepts established across **Tutorials 1 through 13**, demonstrating comprehensive **Software Configuration Management (SCM)** using Git and GitHub (Tutorial 14).

### Key Features
- **📱 Rider Application:** Instant pickup/drop geolocation selection, interactive Leaflet.js live map, 4-tier vehicle categories (Auto, Mini, Sedan, Premier), dynamic surge pricing engine, cashless checkout (UPI, Wallet, Card), driver ETA tracking, 4-digit security PIN/OTP, emergency SOS button, digital receipt generator, and two-way star ratings.
- **🚖 Driver Companion App:** Online/Offline availability toggle, incoming ride dispatch sheet with 15-second countdown timer, turn-by-turn navigation simulation, passenger PIN verification, and daily earnings ledger.
- **📊 Admin Operations Dashboard:** Real-time platform KPI monitoring, driver document verification (RC, Driving License, Insurance), manual/automatic dynamic surge pricing slider (1.0x to 2.5x), and SPM Earned Value Metrics (PV, EV, AC, SPI 0.970, CPI 0.926).
- **🌿 Git & SCM Explorer:** In-app visual GitFlow branching tree, Configuration Identification (CI) baseline registry, and terminal log verification.

---

## 🗺️ Real-World Reference & SPM Alignment
| Tutorial | SPM Subject Milestone | Implementation in RideEase Prototype |
|---|---|---|
| **Tut 1** | Software Requirements Specification (SRS) | 14 Functional Requirements (`FR-1` to `FR-14`) and 9 Non-Functional Requirements (`NFR-1` to `NFR-9`) mapped in [`docs/SRS_TRACEABILITY_MATRIX.md`](docs/SRS_TRACEABILITY_MATRIX.md). |
| **Tut 2** | Process Model Selection | Agile Scrum iterative sprints supported by DevOps continuous integration (`.github/workflows/ci.yml`). |
| **Tut 3** | Software Project Management Plan (SPMP) | 6-role responsibility matrix and sprint milestone structure. |
| **Tut 4** | Work Breakdown Structure (WBS) | Full implementation of WBS item `1.4 System Development` and `1.5 Integration`. |
| **Tut 5** | Project Scheduling & CPM | 26-week critical path schedule baseline with milestone alignment (`M1` through `M8`). |
| **Tut 6** | Process & Project Metrics | Sized at 28 KLOC, 220 Function Points, DRE 92.3%, Availability 99.44%. |
| **Tut 7 & 8** | Effort Estimation & Make-or-Buy | **Make:** Matching & Pricing Engine, Admin Dashboard. **Buy/Integrate:** Leaflet maps, simulated UPI/Card payment gateway, and SMS/OTP. |
| **Tut 9** | Risk Management | Proactive handling of Risk `R-5` (Schedule), `R-8` (Payment Security), `R-12` (Matching Latency), and `R-13` (Third-Party APIs). |
| **Tut 10** | Monitoring & Earned Value (EVM) | Real-time monitoring of PV (₹5.04L), EV (₹4.89L), AC (₹5.28L), SPI 0.970, and defect closure rate (87.8%). |
| **Tut 11** | Software Project Audit | Formal closure of Audit Non-Conformance `F-7` (SCM Plan) and `F-3` (Requirements Traceability). |
| **Tut 12** | Quality Assurance & QC | Execution of automated unit test suite (`npm test`) and QC verification checklist. |
| **Tut 13** | Software Maintenance | Resolution of Maintenance Request `MR-7` (OTP timeout defect) released in `hotfix/v1.0.1-otp-timeout`. |
| **Tut 14** | Software Configuration Management | Complete GitFlow branching, release tagging (`v1.0.0`, `v1.0.1`), SemVer release management, and GitHub repository organization. |

---

## 🏗️ Architecture & Technology Stack
- **Backend / API Engine:** Node.js, Express.js, RESTful Architecture, CORS.
- **Frontend User Interfaces:** Modern Vanilla JavaScript (ES6+), HTML5, CSS3, Plus Jakarta Sans, FontAwesome 6.
- **Mapping & Geolocation:** Leaflet.js, OpenStreetMap CartoDB Tiles, Haversine Distance Algorithm.
- **Testing & Verification:** Automated Node.js Test Suite (`tests/run-tests.js`).
- **Configuration Management:** Git 2.47+, GitFlow Branching Model, GitHub Actions (`.github/workflows/ci.yml`), Semantic Versioning 2.0.0.

---

## ⚡ Quick Start & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x, v20.x, or v22.x)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/jaynikhimasia/RideEase-Prototype.git
cd RideEase
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Automated Tests
```bash
npm test
```
*Expected Output: `All automated tests passed successfully! Ready for SCM Release v1.0.0.`*

### 4. Start the Application
```bash
npm start
```
*Open your web browser and navigate to: **`http://localhost:3000`***

---

## 🌿 Software Configuration Management (SCM) Activities

### 1. GitFlow Branching Model
```
main               ------------------- [v1.0.0] ------------------- [v1.0.1]
                           ^                               ^
                           | (merge release/v1.0.0)        | (merge hotfix/v1.0.1)
develop            --------*-------------------------------*--------
                      ^         ^          ^          ^
                      |         |          |          |
feature/modules    --(auth)--(matching)--(driver)--(admin)
```

- **`main`:** Stable, deployable production releases. Protected branch.
- **`develop`:** Active development integration branch.
- **`feature/*`:** Isolated sprint feature branches:
  - `feature/auth-module` (FR-1, FR-2)
  - `feature/ride-matching` (FR-3, FR-4, FR-6)
  - `feature/driver-module` (FR-7, FR-11)
  - `feature/fare-payment` (FR-5, FR-8)
  - `feature/admin-dashboard` (FR-13)
- **`release/v1.0.0`:** Stabilization branch for Milestone M7.
- **`hotfix/v1.0.1-otp-timeout`:** Emergency patch addressing defect `MR-7`.

### 2. Semantic Versioning & Tags
- `v0.1.0-baseline`: Initial documentation baseline (SRS, SPMP, WBS).
- `v1.0.0`: First official functional prototype release (Milestone M4 & M7).
- `v1.0.1`: Maintenance hotfix release (MR-7 OTP timeout resolved).

---

## 👥 Authors & Academic Declaration
This project is submitted in partial fulfillment of the requirements for the **Software Project Management** course at **Nirma University**.

- **Jayni Khimasia** — Roll No: `23BCE115`
- **Jiya Patel** — Roll No: `23BCE123`

*Department of Computer Science & Engineering, School of Technology, Institute of Technology, Nirma University, Ahmedabad – 382481.*
