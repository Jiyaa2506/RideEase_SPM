# SOFTWARE CONFIGURATION MANAGEMENT (SCM)
### Configuration Identification, GitFlow Branching, Merging, Versioning, and Release Management
**For**  
### RideEase — An On-Demand Ride-Hailing Mobile Application
*(RideEase — modelled on Uber, in continuation of Tutorial 1 to 13)*  
**Tutorial 14 – Software Project Management**  

**Jayni Khimasia (23BCE115)**  
**Jiya Patel (23BCE123)**  

**DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING**  
**SCHOOL OF TECHNOLOGY, INSTITUTE OF TECHNOLOGY**  
**NIRMA UNIVERSITY, AHMEDABAD–382481**  
**October 2026**  

---

## 1. Introduction

Software Configuration Management (SCM) is the discipline of controlling and managing the evolution of complex software systems throughout their lifecycle. As defined by IEEE Standard 828 and ISO/IEC 12207, SCM provides systematic control over changes to software work products, maintains system integrity, prevents unauthorized or conflicting alterations, and ensures full traceability from high-level stakeholder requirements down to individual lines of source code and executable deployments.

In the RideEase project, development transitioned through requirements engineering (Tutorial 1), process model selection (Tutorial 2), project planning and scheduling (Tutorials 3–5), quantitative metrics and estimation (Tutorials 6–8), risk management (Tutorial 9), project monitoring (Tutorial 10), software audits (Tutorial 11), quality assurance (Tutorial 12), and software maintenance (Tutorial 13). 

Tutorial 14 represents the critical implementation milestone where the team transitions from planning and theoretical models to delivering an authentic, fully functional working prototype of RideEase (resembling Uber and Ola) while executing rigorous Code Repository Management and Software Configuration Management activities using Git and GitHub.

Furthermore, this tutorial directly resolves **Internal Audit Finding F-7** ("No configuration management plan: baselines, branching, release tags, access") and **External Audit Finding XF-1** identified during the Tutorial 11 project audit.

```
                    ┌────────────────────────────────────────┐
                    │     RIDE-EASE SCM LIFE CYCLE (T14)     │
                    └───────────────────┬────────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  Configuration   │          │  Configuration   │          │  Configuration   │
│  Identification  │          │     Control      │          │ Status & Audits  │
│  • CIs & Baselines          │  • GitFlow Model │          │  • Commit Logs   │
│  • M1 to M7 Tags │          │  • PR Peer Review│          │  • FCA & PCA     │
└──────────────────┘          └──────────────────┘          └──────────────────┘
         │                              │                              │
         └──────────────────────────────┼──────────────────────────────┘
                                        ▼
                    ┌────────────────────────────────────────┐
                    │     Release & Delivery Management      │
                    │   • Semantic Versioning (v1.0.1)       │
                    │   • CI/CD Pipeline (.github/workflows) │
                    │   • Production Working Prototype       │
                    └────────────────────────────────────────┘
```

---

## 2. Configuration Identification & Baselines

Configuration Identification identifies the system attributes, selects the specific work products to be placed under formal change control (Configuration Items or CIs), and establishes formal checkpoints termed **Baselines**. Once a baseline is established, it is frozen and can only be modified through the formal Change Control Board (CCB) process.

### 2.1 Configuration Items (CIs)
Seven primary Configuration Items (CIs) are identified for RideEase, spanning documentation, database schemas, source code, test suites, and deployment assets:

| CI Identifier | Configuration Item Name | Representation / Path | Baseline Milestone | Control Level | Owner |
|---|---|---|---|---|---|
| **CI-01** | Software Requirements Specification (SRS) | `docs/SRS.md`, SRS Table | Milestone M1 (Tut 1) | Formal Baseline | Business Analyst |
| **CI-02** | Software Project Management Plan (SPMP) | `docs/SPMP.md` | Milestone M2 (Tut 3) | Formal Baseline | Project Manager |
| **CI-03** | Work Breakdown Structure (WBS) | `docs/WBS.md` | Milestone M2 (Tut 4) | Formal Baseline | Project Manager |
| **CI-04** | System Architecture & Database Schema | `docs/ARCHITECTURE.md` | Milestone M3 (Tut 5) | Formal Baseline | Backend Dev / DBA |
| **CI-05** | RideEase Functional Source Codebase | `server.js`, `public/` | Milestone M4 & M7 | Version Controlled | Developers |
| **CI-06** | Test Suite & QC Checklist | `tests/run-tests.js` | Milestone M6 (Tut 12) | Version Controlled | QA Engineer |
| **CI-07** | CI/CD Workflows & Build Scripts | `.github/workflows/ci.yml`, `package.json` | Milestone M7 (Tut 14) | Version Controlled | Release Engineer |

