import React, { useContext, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HistoryIcon from "@mui/icons-material/History";
import AuthContext from "../store/auth-context";
import {
  getAllEmailLogs,
  getEmailLogs,
  getEmailStats,
  clearEmailLogs,
  exportLogsAsCSV,
} from "../services/emailLogService";

// ─────────────────────────────────────────────────────────────────────────────
// Styled components
// ─────────────────────────────────────────────────────────────────────────────
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: "#EDF5F3",
    color: "#0F172A",
    fontWeight: 700,
    borderBottom: "2px solid rgba(13, 125, 112, 0.2)",
    fontSize: "0.82rem",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    whiteSpace: "nowrap",
  },
  "&.MuiTableCell-body": {
    fontSize: "0.88rem",
    color: "#0F172A",
    borderBottom: "1px solid rgba(13, 125, 112, 0.08)",
    verticalAlign: "top",
    py: 1.5,
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  transition: "background-color 0.15s ease",
  "&:hover": { backgroundColor: "rgba(13, 125, 112, 0.03)" },
  "&:last-child td, &:last-child th": { border: 0 },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <Paper
    elevation={0}
    sx={{
      flex: "1 1 180px",
      p: { xs: 2, sm: 2.5 },
      borderRadius: "18px",
      border: "1px solid rgba(13, 125, 112, 0.12)",
      background: "linear-gradient(145deg, #F8FFFE 0%, #FFFFFF 100%)",
      boxShadow: "0 4px 20px rgba(13, 125, 112, 0.06)",
      display: "flex",
      gap: 2,
      alignItems: "center",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 28px rgba(13, 125, 112, 0.12)",
      },
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "14px",
        background: `linear-gradient(135deg, ${color || "#0D7D70"} 0%, ${color || "#0D7D70"}CC 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 4px 14px ${color || "#0D7D70"}44`,
      }}
    >
      <Icon sx={{ color: "#FFF", fontSize: "1.4rem" }} />
    </Box>
    <Box>
      <Typography
        variant="h5"
        sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1, fontSize: { xs: "1.4rem", sm: "1.7rem" } }}
      >
        {value}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", mt: 0.2 }}>
        {label}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: "#94A3B8" }}>
          {sub}
        </Typography>
      )}
    </Box>
  </Paper>
);

