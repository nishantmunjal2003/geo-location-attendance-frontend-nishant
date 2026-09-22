/**
 * server.js — Production server for GKVFlow Attendance Frontend
 *
 * Replaces the CRA setupProxy.js (dev-only) for production deployments.
 * - Serves the React build/ folder as static files
 * - Handles POST /api/send-email  → proxies to ZeptoMail
 * - Handles GET  /api/test-email-config → returns config status
 * - All other routes → serves index.html (React Router SPA fallback)
 *
 * Usage:
 *   node server.js
 *   PORT=3000 node server.js
 */

"use strict";

const https = require("https");
const http = require("http");
const express = require("express");
const path = require("path");
const fs = require("fs");

// ---------------------------------------------------------------------------
// Load .env if present
// ---------------------------------------------------------------------------
try {
  const envPath = path.resolve(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && !process.env[key]) process.env[key] = val;
    }
  }
} catch (e) {
  console.warn("Warning: could not parse .env file:", e.message);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getLiveApiKey() {
  const key = process.env.ZEPTOMAIL_API_KEY || process.env.REACT_APP_ZEPTOMAIL_API_KEY;
  if (key && !key.includes("your_new_zeptomail")) return key;
  return null;
}

function getConfig() {
  return {
    apiUrl: process.env.ZEPTOMAIL_API_URL || process.env.REACT_APP_ZEPTOMAIL_API_URL || "https://api.zeptomail.com/v1.1/email",
    fromAddress: process.env.MAIL_FROM_ADDRESS || process.env.REACT_APP_MAIL_FROM_ADDRESS || "noreply@gkv.ac.in",
    fromName: process.env.MAIL_FROM_NAME || process.env.REACT_APP_MAIL_FROM_NAME || "GKVFlow-PMS",
  };
}

function normaliseRecipients(input, fallbackAddress) {
  if (Array.isArray(input) && input.length > 0) {
    return input.map((item) => {
      if (typeof item === "string") return { email_address: { address: item } };
      if (item.email_address) return item;
      return { email_address: { address: item.address || item.email || "", name: item.name } };
    });
  }
  if (typeof input === "string" && input.trim()) return [{ email_address: { address: input.trim() } }];
  if (fallbackAddress) return [{ email_address: { address: fallbackAddress } }];
  return [];
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();
app.use(express.json({ limit: "5mb" }));

// POST /api/send-email
app.post("/api/send-email", (req, res) => {
  try {
    const { to, bcc, subject, htmlbody } = req.body;
    const apiKey = getLiveApiKey();
    if (!apiKey) {
      console.error("[send-email] ZEPTOMAIL_API_KEY is not configured.");
      return res.status(500).json({ error: "ZeptoMail API key is not configured in environment variables." });
    }

    const { apiUrl, fromAddress, fromName } = getConfig();
    const toList = normaliseRecipients(to, fromAddress);
    const bccList = normaliseRecipients(bcc, null);

    const payload = {
      from: { address: fromAddress, name: fromName },
      to: toList,
      subject: subject || "Notification from GKVFlow-PMS",
      htmlbody: htmlbody || "<p>Notification from GKVFlow-PMS</p>",
    };

    if (bccList.length > 0) payload.bcc = bccList;
    if (req.body.reply_to) {
      payload.reply_to = Array.isArray(req.body.reply_to) ? req.body.reply_to : [{ address: req.body.reply_to }];
    }

    const postData = JSON.stringify(payload);
    const parsedUrl = new URL(apiUrl);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + (parsedUrl.search || ""),
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Zoho-enczapikey " + apiKey,
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const request = https.request(options, (response) => {
      let body = "";
      response.on("data", (chunk) => (body += chunk));
      response.on("end", () => {
        console.log(`[send-email] ZeptoMail ${response.statusCode} — to:${toList.length} bcc:${bccList.length}`);
        try { return res.status(response.statusCode).json(JSON.parse(body)); }
        catch { return res.status(response.statusCode).send(body); }
      });
    });

    request.on("error", (err) => {
      console.error("[send-email] HTTPS error:", err.message);
      return res.status(500).json({ error: err.message });
    });

    request.write(postData);
    request.end();
  } catch (err) {
    console.error("[send-email] Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/test-email-config
app.get("/api/test-email-config", (_req, res) => {
  const key = getLiveApiKey();
  const { fromAddress, fromName } = getConfig();
  res.json({ configured: Boolean(key), fromAddress, fromName });
});

// ---------------------------------------------------------------------------
// Serve React build (SPA fallback)
// ---------------------------------------------------------------------------
const buildDir = path.join(__dirname, "build");
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir));
  app.get("*", (_req, res) => res.sendFile(path.join(buildDir, "index.html")));
} else {
  console.warn("[server.js] WARNING: build/ directory not found. Run `npm run build` first.");
  app.get("*", (_req, res) => res.status(503).send("<h1>App not built</h1><p>Run <code>npm run build</code> first.</p>"));
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, () => {
  console.log(`\n  GKVFlow production server running on port ${PORT}`);
  console.log(`   ZeptoMail API key: ${getLiveApiKey() ? "configured" : "MISSING"}`);
  console.log(`   Serving: ${buildDir}\n`);
});