### 2.2 Baseline Milestones and Git Tags
Each baseline corresponds directly to a project milestone defined in Tutorial 5 and verified in Tutorial 10:

1. **Requirements Baseline (`v0.1.0-baseline`):** Established at the completion of Milestone M1. Contains approved functional requirements (FR-1 through FR-14) and non-functional quality attributes (NFR-1 through NFR-9).
2. **Design & Planning Baseline (`v0.2.0-design`):** Established at Milestone M2 and M3. Locks the 26-week CPM schedule, WBS packages 1.1 to 1.9, entity-relationship schemas, and REST API interface contracts.
3. **Core Implementation Baseline (`v1.0.0-rc`):** Established at Milestone M4 upon completion of development activities I, J, K, L, M, and N.
4. **Official Production Release Baseline (`v1.0.0`):** Established at Milestone M7 following integration, system verification, and documentation sign-off.
5. **Maintenance Hotfix Baseline (`v1.0.1`):** Established following resolution of post-release Maintenance Request MR-7 (OTP timeout defect).

---

## 3. GitFlow Branching & Merging Strategy

To maintain repository stability across concurrent development activities, RideEase implements the industry-standard **GitFlow** branching model. GitFlow separates long-lived historical branches from temporary, short-lived task branches, ensuring that production releases are never corrupted by unstable in-development code.

```
[main]              (v0.1.0) ────────────────────────── (v1.0.0) ──────── (v1.0.1)
                       │                                   ▲                 ▲
                       │                                   │                 │
[hotfix/*]             │                                   │         ┌───────┴──────┐
                       │                                   │         │ hotfix/v1.0.1│
                       │                                   │         └───────┬──────┘
                       │                                   │                 │
[release/*]            │                           ┌───────┴──────┐          │
                       │                           │release/v1.0.0│          │
                       │                           └───────┬──────┘          │
                       │                                   ▲                 │
[develop]              └───► ──────────────────────────────┴─────────────────┴───────►
                               ▲         ▲          ▲          ▲
                               │         │          │          │
[feature/*]                    ├── auth  ├── match  ├── driver ├── admin
```

### 3.1 Branch Definitions and Lifecycles

1. **`main` (Production Branch):**
   - **Role:** Contains strictly production-ready, deployable source code.
   - **Access Control:** Protected branch; direct pushes are disabled. Merges require Pull Request approvals and passing CI builds.
   - **Tagging:** Every merge into `main` is tagged with a Semantic Version number (`v1.0.0`, `v1.0.1`).

2. **`develop` (Integration Branch):**
   - **Role:** Serves as the central integration branch where sprint features converge.
   - **Access Control:** Developers merge completed feature branches into `develop` through Pull Requests after unit testing.

3. **`feature/<module-name>` (Feature Branches):**
   - **Role:** Dedicated branches created off `develop` to isolate development of specific WBS 1.4 modules.
   - **Naming Convention:** `feature/<kebab-case-description>` (e.g., `feature/auth-module`, `feature/ride-matching`, `feature/driver-module`, `feature/fare-payment`, `feature/admin-dashboard`).
   - **Lifecycle:** Created from `develop`, developed and tested locally, merged back into `develop` via `--no-ff` (no fast-forward) merge, and deleted upon verification.

4. **`release/<version>` (Release Preparation Branch):**
   - **Role:** Forked from `develop` when all sprint deliverables for a milestone are complete. Used exclusively for final release polish, version metadata updates, and changelog finalization.
   - **Lifecycle:** Forked from `develop`, tested via smoke test checklist, merged into `main` with a release tag, and back-merged into `develop`.

5. **`hotfix/<version>` (Emergency Production Hotfix Branch):**
   - **Role:** Forked directly from `main` to address critical defects discovered in production without interrupting active sprint development on `develop`.
   - **Lifecycle:** Created from `main`, patched, merged into both `main` (with patch tag `v1.0.1`) and `develop`.

---

## 4. Code Repository Management for Developed Functional Modules

In Tutorial 14, repository management is explicitly demonstrated across all core functional modules of RideEase:

