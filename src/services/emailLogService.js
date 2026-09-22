/**
 * emailLogService.js
 * Manages per-user email dispatch logs stored in localStorage.
 * Key format: `email_logs_<userId>`
 * Admin key (merged view): `email_logs_all`
 */

const LOG_PREFIX = "email_logs_";
const ALL_USERS_INDEX_KEY = "email_logs_user_index";

/**
 * Generates a unique log ID
 */
const genId = () =>
  `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

/**
 * Returns the localStorage key for a given user
 */
const keyFor = (userId) => `${LOG_PREFIX}${userId}`;

/**
 * Reads and parses logs for a specific user from localStorage.
 * Returns [] on error or if empty.
 */
export const getEmailLogs = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(keyFor(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Merges and returns logs from all users (for admin view).
 * Each log entry includes senderName / senderEmail for attribution.
 */
export const getAllEmailLogs = () => {
  try {
    const indexRaw = localStorage.getItem(ALL_USERS_INDEX_KEY);
    const userIds = indexRaw ? JSON.parse(indexRaw) : [];
    const merged = [];
    userIds.forEach((uid) => {
      const userLogs = getEmailLogs(uid);
      merged.push(...userLogs);
    });
    // Sort by timestamp descending (newest first)
    merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return merged;
  } catch {
    return [];
  }
};

/**
 * Adds a new email log entry for a user.
 * @param {string} userId  - The logged-in user's unique ID (_id from auth context)
 * @param {object} entry   - Log entry data
 *   entry.senderName      - Display name of instructor
 *   entry.senderEmail     - Email of instructor
 *   entry.courseId        - Course ID
 *   entry.courseName      - Course display name
 *   entry.subject         - Email subject line
 *   entry.recipientEmails - Array of email strings (student BCC list)
 *   entry.recipientCount  - Total count (students + instructor copy)
 *   entry.status          - "success" | "error"
 *   entry.errorMessage    - (optional) error detail if status === "error"
 */
export const addEmailLog = (userId, entry) => {
  if (!userId) return;

  const existing = getEmailLogs(userId);
  const newEntry = {
    id: genId(),
    timestamp: new Date().toISOString(),
    status: "success",
    ...entry,
    userId,
  };

  const updated = [newEntry, ...existing];
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(updated));

    // Maintain global user index for admin merged view
    const indexRaw = localStorage.getItem(ALL_USERS_INDEX_KEY);
    const userIds = indexRaw ? JSON.parse(indexRaw) : [];
    if (!userIds.includes(userId)) {
      userIds.push(userId);
      localStorage.setItem(ALL_USERS_INDEX_KEY, JSON.stringify(userIds));
    }
  } catch (e) {
    console.error("emailLogService: Failed to write log to localStorage", e);
  }

  return newEntry;
};

/**
 * Clears all logs for a specific user.
 */
export const clearEmailLogs = (userId) => {
  if (!userId) return;
  try {
    localStorage.removeItem(keyFor(userId));
  } catch {}
};

/**
 * Returns total email stats summary for a user (or all users).
 */
export const getEmailStats = (logs) => {
  if (!logs || logs.length === 0)
    return { totalSent: 0, totalRecipients: 0, lastSent: null };

  const successLogs = logs.filter((l) => l.status === "success");
  const totalRecipients = successLogs.reduce(
    (sum, l) => sum + (l.recipientCount || 0),
    0
  );
  const sorted = [...logs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return {
    totalSent: successLogs.length,
    totalRecipients,
    lastSent: sorted[0]?.timestamp || null,
  };
};

/**
 * Exports an array of log entries as a downloadable CSV file.
 */
export const exportLogsAsCSV = (logs, filename = "email_logs.csv") => {
  if (!logs || logs.length === 0) return;

  const headers = [
    "Date & Time",
    "Course",
    "Subject",
    "Recipients (#)",
    "Recipient Emails",
    "Sent By",
    "Sender Email",
    "Status",
  ];

  const escape = (val) => {
    if (val === undefined || val === null) return "";
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = logs.map((log) => [
    escape(log.timestamp ? new Date(log.timestamp).toLocaleString() : ""),
    escape(log.courseName || ""),
    escape(log.subject || ""),
    escape(log.recipientCount || 0),
    escape(
      Array.isArray(log.recipientEmails)
        ? log.recipientEmails.join("; ")
        : log.recipientEmails || ""
    ),
    escape(log.senderName || ""),
    escape(log.senderEmail || ""),
    escape(log.status || "success"),
  ]);

  const csvContent = [
    headers.map((h) => escape(h)).join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
