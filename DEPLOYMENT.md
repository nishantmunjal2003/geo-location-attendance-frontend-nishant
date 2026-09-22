# GKVFlow Attendance — Production Deployment Guide

## Root Cause of "405 Not Allowed" Email Error

`setupProxy.js` is a **Create React App dev-only** file — it only runs during `npm start`.
In production, nginx serves static files directly with no Node.js process, so
`POST /api/send-email` has no handler → nginx returns **405 Not Allowed**.

---

## What Was Fixed

| File | Change |
|---|---|
| `server.js` | NEW — Production Express server |
| `package.json` | Added `"serve": "node server.js"` script |

`server.js` handles everything in production:
- `POST /api/send-email` → proxies to ZeptoMail
- `GET /api/test-email-config` → returns config status
- All other routes → serves `build/index.html` (React Router SPA fallback)

---

---

## Deploying with Easypanel (Step-by-Step)

Because Easypanel uses Docker containers with Traefik reverse-proxy and automatic Let's Encrypt SSL, **you do NOT need to configure Nginx, SSL certificates, or PM2 manually**.

### Step 1: Push your latest changes to GitHub
Ensure `server.js`, `Dockerfile`, and `package.json` are committed and pushed:
```bash
git add .
git commit -m "Add production server.js and update Dockerfile for Easypanel"
git push origin main
```

---

### Step 2: Create the App in Easypanel
1. Open your **Easypanel Dashboard**.
2. Select or create your **Project** (e.g. `gkv-attendance`).
3. Click **+ Service** and select **App**.
4. Give it a name (e.g., `frontend`).

---

### Step 3: Configure Source & Build
1. Go to the **Source** tab:
   - Select **GitHub** (or **Git**).
   - Enter your repository URL and select branch **`main`**.
2. Go to the **Build** tab:
   - **Build Type**: `Dockerfile` *(recommended — the updated `Dockerfile` builds React and starts `server.js`)*.
   - **Dockerfile Path**: `Dockerfile`

---

### Step 4: Add Environment Variables
Go to the **Environment** tab in Easypanel and paste:

```env
PORT=3000
ZEPTOMAIL_API_KEY=your_actual_zeptomail_api_key
ZEPTOMAIL_API_URL=https://api.zeptomail.com/v1.1/email
MAIL_FROM_ADDRESS=noreply@gkv.ac.in
MAIL_FROM_NAME=GKVFlow-PMS
REACT_APP_URL=https://gkv.rajeevsahu.me/api
REACT_APP_GOOGLE_CLIENT_ID=761450022754-jblgjbq21hhjdc6rnusd2e8c7807e9b4.apps.googleusercontent.com
```

---

### Step 5: Configure Domain & Port
Go to the **Domains** tab:
1. Click **Add Domain**.
2. **Host**: Enter your domain (e.g., `att.gkv.ac.in` or your test domain).
3. **Port**: Set to `3000` *(this routes traffic to `server.js`)*.
4. **HTTPS / SSL**: Enable it (Easypanel will automatically provision a free Let's Encrypt SSL certificate).

---

### Step 6: Deploy & Verify
1. Click the **Deploy** button at the top right.
2. Watch the deployment log until it shows `GKVFlow production server running on port 3000`.
3. Open `https://<your-domain>/api/test-email-config` in your browser:
   - Expected response: `{"configured":true,"fromAddress":"noreply@gkv.ac.in","fromName":"GKVFlow-PMS"}`.
4. Done! Both your React Single Page App and email endpoints (`/api/send-email`) are now working with SSL.

---

## Alternative: Traditional VPS / Bare Metal Deployment

```bash
# 1. Pull the new code
git pull

# 2. Install dependencies (express is already included)
npm install

# 3. Build the React app
npm run build

# 4. Start the production server
npm run serve

# --- OR use PM2 for persistent/background hosting ---
pm2 start server.js --name gkv-attendance
pm2 save          # persist across reboots
pm2 startup       # configure autostart
```

---

## nginx Configuration Change Required

Update your nginx site config to **reverse-proxy to Node.js**
instead of serving static files directly:

```nginx
server {
    listen 80;
    server_name att.gkv.ac.in;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

> After editing, reload nginx:
> ```bash
> sudo nginx -t && sudo systemctl reload nginx
> ```

---

## Environment Variables (`.env`)

Make sure your `.env` file (in the project root) contains:

```env
ZEPTOMAIL_API_KEY=your_actual_zeptomail_api_key
ZEPTOMAIL_API_URL=https://api.zeptomail.com/v1.1/email
MAIL_FROM_ADDRESS=noreply@gkv.ac.in
MAIL_FROM_NAME=GKVFlow-PMS
PORT=3000
```

---

## Quick Smoke Test

Once the server is running, test the email config endpoint:

```bash
curl http://localhost:3000/api/test-email-config
# Expected: { "configured": true, "fromAddress": "noreply@gkv.ac.in", ... }
```

---

## Summary of Files Changed

| File | Purpose |
|---|---|
| `server.js` | Production Express server (new file) |
| `package.json` | Added `express` dependency + `serve` script |
| `src/setupProxy.js` | Unchanged — still used for local `npm start` dev |