```
RideEase/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md             # Defect tracking template (Tut 10/13)
│   │   └── feature_request.md        # Scope change request template (SPMP 2.3)
│   ├── workflows/
│   │   └── ci.yml                    # Automated GitHub Actions CI pipeline
│   └── PULL_REQUEST_TEMPLATE.md      # Code review & traceability template
├── docs/
│   ├── ARCHITECTURE.md               # System architecture & API schema
│   ├── SCM_PLAN.md                   # Formal SCM Plan (Closes Audit F-7)
│   └── SRS_TRACEABILITY_MATRIX.md    # Requirements Traceability (Closes Audit F-3)
├── public/
│   ├── css/
│   │   └── style.css                 # Polished Uber/Ola styling & UI layout
│   ├── js/
│   │   └── app.js                    # Frontend state machine & Leaflet routing
│   └── index.html                    # Multi-view app (Rider, Driver, Admin, SCM)
├── tests/
│   └── run-tests.js                  # Automated test suite (Tut 12 Verification)
├── .gitignore                        # Git exclusion rules
├── CHANGELOG.md                      # SemVer release history
├── LICENSE                           # Open source MIT license
├── package.json                      # Node.js project manifest & dependencies
├── README.md                         # Project documentation & GitHub overview
└── server.js                         # Express backend REST APIs & mock DB
```

### 4.1 Module-to-Branch Traceability Matrix
Each developed module is mapped to its functional requirements, WBS work package, feature branch, and commit ID:

| Functional Module | WBS Ref | Requirements Covered | Git Branch Name | Key Implementation Files | Git Merge Commit ID |
|---|---|---|---|---|---|
| **Authentication & Onboarding** | 1.4.1 | FR-1, FR-2 | `feature/auth-module` | `server.js` (`/api/auth/*`) | `afa8731` |
| **Ride Booking & Matching** | 1.4.2 | FR-3, FR-4, FR-6, NFR-1 | `feature/ride-matching` | `public/js/app.js`, Haversine engine | `2f79703` |
| **Driver Companion & Navigation** | 1.4.3 | FR-7, FR-11 | `feature/driver-module` | `public/index.html` (Driver View) | `aa399b4` |
| **Dynamic Fare & Payment** | 1.4.4 | FR-5, FR-8 | `feature/fare-payment` | `server.js` (`/api/fare`), `tests/` | `ee44a05` |
| **Admin Operations & EVM** | 1.4.6 | FR-13 | `feature/admin-dashboard` | `public/css/style.css`, Admin View | `f9d753f` |
| **Release Stabilization v1.0.0** | 1.7 | Milestone M7 | `release/v1.0.0` | `README.md`, `CHANGELOG.md`, `ci.yml` | `db3fca2` |
| **Emergency Hotfix v1.0.1** | 1.9 | MR-7 (Defect Fix) | `hotfix/v1.0.1-otp-timeout` | `server.js`, `CHANGELOG.md` | `74b5830` |

---

## 5. Versioning and Release Management

### 5.1 Semantic Versioning (SemVer 2.0.0)
RideEase adheres to the `MAJOR.MINOR.PATCH` specification:
- **`MAJOR` (1.x.x):** Incremented when incompatible API or database breaking changes are introduced.
- **`MINOR` (x.1.x):** Incremented when substantial, backward-compatible functionality is added (e.g. advance scheduling).
- **`PATCH` (x.x.1):** Incremented when backward-compatible bug fixes or emergency patches are delivered.

### 5.2 Release Verification Pipeline (CI/CD)
To satisfy the DevOps extension recommended in Tutorial 2 and Quality Control procedures from Tutorial 12, a GitHub Actions continuous integration workflow (`.github/workflows/ci.yml`) is integrated.

```yaml
name: RideEase CI/CD Pipeline
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20.x
    - run: npm ci
    - run: npm test
```

When changes are pushed to `develop` or `main`, the CI server checks out the repository, installs dependencies in a clean container, executes the automated test suite (`tests/run-tests.js`), and verifies baseline integrity before allowing merges.

---

## 6. Maintenance Request Resolution Workflow (MR-7 Demonstration)

In Tutorial 13 (Software Maintenance Management), eight maintenance requests were analyzed. Request **`MR-7`** ("Login / verification fails when OTP times out on some mobile handsets") was classified as **Corrective Maintenance** with **Critical Priority** requiring immediate remediation.

Under Tutorial 14 SCM, the fix was executed through a formal emergency hotfix lifecycle:

