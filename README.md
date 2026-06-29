# SmartDent AI: Advanced Dental Diagnostics & Clinical Longitudinal Tracking Platform

SmartDent AI is a comprehensive, production-ready healthcare platform engineered to enhance dental diagnostics and optimize patient recovery pathways. By integrating advanced computer vision models with robust full-stack software architecture, the platform automates individual dental pathology detection and provides long-term longitudinal tracking for clinical decision support.

---

## 🚀 Key Architectural Features

### 1. High-Precision Pathology Detection (AI Engine)
To ensure maximum clinical reliability and accuracy, the core AI system operates on high-level engineering logic that prioritizes multi-class diagnostic precision. The engine dynamically evaluates dental radiographs to detect **7 specific dental pathologies**. This was achieved by systematically merging and optimizing distinct deep learning models to achieve exceptional classification scores while minimizing diagnostic false negatives.
* **Core Models Built-in:** Custom-trained neural networks (`best.pt`, `illnessesTeeth.pt`).
* **Pathology Focus:** High-accuracy automated multi-label classification for seven critical dental diseases.

### 2. Longitudinal Patient Tracking Algorithm
Beyond instantaneous single-frame classification, SmartDent AI features a proprietary **Longitudinal Tracking Algorithm**. This clinical subsystem maps patient records across sequential visits, performing spatial and statistical analysis on dental pathology data to monitor recovery paths, disease progression, or treatment stability over extended periods.

### 3. Clinic Management & Biometric Authentication
Designed for multi-role dental clinics, the platform features:
* **Interactive Tooth Mapping:** Visual interface for dental practitioners to view historical anomalies per tooth.
* **Biometric Authentication:** Real-time face recognition and authentication for secure clinician login and streamlined patient intake.
* **Granular Role-Based Access Control (RBAC):** Secured routes isolating administrative actions, patient records, and diagnostics.

---

## 🛠️ Tech Stack & System Architecture

The project is structured into two completely decoupled service layers to ensure independent scaling, modular maintenance, and clean logical separation:

* **Backend API Layer (`ProjectEPUbackend`):** High-performance, asynchronous REST API driving the AI prediction engine, processing multi-tenant authentication, and orchestrating database transactions with strict security standards.
* **Frontend Web Application (`عيادة`):** A modern SPA dashboard built with React and TypeScript, leveraging a modern frontend build tool (Vite) for optimized asset bundling, real-time reactive scheduling, and interactive data visualizations.

---

## 📁 Repository Structure

```text
SmartDent-AI/
│
├── ProjectEPUbackend/          # Asynchronous AI Engine & Backend Core
│   ├── static/temp/            # Temporary directory for analyzed X-ray outputs
│   ├── *.py                    # Modular routers, authentication utils, and DB controllers
│   ├── best.pt                 # Optimized weights for dental pathology detection (Git LFS)
│   └── illnessesTeeth.pt       # Specialized deep learning model weights (Git LFS)
│
├── عيادة/                      # React / TypeScript Web Dashboard (Frontend)
│   ├── components/             # Reusable UI elements (ToothMap, XRayAnalysis, Sidebar)
│   ├── pages/                  # Views (Dashboard, PatientsList, PatientProgress)
│   ├── App.tsx                 # Core client routing and layout architecture
│   └── package.json            # Frontend dependency configuration
│
└── .gitignore                  # Environment and cache exclusion configurations