// ─────────────────────────────────────────────────────────────────────────────
// Expandable recipients cell
// ─────────────────────────────────────────────────────────────────────────────
const RecipientsCell = ({ emails = [], count }) => {
  const [open, setOpen] = useState(false);
  const list = Array.isArray(emails) ? emails : [];
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Chip
          size="small"
          label={`${count || list.length} recipients`}
          sx={{
            fontSize: "0.72rem",
            fontWeight: 700,
            backgroundColor: "rgba(13, 125, 112, 0.08)",
            color: "#0D7D70",
            height: 22,
          }}
        />
        {list.length > 0 && (
          <IconButton
            size="small"
            onClick={() => setOpen((v) => !v)}
            sx={{ p: 0.2, color: "#0D7D70" }}
          >
            {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>
      <Collapse in={open}>
        <Box
          sx={{
            mt: 0.75,
            p: 1,
            bgcolor: "rgba(13, 125, 112, 0.03)",
            borderRadius: "8px",
            border: "1px solid rgba(13, 125, 112, 0.1)",
            maxHeight: 140,
            overflowY: "auto",
          }}
        >
          {list.map((email, i) => (
            <Typography
              key={i}
              variant="caption"
              sx={{ display: "block", color: "#334155", lineHeight: 1.7, fontFamily: "monospace" }}
            >
              {email}
            </Typography>
          ))}
          {list.length === 0 && (
            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
              No email details stored
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────
const EmptyState = () => (
  <Box
    sx={{
      textAlign: "center",
      py: { xs: 6, sm: 10 },
      px: 2,
    }}
  >
    <Box
      sx={{
        width: 90,
        height: 90,
        borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(13, 125, 112, 0.1) 0%, rgba(13, 125, 112, 0.05) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2.5,
      }}
    >
      <HistoryIcon sx={{ fontSize: "2.5rem", color: "#0D7D70", opacity: 0.6 }} />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 0.75 }}>
      No email logs yet
    </Typography>
    <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 340, mx: "auto" }}>
      Email logs will appear here once you send low-attendance notices from the Course
      Attendance Report page.
    </Typography>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main EmailLogsPage
// ─────────────────────────────────────────────────────────────────────────────
export default function EmailLogsPage() {
  const authCtx = useContext(AuthContext);
  const isAdmin = authCtx.user?.role === "admin";
  const userId = authCtx.user?._id;

  // Load logs
  const [refresh, setRefresh] = useState(0);
  const rawLogs = useMemo(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (isAdmin) return getAllEmailLogs();
    return getEmailLogs(userId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, userId, refresh]);

  // Stats
  const stats = useMemo(() => getEmailStats(rawLogs), [rawLogs]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all | today | week | month

  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Confirm clear dialog
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  // ── Filtering ────────────────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    let logs = [...rawLogs];

    // Date filter
    const now = new Date();
    if (dateFilter === "today") {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      logs = logs.filter((l) => new Date(l.timestamp) >= dayStart);
    } else if (dateFilter === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);
      logs = logs.filter((l) => new Date(l.timestamp) >= weekStart);
    } else if (dateFilter === "month") {
      const monthStart = new Date(now);
      monthStart.setMonth(monthStart.getMonth() - 1);
      logs = logs.filter((l) => new Date(l.timestamp) >= monthStart);
    }

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.subject?.toLowerCase().includes(term) ||
          l.courseName?.toLowerCase().includes(term) ||
          l.senderName?.toLowerCase().includes(term) ||
          l.senderEmail?.toLowerCase().includes(term)
      );
    }

    return logs;
  }, [rawLogs, dateFilter, searchTerm]);

  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!filteredLogs.length) return;
    exportLogsAsCSV(
      filteredLogs,
      `email_logs_${isAdmin ? "all" : authCtx.user?.name || "user"}_${new Date()
        .toISOString()
        .substring(0, 10)}.csv`
    );
    setSnack({ open: true, msg: "CSV exported successfully!", severity: "success" });
  };

  const handleClear = () => {
    if (isAdmin) {
      // Clear all users' logs stored in localStorage keys we know
      try {
        const indexRaw = localStorage.getItem("email_logs_user_index");
        const userIds = indexRaw ? JSON.parse(indexRaw) : [];
        userIds.forEach((uid) => clearEmailLogs(uid));
        localStorage.removeItem("email_logs_user_index");
      } catch {}
    } else {
      clearEmailLogs(userId);
    }
    setClearDialogOpen(false);
    setRefresh((r) => r + 1);
    setSnack({ open: true, msg: "Email logs cleared.", severity: "info" });
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelative = (ts) => {
    if (!ts) return "";
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <Box sx={{ mb: { xs: 2.5, sm: 3.5 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
          <Box>
            <Stack direction="row" alignItems="center" gap={1.25} mb={0.5}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #0D7D70 0%, #14B8A6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(13, 125, 112, 0.3)",
                  flexShrink: 0,
                }}
              >
                <HistoryIcon sx={{ color: "#FFF", fontSize: "1.3rem" }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1.1, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                >
                  Email Dispatch Logs
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
                  {isAdmin
                    ? "All instructors' sent email history"
                    : `Your email history · ${authCtx.user?.email || ""}`}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Tooltip title="Export visible logs as CSV">
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExport}
                  disabled={filteredLogs.length === 0}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "rgba(13, 125, 112, 0.35)",
                    color: "#0D7D70",
                    "&:hover": { borderColor: "#0D7D70", bgcolor: "rgba(13, 125, 112, 0.06)" },
                  }}
                >
                  Export CSV
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={isAdmin ? "Clear ALL users' logs" : "Clear your logs"}>
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setClearDialogOpen(true)}
                  disabled={rawLogs.length === 0}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "rgba(239, 68, 68, 0.35)",
                    color: "#EF4444",
                    "&:hover": { borderColor: "#EF4444", bgcolor: "rgba(239, 68, 68, 0.06)" },
                  }}
                >
                  Clear Logs
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mb: { xs: 2.5, sm: 3 } }}>
        <StatCard
          icon={MarkEmailReadIcon}
          label="Emails Sent"
          value={stats.totalSent}
          sub="successful dispatches"
          color="#0D7D70"
        />
        <StatCard
          icon={PeopleAltIcon}
          label="Total Recipients"
          value={stats.totalRecipients}
          sub="students notified"
          color="#7C3AED"
        />
        <StatCard
          icon={AccessTimeIcon}
          label="Last Dispatch"
          value={stats.lastSent ? formatRelative(stats.lastSent) : "—"}
          sub={stats.lastSent ? formatDate(stats.lastSent) : "No emails yet"}
          color="#0284C7"
        />
        {isAdmin && (
          <StatCard
            icon={EmailIcon}
            label="Active Senders"
            value={(() => {
              const senders = new Set(rawLogs.map((l) => l.userId).filter(Boolean));
              return senders.size;
            })()}
            sub="instructors who sent"
            color="#D97706"
          />
        )}
      </Stack>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          borderRadius: "16px",
          border: "1px solid rgba(13, 125, 112, 0.1)",
          bgcolor: "#FAFFFE",
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="Search by subject, course, sender…"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94A3B8", fontSize: "1.1rem" }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            minWidth: 200,
            "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#FFF" },
          }}
        />
        <Select
          size="small"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(0); }}
          sx={{ borderRadius: "10px", minWidth: 140, bgcolor: "#FFF", fontSize: "0.875rem" }}
        >
          <MenuItem value="all">All Time</MenuItem>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="week">Last 7 Days</MenuItem>
          <MenuItem value="month">Last 30 Days</MenuItem>
        </Select>
        {(searchTerm || dateFilter !== "all") && (
          <Chip
            label={`${filteredLogs.length} result${filteredLogs.length !== 1 ? "s" : ""}`}
            size="small"
            sx={{ bgcolor: "rgba(13, 125, 112, 0.1)", color: "#0D7D70", fontWeight: 700 }}
          />
        )}
      </Paper>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "18px",
          border: "1px solid rgba(13, 125, 112, 0.1)",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(13, 125, 112, 0.05)",
        }}
      >
        {rawLogs.length === 0 ? (
          <EmptyState />
        ) : filteredLogs.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
            <Typography variant="body1" sx={{ color: "#64748B", fontWeight: 600 }}>
              No logs match your filters.
            </Typography>
            <Button size="small" onClick={() => { setSearchTerm(""); setDateFilter("all"); }} sx={{ mt: 1, color: "#0D7D70", textTransform: "none" }}>
              Clear filters
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small" stickyHeader aria-label="email logs table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell sx={{ width: 130 }}>Date & Time</StyledTableCell>
                    <StyledTableCell>Course</StyledTableCell>
                    <StyledTableCell>Subject</StyledTableCell>
                    <StyledTableCell sx={{ width: 160 }}>Recipients</StyledTableCell>
                    {isAdmin && <StyledTableCell>Sent By</StyledTableCell>}
                    <StyledTableCell sx={{ width: 90 }} align="center">Status</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <StyledTableRow key={log.id}>
                      {/* Date */}
                      <StyledTableCell>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", display: "block" }}>
                          {formatDate(log.timestamp).split(",")[0]}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                          {new Date(log.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </Typography>
                        <Typography variant="caption" sx={{ display: "block", color: "#CBD5E1", fontSize: "0.68rem" }}>
                          {formatRelative(log.timestamp)}
                        </Typography>
                      </StyledTableCell>

                      {/* Course */}
                      <StyledTableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.83rem" }}>
                          {log.courseName || "—"}
                        </Typography>
                        {log.courseId && (
                          <Typography variant="caption" sx={{ color: "#94A3B8", fontFamily: "monospace" }}>
                            {log.courseId.slice(-8)}
                          </Typography>
                        )}
                      </StyledTableCell>

                      {/* Subject */}
                      <StyledTableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#334155",
                            fontSize: "0.83rem",
                            maxWidth: 280,
                            wordBreak: "break-word",
                            lineHeight: 1.4,
                          }}
                        >
                          {log.subject || "—"}
                        </Typography>
                      </StyledTableCell>

                      {/* Recipients */}
                      <StyledTableCell>
                        <RecipientsCell
                          emails={log.recipientEmails || []}
                          count={log.recipientCount}
                        />
                      </StyledTableCell>

                      {/* Sent By (admin only) */}
                      {isAdmin && (
                        <StyledTableCell>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                background: "linear-gradient(135deg, #0D7D70 0%, #14B8A6 100%)",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: "#FFF",
                                flexShrink: 0,
                              }}
                            >
                              {log.senderName ? log.senderName.charAt(0).toUpperCase() : "?"}
                            </Avatar>
                            <Box>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", display: "block" }}>
                                {log.senderName || "Unknown"}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.7rem" }}>
                                {log.senderEmail || ""}
                              </Typography>
                            </Box>
                          </Stack>
                        </StyledTableCell>
                      )}

                      {/* Status */}
                      <StyledTableCell align="center">
                        <Chip
                          label={log.status === "success" ? "Sent" : "Failed"}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            height: 22,
                            bgcolor:
                              log.status === "success"
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(239, 68, 68, 0.1)",
                            color:
                              log.status === "success" ? "#059669" : "#DC2626",
                          }}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <TablePagination
              component="div"
              count={filteredLogs.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 15, 25, 50]}
              sx={{ fontSize: "0.8rem" }}
            />
          </>
        )}
      </Paper>

      {/* ── Clear Confirmation Dialog ────────────────────────────────────── */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
          Clear Email Logs?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#475569" }}>
            {isAdmin
              ? "This will permanently delete ALL users' email logs from this browser. This action cannot be undone."
              : "This will permanently delete your email logs from this browser. This action cannot be undone."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setClearDialogOpen(false)}
            sx={{ textTransform: "none", color: "#64748B", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleClear}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#EF4444",
              borderRadius: "10px",
              "&:hover": { bgcolor: "#DC2626" },
            }}
          >
            Yes, Clear All
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ────────────────────────────────────────────────────── */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%", borderRadius: "12px" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