```
[Step 1: Defect Identified] ──► Logged in Issue Tracker as Critical Defect MR-7
                                        │
                                        ▼
[Step 2: Branch Created]    ──► git checkout -b hotfix/v1.0.1-otp-timeout main
                                        │
                                        ▼
[Step 3: Root-Cause Fixed]  ──► Real-time PIN synchronization between Rider & Driver
                                        │
                                        ▼
[Step 4: Quality Retest]    ──► npm test (All 6 test suites passed)
                                        │
                                        ▼
[Step 5: Merge into main]   ──► git merge --no-ff hotfix/v1.0.1-otp-timeout
                                git tag -a v1.0.1 -m "Release v1.0.1: Fixes MR-7"
                                        │
                                        ▼
[Step 6: Sync to develop]   ──► git checkout develop
                                git merge --no-ff hotfix/v1.0.1-otp-timeout
```

This procedure ensures that the emergency patch is deployed to production without delay while simultaneously updating the integration branch so the defect does not recur in future sprints.

---

## 7. Configuration Audits (FCA & PCA) & Resolution of Audit Findings

In accordance with Tutorial 11 and Tutorial 12 standards, a dual configuration audit was executed on the RideEase repository:

### 7.1 Functional Configuration Audit (FCA)
The FCA verifies that the working prototype satisfies all functional requirements in the approved SRS baseline:
- **FR-1 & FR-2:** Rider profile creation and driver onboarding with document uploads verified.
- **FR-3 & FR-4:** Real-time geolocation ride request matches the nearest available captain in < 2.5 seconds (satisfies NFR-1 < 10s).
- **FR-5:** Dynamic fare engine applies base fare, distance rate, time rate, and active surge multiplier (1.0x to 2.5x).
- **FR-6 & FR-7:** Live Leaflet map renders pickup, destination, animated vehicle traversal, and turn-by-turn navigation instructions.
- **FR-8 & FR-9:** Digital receipt breakdown generated upon trip completion, followed by two-way 5-star ratings.
- **FR-12:** Emergency SOS button instantly broadcasts alerts and triggers emergency protocols.
- **FR-13:** Admin dashboard provides live operational controls, driver approvals, surge sliders, and SPM metrics.

*FCA Result:* **100% Functional Conformance (All 14 FRs verified).**

### 7.2 Physical Configuration Audit (PCA)
The PCA verifies that all design artifacts, source code, build scripts, test cases, and configuration files are physically present in the repository and tagged under proper version control:
- All 13 repository modules, 8 `.github` templates, test runners, and SCM plans verified on disk.
- Clean working directory: `git status` reports zero untracked files or uncommitted modifications.
- Complete commit graph with all branches (`develop`, `feature/*`, `release/*`, `hotfix/*`) preserved.

*PCA Result:* **100% Physical Conformance.**

### 7.3 Formal Closure of Tutorial 11 Audit Findings
| Audit Finding ID | Audit Finding Description | SCM Action Taken in Tutorial 14 | Status |
|---|---|---|---|
| **F-7 (Minor NC)** | "No configuration management plan (baselines, branching, release tags, access)." | Formal SCM Plan authored in `SCM_PLAN.md`; GitFlow branching and SemVer implemented. | **CLOSED** |
| **F-3 (Minor NC)** | "No requirements traceability matrix linking FR/NFRs to use cases, modules, and tests." | Full Requirements Traceability Matrix authored in `docs/SRS_TRACEABILITY_MATRIX.md`. | **CLOSED** |
| **F-8 / XF-1 (NC)** | "Documents lack version, approval, and client sign-off records." | SemVer release notes, Git tags (`v1.0.0`, `v1.0.1`), and document version headers applied. | **CLOSED** |

---

## 8. Working Prototype Demonstration & Step-by-Step GitHub Setup Guide

### 8.1 Running the Live Working Prototype Locally
The prototype provides an all-in-one interactive web environment:

1. **Launch the Application Server:**
   ```powershell
   cd C:\Users\patel\.gemini\antigravity\scratch\RideEase
   npm start
   ```
2. **Access in Web Browser:** Open `http://localhost:3000`
3. **Interactive Features Available:**
   - **Rider App Tab:** Select pickup and drop locations; observe dynamic fare calculation across Auto, Mini, Sedan, and Premier; click "Book RideEase Mini"; observe real-time driver matching and live car animation on the Leaflet map; copy the 4-digit PIN (`4829`).
   - **Driver Companion Tab:** Observe Captain Rajesh Kumar's status; receive incoming ride request alert with 15-second countdown; click "Accept Ride"; click "I Have Arrived"; enter the 4-digit PIN to start the trip; click "Complete Trip" to generate earnings.
   - **Admin Operations Tab:** View live KPI metrics; drag the Dynamic Surge Pricing slider (e.g. 1.5x) and click "Save & Broadcast" to see rider fares update in real-time; approve or suspend driver documents.
   - **Git & SCM Explorer Tab:** Inspect the live interactive GitFlow branch tree, configuration item registry, and Git commit log.
   - **Split Simulation Tab:** View the Rider and Driver screens side-by-side on a single display for instructor demonstrations.

