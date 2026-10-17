# Software Configuration Management (SCM) Plan
## Project: RideEase — An On-Demand Ride-Hailing Mobile Application
**Course:** Software Project Management (Tutorial 14)  
**Authors:** Jayni Khimasia (23BCE115) & Jiya Patel (23BCE123)  
**Institution:** Department of Computer Science & Engineering, Institute of Technology, Nirma University  
**Date:** October 2026  
**Document Version:** v1.2 (Closes Audit Finding F-7)

---

### 1. Introduction & Purpose
This Software Configuration Management (SCM) Plan defines the process, tools, responsibilities, and standards used to identify, control, audit, and release software configuration items throughout the RideEase lifecycle. It directly resolves **Internal Audit Finding F-7** and implements the requirements of SPM Tutorial 14.

---

### 2. SCM Roles and Responsibilities
| Role | Person / Title | SCM Responsibility |
|---|---|---|
| **SCM Manager / PM** | Jayni Khimasia | Oversees baseline creation, approves release branches, reviews CCB change requests. |
| **Release Engineer** | Jiya Patel | Maintains Git branching, tags release versions, configures CI/CD workflows. |
| **Lead Developer** | Backend / Frontend Dev | Creates feature branches, submits pull requests with peer reviews. |
| **QA Engineer** | QA Lead | Validates test pass criteria before baseline approval (Tutorial 12 QC Checklist). |

---

### 3. Configuration Identification & Baselines
A Configuration Item (CI) is an entity that has been formally reviewed and agreed upon, which can only be changed through formal change control.

| CI ID | Configuration Item | Format / Path | Baseline Milestone | Control Level |
|---|---|---|---|---|
| **CI-01** | Software Requirements Specification (SRS) | `docs/SRS.md` | Milestone M1 | Controlled |
| **CI-02** | Software Project Management Plan (SPMP) | `docs/SPMP.md` | Milestone M2 | Controlled |
| **CI-03** | Work Breakdown Structure (WBS) | `docs/WBS.md` | Milestone M2 | Controlled |
| **CI-04** | Architecture & DB Schema | `docs/ARCHITECTURE.md` | Milestone M3 | Controlled |
| **CI-05** | RideEase Application Codebase | `server.js`, `public/` | Milestone M4 (Core) & M7 | Versioned |
| **CI-06** | Test Suite & QC Checklist | `tests/run-tests.js` | Milestone M6 | Versioned |
| **CI-07** | Deployment Configuration | `package.json`, `.github/` | Milestone M7 | Versioned |

---

### 4. Git Branching & Merging Strategy (GitFlow)
RideEase adheres to standard **GitFlow** branching model:

```
[main]          ------------------- v1.0.0 ------------------- v1.0.1 (Production)
                        ^                          ^
                        | (release/v1.0.0)         | (hotfix/v1.0.1-otp-timeout)
[develop]       --------*--------------------------*--------- (Integration)
                   ^         ^          ^
                   |         |          |
[feature/*]   ---(auth)---(matching)---(admin)---
```

1. **`main` Branch:**
   - Contains only official, production-ready code.
   - Direct commits are strictly prohibited.
   - Every merge into `main` is tagged with a Semantic Version (`v1.0.0`, `v1.0.1`).
2. **`develop` Branch:**
   - Serves as the primary integration branch for sprint features.
   - Tested automatically via GitHub Actions CI pipeline.
3. **`feature/<feature-name>` Branches:**
   - Branched off `develop`.
   - Examples: `feature/auth-module`, `feature/ride-matching`, `feature/fare-payment`, `feature/driver-module`, `feature/admin-dashboard`.
   - Merged back to `develop` via Pull Requests with mandatory peer review.
4. **`release/<version>` Branches:**
   - Created when `develop` reaches a release milestone (e.g. `release/v1.0.0`).
   - Minor bug fixes, version bumps, and documentation polish only.
   - Merged into both `main` and `develop`.
5. **`hotfix/<version>` Branches:**
   - Created directly from `main` to address critical production defects (e.g. `hotfix/v1.0.1-otp-timeout`).
   - Merged into both `main` and `develop` to prevent regression.

---

### 5. Versioning & Release Management (SemVer)
Version numbers follow the **Semantic Versioning 2.0.0** convention: `MAJOR.MINOR.PATCH`
- **MAJOR:** Incompatible API or architectural changes (e.g., `v2.0.0`).
- **MINOR:** Backward-compatible functionality added (e.g., `v1.1.0` advance ride booking).
- **PATCH:** Backward-compatible bug fixes (e.g., `v1.0.1` OTP timeout fix).

---

### 6. Change Control & Pull Request Procedure
1. Developer creates a branch from `develop`: `git checkout -b feature/module-name develop`.
2. Developer commits changes with clear commit messages following conventional format (`feat:`, `fix:`, `docs:`, `test:`).
3. Developer runs local automated tests: `npm test`.
4. Developer opens a Pull Request using `.github/PULL_REQUEST_TEMPLATE.md`.
5. Peer review is performed by another team member.
6. CI automated build and unit test workflow must succeed.
7. PR is squash-merged into `develop`.

---

### 7. Configuration Status Accounting & Audits
- **Functional Configuration Audit (FCA):** Validates that the developed application performs all functions defined in the SRS (FR-1 through FR-14).
- **Physical Configuration Audit (PCA):** Validates that all design artifacts, documentation, test suites, and source code modules are present and properly baselined.
