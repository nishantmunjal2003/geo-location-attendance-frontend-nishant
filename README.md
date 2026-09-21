# Geo-Location Attendance System - Frontend

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?logo=react)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/MUI-v5-007FFF.svg?logo=mui)](https://mui.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)](https://www.docker.com/)
[![GHCR](https://img.shields.io/badge/GHCR-Automated_Build-2088FF.svg?logo=github)](https://github.com/nishantmunjal2003/geo-location-attendance-frontend-nishant/pkgs/container/geo-location-attendance-frontend-nishant)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A modern, responsive web application for automated classroom attendance tracking using verified geographical coordinates (geo-fencing). Built with **React 18**, **Material UI (MUI v5)**, and containerized with **Docker** and **Nginx**.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture & Structure](#-project-architecture--structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Docker & Container Deployment](#-docker--container-deployment)
  - [Using Docker Compose](#using-docker-compose)
  - [Pulling from GitHub Container Registry (GHCR)](#pulling-from-github-container-registry-ghcr)
  - [Building Locally](#building-locally)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Available Scripts](#-available-scripts)
- [License](#-license)

---

## 🌟 Overview

The **Geo-Location Attendance System** eliminates manual roll calls and buddy punching by validating student presence via real-time browser geolocation within the instructor's designated geofence radius.

Initial development supervised under **Gurukula Kangri (Deemed to be University) - GKDU**.

---

## ✨ Features

- 📍 **Geo-fenced Attendance Verification:** Real-time browser coordinate checks against active lecture geofences.
- 👥 **Multi-Role Access Control:**
  - **Admin Dashboard:** Manage users, assign courses, view real-time institute-wide stats, and control access permissions.
  - **Faculty Portal:** Schedule classes, initiate attendance windows, set coordinates & radius, and inspect attendance submissions.
  - **Student Portal:** View enrolled subjects, verify physical classroom proximity, check in with one tap, and view attendance history.
- 📊 **Attendance Reports & Analytics:** Detailed course attendance breakdown, date filtering, percentage metrics, and report export.
- 🔐 **Authentication & Security:** JWT-based token management paired with optional Google OAuth Single Sign-On (SSO).
- 🎨 **Modern Glassmorphic UI:** Built with Material UI (MUI v5), responsive across mobile, tablet, and desktop viewports.
- 🐳 **Production-Ready Dockerization:** Multi-stage Docker image served via Nginx with automated SPA routing, Gzip compression, and asset caching.

---

## 🛠 Tech Stack

| Category | Technologies |
|---|---|
| **Core Framework** | React 18.2.0 |
| **Routing** | React Router DOM v6 |
| **UI Components & Styling** | Material UI (MUI) v5, Emotion React & Styled |
| **Icons** | MUI Icons Material |
| **HTTP Client** | Axios |
| **State Management** | React Context API (`auth-context`) |
| **Containerization** | Docker, Nginx Alpine |
| **CI/CD & Registry** | GitHub Actions, GitHub Container Registry (GHCR) |

---

## 📂 Project Architecture & Structure

```text
geo-location-frontend/
├── .github/
│   └── workflows/
│       └── docker-publish.yml    # Automated CI/CD to GHCR
├── public/                       # Static public assets
├── src/
│   ├── api/                      # Axios API client & backend endpoints
│   ├── components/               # Modular UI components
│   │   ├── Auth/                 # Login, Registration & OAuth
│   │   ├── Class/                # Class creation, details & geofence setup
│   │   ├── Course/               # Course catalog & active courses
│   │   ├── Home/                 # Role-based dashboard widgets
│   │   ├── Modal/                # Modal dialogs (Edit User, Add Course, etc.)
│   │   ├── Navbar/               # Navigation headers (Admin / Student)
│   │   └── UI/                   # Glassmorphic cards & theme components
│   ├── pages/                    # Route pages
│   │   ├── AdminHome.js          # Admin management suite
│   │   ├── CourseAttendanceReport.js # Attendance reporting & analytics
│   │   ├── ProfilePage.js        # User profile & credentials
│   │   ├── StudentHome.js        # Student attendance check-in
│   │   └── UserCourses.js        # Enrolled subjects view
│   ├── store/                    # Context providers (Auth Context)
│   ├── App.js                    # Core route definitions
│   └── index.js                  # React DOM root entrypoint
├── .dockerignore
├── .env                          # Local environment configuration
├── docker-compose.yml            # Local Docker composition
├── Dockerfile                    # Multi-stage production Dockerfile
├── nginx.conf                    # Nginx reverse-proxy & SPA config
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (version `18.x` or `20.x` recommended)
- [npm](https://www.npmjs.com/) (version `9.x` or later)
- [Git](https://git-scm.com/)
- *(Optional)* [Docker Desktop](https://www.docker.com/products/docker-desktop) for containerized runs

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nishantmunjal2003/geo-location-attendance-frontend-nishant.git
   cd geo-location-attendance-frontend-nishant
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

---

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API Base URL
REACT_APP_URL=https://gkv.rajeevsahu.me/api

# Google OAuth Client ID (Optional SSO)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# Notification / Mail Info
REACT_APP_MAIL_FROM_ADDRESS=noreply@gkv.ac.in
REACT_APP_MAIL_FROM_NAME="GKV Attendance App"
```

---

### Running Locally

To start the development server:

```bash
npm start
```

The application will launch at **`http://localhost:3000`**.

---

## 🐳 Docker & Container Deployment

### Using Docker Compose

Run the pre-configured production container with a single command:

```bash
docker compose up -d
```

Access the application in your browser at `http://localhost:3000`.

To stop the container:
```bash
docker compose down
```

---

### Pulling from GitHub Container Registry (GHCR)

The latest build is automatically published to GHCR. You can pull and run it directly:

```bash
# Pull the latest image
docker pull ghcr.io/nishantmunjal2003/geo-location-attendance-frontend-nishant:latest

# Run the container mapping port 3000
docker run -d -p 3000:80 --name geo-attendance-app \
  ghcr.io/nishantmunjal2003/geo-location-attendance-frontend-nishant:latest
```

---

### Building Locally

To manually build the Docker container with custom environment arguments:

```bash
docker build \
  --build-arg REACT_APP_URL=https://your-api-domain.com/api \
  -t geo-location-frontend:latest .

docker run -d -p 3000:80 geo-location-frontend:latest
```

---

## 🔄 CI/CD Pipeline

This repository uses **GitHub Actions** (`.github/workflows/docker-publish.yml`) to automatically build and release Docker images to **GitHub Container Registry (GHCR)**:

1. Triggers automatically on any push to the `main` branch or semantic version tags (`v*.*.*`).
2. Configures Docker Buildx with layer caching for rapid builds.
3. Builds multi-stage production images and publishes them to `ghcr.io/nishantmunjal2003/geo-location-attendance-frontend-nishant`.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
|---|---|
| `npm start` | Runs the app in development mode at `http://localhost:3000`. |
| `npm run build` | Bundles the production assets into the `build` directory. |
| `npm test` | Launches the test runner in interactive watch mode. |
| `npm run eject` | Ejects Create React App configuration (irreversible). |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
