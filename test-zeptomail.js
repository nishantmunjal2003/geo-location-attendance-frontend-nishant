const https = require("https");
const fs = require("fs");
const path = require("path");

// Load .env manually if dotenv is not loaded
const envPath = path.join(__dirname, ".env");
const envConfig = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^['"]|['"]$/g, "");
        envConfig[key] = val;
      }
    }
  });
}

const apiKey =
  process.env.ZEPTOMAIL_API_KEY ||
  envConfig.ZEPTOMAIL_API_KEY ||
  envConfig.REACT_APP_ZEPTOMAIL_API_KEY;
const apiUrl =
  process.env.ZEPTOMAIL_API_URL ||
  envConfig.ZEPTOMAIL_API_URL ||
  envConfig.REACT_APP_ZEPTOMAIL_API_URL ||
  "https://api.zeptomail.com/v1.1/email";
const fromAddress =
  process.env.MAIL_FROM_ADDRESS ||
  envConfig.MAIL_FROM_ADDRESS ||
  envConfig.REACT_APP_MAIL_FROM_ADDRESS ||
  "noreply@gkv.ac.in";
const fromName =
  process.env.MAIL_FROM_NAME ||
  envConfig.MAIL_FROM_NAME ||
  envConfig.REACT_APP_MAIL_FROM_NAME ||
  "GKVFLow-PMS";

const recipient = process.argv[2] || "noreply@gkv.ac.in";

console.log("=========================================");
console.log("  GKVFlow-PMS ZeptoMail Diagnostic Test  ");
console.log("=========================================");
console.log("From Address :", fromAddress);
console.log("From Name    :", fromName);
console.log("API URL      :", apiUrl);
console.log("Recipient    :", recipient);
console.log("API Key      :", apiKey ? apiKey.substring(0, 16) + "..." : "MISSING!");

if (!apiKey) {
  console.error("ERROR: No ZeptoMail API Key found in .env or environment!");
  process.exit(1);
}

const payload = {
  from: { address: fromAddress, name: fromName },
  to: [{ email_address: { address: recipient, name: "GKVFlow Test Recipient" } }],
  subject: "ZeptoMail Configuration Test - GKVFlow-PMS",
  htmlbody: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f8;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; border-top: 4px solid #0D7D70;">
        <h2 style="color: #0D7D70;">ZeptoMail Integration Successful!</h2>
        <p>This email confirms that your ZeptoMail configuration for <strong>GKVFlow-PMS</strong> is active and functional.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr><td style="padding: 6px; color: #64748b;">Sender:</td><td style="padding: 6px; font-weight: bold;">${fromAddress}</td></tr>
          <tr><td style="padding: 6px; color: #64748b;">Timestamp:</td><td style="padding: 6px; font-weight: bold;">${new Date().toISOString()}</td></tr>
        </table>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">Project Co-Ordinator: Dr. Nishant Kumar | Developer: Rajeev Sahu<br/>NMRIL Labs</p>
      </div>
    </div>
  `,
};

const postData = JSON.stringify(payload);
const parsed = new URL(apiUrl);

const options = {
  hostname: parsed.hostname,
  port: 443,
  path: parsed.pathname,
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Zoho-enczapikey " + apiKey,
    "Content-Length": Buffer.byteLength(postData),
  },
};

console.log("\nSending test email via ZeptoMail...");

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("\nResponse HTTP Status:", res.statusCode);
    try {
      const parsedData = JSON.parse(data);
      console.log("Response JSON:", JSON.stringify(parsedData, null, 2));
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log("\nSUCCESS! Email request accepted by ZeptoMail!");
      } else {
        console.error("\nFAILED! ZeptoMail returned an error.");
      }
    } catch (e) {
      console.log("Raw Response:", data);
    }
  });
});

req.on("error", (err) => {
  console.error("Network Error:", err.message);
});

req.write(postData);
req.end();