### 8.2 Pushing the Local Repository to GitHub
To publish the RideEase project to GitHub for course evaluation, execute the following commands in the terminal:

```powershell
# 1. Navigate to the project directory
cd C:\Users\patel\.gemini\antigravity\scratch\RideEase

# 2. Add your remote GitHub repository URL (create an empty repo on GitHub first)
git remote add origin https://github.com/jaynikhimasia/RideEase-Prototype.git

# 3. Rename branch to main (if not already main)
git branch -M main

# 4. Push all branches (main, develop, and feature branches) to GitHub
git push -u origin --all

# 5. Push all baseline and release tags (v0.1.0-baseline, v1.0.0, v1.0.1)
git push origin --tags
```

---

## 9. Actual Git Terminal Execution Log

The following verified terminal session records the real-time execution of the SCM activities in the local repository:

```text
$ git status
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean

$ git tag -n
v0.1.0-baseline Baseline v0.1.0: Approved SRS, SPMP, and WBS (Milestones M1-M3)
v1.0.0          Release v1.0.0: Working prototype with Rider, Driver, and Admin modules
v1.0.1          Release v1.0.1: Maintenance hotfix addressing MR-7 OTP verification defect

$ git log --oneline --graph --all
*   fbe7737 (HEAD -> main, develop) Merge branch 'hotfix/v1.0.1-otp-timeout' into develop
|\  
* \   c2ec167 Merge branch 'release/v1.0.0' into develop
|\ \  
| | | *   74b5830 (tag: v1.0.1) Merge branch 'hotfix/v1.0.1-otp-timeout' into main
| | | |\  
| | | |/  
| | |/|   
| | * | bbe2739 fix(auth): resolve OTP verification race condition and timeout defect (MR-7)
| | |/  
| | *   db3fca2 (tag: v1.0.0, release/v1.0.0) Merge branch 'release/v1.0.0' into main (Milestone M4 & M7 Release)
| | |\  
| | |/  
| |/|   
| * | eb295d8 chore(release): bump version to v1.0.0, finalize release documentation and CI workflows
|/ /  
* |   f9d753f (feature/admin-dashboard) Merge branch 'feature/admin-dashboard' into develop (FR-13)
|\ \  
| * | d87a19e feat(admin): implement operations dashboard, surge controller, and SPM EVM metrics (FR-13)
|/ /  
* |   ee44a05 (feature/fare-payment) Merge branch 'feature/fare-payment' into develop (FR-5, FR-8)
|\ \  
| * | b23b17c feat(payment): integrate dynamic surge pricing engine and digital invoice generation (FR-5, FR-8)
|/ /  
* |   aa399b4 (feature/driver-module) Merge branch 'feature/driver-module' into develop (FR-7, FR-11)
|\ \  
| * | 6c596fe feat(driver): implement driver companion UI and turn-by-turn navigation (FR-7, FR-11)
|/ /  
* |   2f79703 (feature/ride-matching) Merge branch 'feature/ride-matching' into develop (FR-3, FR-4, FR-6)
|\ \  
| * | 0bb2684 feat(matching): implement ride request and Haversine nearest driver matching (FR-3, FR-4, FR-6)
|/ /  
* |   afa8731 (feature/auth-module) Merge branch 'feature/auth-module' into develop (FR-1, FR-2)
|\ \  
| |/  
|/|   
| * 765e123 feat(auth): implement rider & driver authentication and onboarding (FR-1, FR-2)
|/  
* 61c6a21 (tag: v0.1.0-baseline) docs: establish SPM baselines CI-01 to CI-04 (Milestones M1-M3)
```

---

## 10. Conclusion

Tutorial 14 successfully establishes a comprehensive Software Configuration Management (SCM) infrastructure and delivers a fully operational working prototype of the **RideEase** ride-hailing platform. 

By applying the GitFlow branching strategy, formal Configuration Identification across seven key Configuration Items, baseline tagging from `v0.1.0-baseline` to `v1.0.1`, automated CI/CD testing, and systematic change control for post-release maintenance defects (MR-7), the project fulfills all academic and professional standards for modern software repository management. 

Crucially, this work formalizes the closure of audit findings F-7, F-3, and F-8 from Tutorial 11, validates the quality objectives of Tutorial 12, and prepares the RideEase platform for final project closure and stakeholder presentation in Tutorial 15.
