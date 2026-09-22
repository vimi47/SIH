# BhoomiRaksha AI — User Guide

> **Prototype for Smart India Hackathon (SIH)**  
> AI-assisted land acquisition monitoring system for Indian infrastructure corridors  
> Data source: MoRTH BhoomiRashi · 2,540 real government projects

---

## Table of Contents

1. [What is BhoomiRaksha AI?](#1-what-is-bhoomiraksha-ai)
2. [Getting Started — Login](#2-getting-started--login)
3. [Recommended Workflow](#3-recommended-workflow)
4. [Page-by-Page Guide](#4-page-by-page-guide)
   - [4.1 Overview (Dashboard)](#41-overview-dashboard)
   - [4.2 Projects](#42-projects)
   - [4.3 Project Detail](#43-project-detail)
   - [4.4 GIS Map](#44-gis-map)
   - [4.5 Simulation (What-If Analysis)](#45-simulation-what-if-analysis)
   - [4.6 Analytics](#46-analytics)
   - [4.7 Reports](#47-reports)
   - [4.8 Audit Logs (Admin only)](#48-audit-logs-admin-only)
5. [User Roles](#5-user-roles)
6. [Understanding Risk Categories](#6-understanding-risk-categories)
7. [Glossary](#7-glossary)

---

## 1. What is BhoomiRaksha AI?

BhoomiRaksha AI is a decision-support portal for government officers managing land acquisition under the **National Highway Authority of India (NHAI)** and **Ministry of Road Transport & Highways (MoRTH)**.

It ingests real BhoomiRashi gazette records and uses a **Random Forest ML model** to predict land acquisition delays, classify project risk, and surface projects that need immediate attention — all from one dashboard.

**Key capabilities:**
- Monitor 2,540+ live National Highway projects
- Predict delay in days using Section 3a → 3A → 3D statutory timelines
- Visual risk map across India (GIS layer)
- What-if simulation: see what happens to delay if you intervene today
- Export project registers and audit logs as CSV
- Full action audit trail for accountability

---

## 2. Getting Started — Login

Open the app at: **`http://localhost:5173`**

You will land on the **Login** page. Enter your credentials:

| Role | What you can do |
|------|----------------|
| **Field Officer** | View dashboard, projects, map, analytics, simulation, reports |
| **Admin** | Everything above + access to the Audit Logs page |

> **For the prototype demo:** Use any name and select a role. The system will store your session so the audit trail records your name against every action.

After login, you are taken to the **Overview (Dashboard)** page.

---

## 3. Recommended Workflow

Follow this sequence for a complete project review session:

```
Login
  │
  ▼
① Overview  ──── Check KPIs, alerts, and priority projects
  │
  ▼
② Projects  ──── Search / filter the full project register
  │
  ▼
③ Project Detail  ─── Deep-dive into one project record
  │
  ▼
④ GIS Map  ──── See geographic risk distribution across India
  │
  ▼
⑤ Simulation  ── Run a what-if to estimate intervention impact
  │
  ▼
⑥ Analytics  ─── Compare states and districts
  │
  ▼
⑦ Reports  ──── Download data, check model quality
  │
  ▼
⑧ Audit Logs  ── (Admin) Review all actions taken in the system
```

---

## 4. Page-by-Page Guide

---

### 4.1 Overview (Dashboard)

**Navigation:** Click **Overview** in the top nav bar.

This is your command centre. It loads automatically when you log in.

#### What you see

| Panel | Description |
|-------|-------------|
| **KPI Cards** (top row) | Four live metrics pulled from the backend |
| **Priority Projects** | Top 5 most at-risk projects, sorted by severity then delay days |
| **Alerts** | Early-warning triggers from the ML model |
| **Intervention count** | Number of projects with active recommended interventions |

#### KPI Cards explained

| Card | What it measures |
|------|-----------------|
| **Projects monitored** | Total projects in the BhoomiRashi register |
| **High priority cases** | Count of CRITICAL + HIGH risk projects combined |
| **Average delay** | Mean predicted delay across all projects (in days) |
| **Sanction value** | Total sanctioned project value in Crore ₹ |

#### What to do here

1. **Check the KPI cards** — if "High priority cases" is large, go straight to the Projects page filtered by CRITICAL.
2. **Click any project name in the Priority Projects panel** — it takes you directly to that project's detail page.
3. **Click an alert** — links directly to the relevant project.
4. Click **"Open project register"** button to go to the Projects page.
5. Click **"View analytics"** to jump to the Analytics page.

---

### 4.2 Projects

**Navigation:** Click **Projects** in the top nav bar.

This is the full searchable, filterable project register — equivalent to the BhoomiRashi database but enriched with ML risk scores.

#### Filters available

| Filter | How to use |
|--------|-----------|
| **Search bar** | Type any keyword — matches project name, project ID (`BR-XXXXX`), district name, or project number |
| **Risk Category dropdown** | Filter to `All`, `Critical`, `High`, `Medium`, or `Low` |

> Filters are **live** — results update as you type. The page resets to page 1 automatically.

#### Table columns

| Column | What it shows |
|--------|--------------|
| **Project** | Project name (clickable) + Project ID + Sanction number |
| **Location** | District and State |
| **Progress** | Land acquisition progress bar — percentage acquired vs required hectares |
| **Risk** | Risk category badge (colour-coded) |
| **Action** | "View" link → opens the Project Detail page |

#### Pagination

- Shows **12 projects per page**
- Use **Prev / Next** buttons at the bottom right
- The footer shows "Page X of Y" and total matching count

#### Typical use

- Search `Lucknow` → see all Lucknow projects
- Filter `Critical` → review only the most urgent cases
- Click a project name to open the detail view

---

### 4.3 Project Detail

**Navigation:** Click any project name in the Projects table, or click a priority project on the Dashboard.

This is the deepest view of a single project record. All statutory and land data for one project is shown here.

#### Sections on this page

**1. Project header**
- Full project name and ID
- State and District
- Risk category badge and risk score

**2. Statutory Timeline**
- **Section 3a** — Preliminary notification date and count
- **Section 3A** — Gazette notification date and count
- **Section 3D** — Declaration/Award date and count
- Days taken from 3a → 3A, 3A → 3D, and 3a → 3D (the full acquisition cycle)

**3. Land Status**
- Land required (Hectares)
- Land available and land acquired so far
- Land remaining to be acquired
- Acquisition progress percentage

**4. Financial**
- Sanction amount in Crores ₹
- Sanction number and date

**5. ML Risk Output**
- **Predicted delay (days)** — the model's forecast
- **Predicted delay (months)** — same figure in months
- **Risk score** (0–100) — higher = more at risk
- **Risk category** — CRITICAL / HIGH / MEDIUM / LOW
- **Administrative bottleneck** — e.g. "Section 3D Declaration Overdue"

**6. Quick actions**
- **Run simulation** — links to the Simulation page pre-filled with this project
- **View on BhoomiRashi** — opens the original government portal record in a new tab

---

### 4.4 GIS Map

**Navigation:** Click **Map** in the top nav bar.

The GIS Map plots every project in the register as a **colour-coded dot** on a live OpenStreetMap base layer.

#### Reading the map

| Dot colour | Risk category |
|-----------|--------------|
| 🔴 Red | CRITICAL — delay ≥ 365 days |
| 🟠 Orange | HIGH — delay ≥ 180 days |
| 🟡 Yellow | MEDIUM — delay ≥ 90 days |
| 🟢 Green | LOW — delay < 90 days |

#### Map controls

| Control | What it does |
|---------|-------------|
| **Scroll** | Not active (disabled to avoid accidental zoom while reading) |
| **+ / − buttons** (top left) | Zoom in and out |
| **Click and drag** | Pan the map |
| **Click a dot** | Opens a popup with: project name, district, state, risk category, delay in days |
| **Auto-fit** | On load the map automatically fits to show all plotted projects |

#### Right panel — Legend and project list

- **Legend** shows the four colour categories
- **Project count** shows how many projects are plotted (up to 500)
- **Project list** (scrollable) shows the first 12 projects with name, location, risk badge, and delay days

#### Tips

- Zoom into a dense cluster to identify a hotspot district
- Click individual dots to get the popup, then use the project ID to search in the Projects page
- Dots are rendered on a canvas layer so panning and zooming stays smooth even with 500+ points

---

### 4.5 Simulation (What-If Analysis)

**Navigation:** Click **Simulation** in the top nav bar, or click "Run simulation" from a Project Detail page.

This is the **decision-support engine**. It lets you ask: *"If I resolve legal cases and speed up compensation — by how many days will the delay shrink?"*

#### Step-by-step

**Step 1 — Select a project**  
Use the dropdown to pick any project by name. If you arrived from a Project Detail page, the project is pre-selected.

**Step 2 — Adjust the four intervention sliders**

| Slider | Range | What it controls |
|--------|-------|-----------------|
| **Legal cases** | 0 – 10 | Number of active legal disputes. Lower = fewer delays |
| **Compensation progress** | 0% – 100% | How much of the compensation has been paid out |
| **Approval days** | 10 – 180 days | Days taken for statutory approval |
| **RR progress** | 0% – 100% | Resettlement & Rehabilitation completion percentage |

> Move a slider and see the current value update below it in real time.

**Step 3 — Click "Run simulation"**  
The system sends the values to the ML model backend and returns the simulated outcome.

**Step 4 — Read the results**

| Result card | What it shows |
|------------|--------------|
| **Baseline** | Current predicted delay and risk category (before intervention) |
| **Simulated** | New predicted delay and risk category (after your interventions) |
| **Days saved** | Difference: baseline − simulated delay |
| **Score change** | How much the risk score improved |
| **Priority after change** | The new risk score — lower means the project moves down the priority queue |

#### Interpreting results

- If **Days saved = 0** → the model says the chosen interventions won't significantly change the delay for this project. Try adjusting the legal cases slider more.
- If **Simulated risk category changes** (e.g. HIGH → MEDIUM) → your intervention plan is substantial enough to drop the project's risk tier.
- Use the score change to **prioritise which intervention to action first**.

---

### 4.6 Analytics

**Navigation:** Click **Analytics** in the top nav bar.

Gives a comparative view of risk and delay across **states** and **districts**.

#### Left panel — State summary

Shows the **top 6 states** ranked by risk concentration.

| Column | Meaning |
|--------|---------|
| State name | Name of the Indian state |
| Total projects | Number of projects in that state |
| Average progress % | Mean land acquisition progress across state projects |
| Critical count | Number of CRITICAL-rated projects in that state |
| Average delay | Mean predicted delay (days) across state projects |

**How to use:** If a state has high critical count + high average delay, escalate review to that state's field officers.

#### Right panel — District watchlist

Shows the **top 6 districts** ranked by average risk score.

| Column | Meaning |
|--------|---------|
| District | District name |
| State | Parent state |
| Projects count | Number of projects in this district |
| Risk score | Average ML risk score (0–100) |
| Top bottleneck | Most common administrative delay cause in that district |

**How to use:** High-risk districts with many projects and a common bottleneck type suggest a **systemic issue** — flag for district-level intervention rather than project-by-project action.

---

### 4.7 Reports

**Navigation:** Click **Reports** in the top nav bar.

The Reports page has three purposes: **data export**, **data quality review**, and **model transparency**.

#### Export buttons (top row)

| Button | What it downloads |
|--------|------------------|
| **Download project register** | `bhoomiraksha_projects.csv` — all 2,540 projects with all fields including coordinates, risk scores, delay predictions, statutory dates |
| **Download audit log** | `bhoomiraksha_audit.csv` — full action history (last 500 entries) including who did what and when |

> Both downloads are recorded in the audit trail automatically.

#### Data quality panel

| Metric | What it means |
|--------|--------------|
| Overall completeness | % of fields filled across all records (target: > 95%) |
| Total records checked | How many project rows were validated |
| Validated records | Records that passed all data checks |
| Anomalies detected | Records with suspicious or inconsistent values |

Use this before presenting data to a review committee — confirm completeness is ≥ 96% before acting on aggregate figures.

#### Model metrics panel

The ML model is a **Random Forest Regressor** trained on historical BhoomiRashi data.

| Metric | What it measures |
|--------|-----------------|
| **MAE** (Mean Absolute Error) | Average prediction error in days — lower is better |
| **RMSE** (Root Mean Squared Error) | Penalises large errors more — lower is better |
| **R² score** | Variance explained by the model (0–1, higher is better) |
| **ROC-AUC** | Classification quality for risk category (0–1, > 0.8 is good) |

#### Data provenance panel

Shows where the data comes from and how the model was validated:

- **Operational source** — the BhoomiRashi government portal (live gazette data)
- **Model source** — the training dataset and algorithm
- **Circular validation control** — confirms the model was not trained and tested on the same records
- **Algorithm** — Random Forest Regressor
- **Evaluation split** — how training/test data was divided
- **Last reviewed** — date of last model audit

---

### 4.8 Audit Logs (Admin only)

**Navigation:** Click **Audit** — visible only when logged in as **ADMIN** role.

Every significant action taken in the system is recorded here for traceability and accountability.

#### Columns in the audit table

| Column | What it records |
|--------|----------------|
| **Time** | ISO timestamp of the event |
| **Actor** | Name and role of the user who performed the action |
| **Action** | The event type (see table below) |
| **Entity** | The type and ID of the object the action was performed on |
| **Details** | Free-text description of what happened |

#### Recorded action types

| Action | When it is logged |
|--------|------------------|
| `SIMULATE_WHAT_IF` | When a simulation is run on any project |
| `EXPORT_PROJECTS` | When the project register CSV is downloaded |
| `EXPORT_AUDIT_LOG` | When the audit log CSV is downloaded |
| `LOGIN` | When a user logs in (if recorded by the frontend) |
| `VIEW_PROJECT` | When a project detail page is opened |

#### How to use

- **Accountability review** — check who ran simulations and when
- **Export audit** — click "Download audit log" on the Reports page to get a full CSV
- The table shows the last 200 entries; use the CSV for a full historical view

---

## 5. User Roles

| Role | Dashboard | Projects | Map | Simulation | Analytics | Reports | Audit Logs |
|------|-----------|----------|-----|-----------|-----------|---------|------------|
| **Field Officer** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Viewer** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 6. Understanding Risk Categories

The ML model assigns a **risk category** to every project based on the total statutory processing time (Section 3a to 3D):

| Category | Delay threshold | Colour | Recommended action |
|----------|----------------|--------|--------------------|
| **CRITICAL** | ≥ 365 days (1 year+) | 🔴 Red | Immediate escalation, direct officer review |
| **HIGH** | 180 – 364 days | 🟠 Orange | Schedule follow-up within 2 weeks |
| **MEDIUM** | 90 – 179 days | 🟡 Yellow | Monitor monthly, run simulation |
| **LOW** | < 90 days | 🟢 Green | Routine check |

The **risk score** (0–100) is a continuous version of the same metric:
- `score = min(98, days_3a_to_3D / 5)`
- Score > 70 = CRITICAL territory

---

## 7. Glossary

| Term | Definition |
|------|-----------|
| **Section 3a** | Preliminary notification under RFCTLARR Act — marks start of land acquisition |
| **Section 3A** | Statutory gazette notification — formal public declaration of acquisition |
| **Section 3D** | Final declaration and award — compensation is disbursed |
| **3a → 3D days** | Total statutory cycle time; the primary delay metric used by the ML model |
| **BhoomiRashi** | Government portal for land acquisition records (bhoomirashi.gov.in) |
| **MoRTH** | Ministry of Road Transport & Highways |
| **NHAI** | National Highways Authority of India |
| **RR progress** | Resettlement & Rehabilitation completion — % of affected families resettled |
| **What-if simulation** | Running the ML model with hypothetical intervention values to estimate delay reduction |
| **MAE** | Mean Absolute Error — average number of days the model's prediction is off by |
| **R² score** | How much of the variation in delay the model can explain (1.0 = perfect) |
| **Risk score** | 0–100 index derived from days_3a_to_3D; drives the risk category |
| **Audit trail** | Immutable log of all significant user actions for accountability |

---

*BhoomiRaksha AI — Smart India Hackathon 2026 Prototype*  
*Backend: FastAPI + Scikit-Learn | Frontend: React + Vite + Leaflet*  
*Data: Real MoRTH BhoomiRashi gazette records*
