const https = require("https");
const express = require("express");

module.exports = function (app) {
  // Middleware to parse JSON bodies for email requests
  app.use(express.json());

  // ZeptoMail proxy endpoint to avoid CORS limitations in browser
  app.post("/api/send-email", (req, res) => {
    try {
      const { to, bcc, subject, htmlbody } = req.body;

      const apiKey = process.env.ZEPTOMAIL_API_KEY;

      if (!apiKey) {
        console.error("ZeptoMail Error: ZEPTOMAIL_API_KEY is not configured.");
        return res.status(500).json({
          error: "ZeptoMail API key is not configured in environment variables.",
        });
      }

      const apiUrl =
        process.env.ZEPTOMAIL_API_URL ||
        process.env.REACT_APP_ZEPTOMAIL_API_URL ||
        "https://api.zeptomail.com/v1.1/email";
      const fromAddress =
        process.env.MAIL_FROM_ADDRESS ||
        process.env.REACT_APP_MAIL_FROM_ADDRESS ||
        "noreply@gkv.ac.in";
      const fromName =
        process.env.MAIL_FROM_NAME ||
        process.env.REACT_APP_MAIL_FROM_NAME ||
        "GKVFLow-PMS";

      let toList = [];
      if (Array.isArray(to) && to.length > 0) {
        toList = to.map((item) =>
          typeof item === "string"
            ? { email_address: { address: item } }
            : item.email_address
            ? item
            : { email_address: { address: item.address || item.email, name: item.name } }
        );
      } else if (typeof to === "string" && to.trim()) {
        toList = [{ email_address: { address: to } }];
      } else {
        // If only BCC list is provided, direct 'to' to fromAddress
        toList = [{ email_address: { address: fromAddress, name: fromName } }];
      }

      let bccList = [];
      if (Array.isArray(bcc) && bcc.length > 0) {
        bccList = bcc.map((item) =>
          typeof item === "string"
            ? { email_address: { address: item } }
            : item.email_address
            ? item
            : { email_address: { address: item.address || item.email, name: item.name } }
        );
      }

      const payload = {
        from: { address: fromAddress, name: fromName },
        to: toList,
        subject: subject || "Notification from GKVFlow-PMS",
        htmlbody: htmlbody || "<p>Notification from GKVFlow-PMS</p>",
      };

      if (bccList.length > 0) {
        payload.bcc = bccList;
      }

      if (req.body.reply_to) {
        payload.reply_to = Array.isArray(req.body.reply_to)
          ? req.body.reply_to
          : [{ address: req.body.reply_to }];
      }

      const postData = JSON.stringify(payload);
      const parsedUrl = new URL(apiUrl);

      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname,
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Zoho-enczapikey " + apiKey,
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      const request = https.request(options, (response) => {
        let responseBody = "";
        response.on("data", (chunk) => {
          responseBody += chunk;
        });
        response.on("end", () => {
          try {
            const json = JSON.parse(responseBody);
            return res.status(response.statusCode).json(json);
          } catch (e) {
            return res.status(response.statusCode).send(responseBody);
          }
        });
      });

      request.on("error", (err) => {
        console.error("ZeptoMail Request Error:", err);
        return res.status(500).json({ error: err.message });
      });

      request.write(postData);
      request.end();
    } catch (err) {
      console.error("ZeptoMail Proxy Handler Error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Health check / test config endpoint
  app.get("/api/test-email-config", (req, res) => {
    const hasKey = Boolean(process.env.ZEPTOMAIL_API_KEY);
    res.json({
      configured: hasKey,
      fromAddress:
        process.env.MAIL_FROM_ADDRESS ||
        process.env.REACT_APP_MAIL_FROM_ADDRESS ||
        "noreply@gkv.ac.in",
      fromName:
        process.env.MAIL_FROM_NAME ||
        process.env.REACT_APP_MAIL_FROM_NAME ||
        "GKVFLow-PMS",
    });
  });
};
