import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useParams, useNavigate } from "react-router-dom";
import useAxios from "../api";
import GlassCard from "../components/UI/GlassCard";
import { sendZeptoMail } from "../services/emailService";
import AuthContext from "../store/auth-context";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#EDF5F3 !important",
    color: "#0F172A",
    fontWeight: 700,
    borderBottom: "2px solid rgba(13, 125, 112, 0.2)",
    boxShadow: "0 2px 4px rgba(15, 23, 42, 0.04)",
    zIndex: 10,
    whiteSpace: "nowrap",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: "#0F172A",
    borderBottom: "1px solid rgba(13, 125, 112, 0.08)",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: "rgba(13, 125, 112, 0.04)",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function CourseAttendanceReport() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const Axios = useAxios();

  const [course, setCourse] = React.useState(null);
  const [classesList, setClassesList] = React.useState([]);
  const [studentStats, setStudentStats] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadingProgress, setLoadingProgress] = React.useState("");
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState(null);
  const [isError, setIsError] = React.useState(false);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = React.useState("");
  const [thresholdFilter, setThresholdFilter] = React.useState("all"); // 'all', 'below75', 'below50', 'below25', 'zero', 'above75'
  const [sortField, setSortField] = React.useState("percentage");
  const [sortOrder, setSortOrder] = React.useState("asc"); // Default asc to see lowest attendance first!
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  // Selected students for bulk email
  const [selectedIds, setSelectedIds] = React.useState([]);

  // Email Composer Modal State
  const [openEmailModal, setOpenEmailModal] = React.useState(false);
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailBody, setEmailBody] = React.useState("");
  const [targetEmails, setTargetEmails] = React.useState([]);
  const [copiedNotification, setCopiedNotification] = React.useState(false);
  const authCtx = React.useContext(AuthContext);
  const [isSendingZepto, setIsSendingZepto] = React.useState(false);
  const [emailSendStatus, setEmailSendStatus] = React.useState(null); // { type: 'success' | 'error', message: '' }
  const [showAllRecipients, setShowAllRecipients] = React.useState(false);
  const [customEmailInput, setCustomEmailInput] = React.useState("");

  const isFetchingRef = React.useRef(false);

  // Fetch course & aggregate attendance across all class sessions
  const loadAttendanceReport = React.useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      setLoadingProgress("Fetching course details...");
      // 1. Fetch Course details & enrolled students
      const courseRes = await Axios({ url: `/course/${courseId}` });
      const courseData = courseRes.data?.data;
      setCourse(courseData || null);
      const enrolledStudents = courseData?.students || [];

      setLoadingProgress("Fetching class sessions...");
      // 2. Fetch all classes for this course
      const classesRes = await Axios({ url: "/class", params: { courseId } });
      const classes = classesRes.data?.data || [];
      setClassesList(classes);

      const totalConducted = classes.length;

      // Try fetching users map to enrich emails if endpoint is accessible
      const userEmailMap = {};
      try {
        const userRes = await Axios({ url: "/user", params: { pageNumber: 1, limit: 5000 } });
        const allUsers = userRes.data?.data || [];
        allUsers.forEach((u) => {
          if (u._id && u.email) userEmailMap[u._id] = u.email;
          if (u.registrationNo && u.email) userEmailMap[u.registrationNo] = u.email;
        });
      } catch (e) {
        // Continue silently if user does not have permission for /user
      }

      // 3. For each student, compute attendance records
      const statsMap = {};
      enrolledStudents.forEach((st) => {
        const regStr = st.registrationNo ? String(st.registrationNo).trim() : "";
        const resolvedEmail =
          st.email ||
          userEmailMap[st._id] ||
          (regStr ? userEmailMap[regStr] : "") ||
          (regStr && regStr !== "-" ? `${regStr}@gkv.ac.in` : "");

        statsMap[st._id] = {
          _id: st._id,
          name: st.name || "Unknown",
          registrationNo: regStr || "-",
          email: resolvedEmail,
          attendedCount: 0,
          totalClasses: totalConducted,
          percentage: 0,
        };
      });

      // Fetch attendance for each class in parallel batches
      if (totalConducted > 0) {
        setLoadingProgress(`Analyzing attendance across ${totalConducted} class sessions...`);
        const attendancePromises = classes.map((c) =>
          Axios({ url: "/class/students", params: { classId: c._id } }).catch(() => ({
            data: { data: [] },
          }))
        );

        const classAttendanceResults = await Promise.all(attendancePromises);

        classAttendanceResults.forEach((res) => {
          const attendanceList = res.data?.data || [];
          attendanceList.forEach((rec) => {
            if (rec._id && statsMap[rec._id] && !statsMap[rec._id].email && rec.email) {
              statsMap[rec._id].email = rec.email;
            }
            if (rec.present) {
              if (statsMap[rec._id]) {
                statsMap[rec._id].attendedCount += 1;
              } else if (rec.email) {
                const existing = Object.values(statsMap).find(
                  (s) => s.email?.toLowerCase() === rec.email?.toLowerCase()
                );
                if (existing) {
                  existing.attendedCount += 1;
                }
              }
            }
          });
        });
      }

      // Compute final percentages
      const finalStats = Object.values(statsMap).map((st) => {
        const pct =
          totalConducted > 0 ? Math.round((st.attendedCount / totalConducted) * 100) : 0;
        let finalEmail = st.email;
        if (!finalEmail && st.registrationNo && st.registrationNo !== "-") {
          finalEmail = `${String(st.registrationNo).trim()}@gkv.ac.in`;
        }
        return {
          ...st,
          email: finalEmail,
          percentage: pct,
        };
      });

      setStudentStats(finalStats);
    } catch (err) {
      console.error("Error loading attendance report:", err);
      setIsError(true);
      setShowAlert(true);
      setAlertMessage(err.response?.data?.message || "Failed to load attendance report");
    } finally {
      setIsLoading(false);
      setLoadingProgress("");
      isFetchingRef.current = false;
    }
  }, [Axios, courseId]);

  React.useEffect(() => {
    loadAttendanceReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // KPI Summary calculations
  const totalStudents = studentStats.length;
  const below75Count = studentStats.filter((s) => s.percentage < 75).length;
  const below50Count = studentStats.filter((s) => s.percentage < 50).length;
  const below25Count = studentStats.filter((s) => s.percentage < 25).length;
  const zeroCount = studentStats.filter((s) => s.percentage === 0).length;
  const avgAttendance =
    totalStudents > 0
      ? Math.round(
          studentStats.reduce((acc, curr) => acc + curr.percentage, 0) / totalStudents
        )
      : 0;

  // Filtered and Sorted Students
  const filteredStudents = React.useMemo(() => {
    let list = [...studentStats];

    // 1. Threshold Filter
    if (thresholdFilter === "below75") {
      list = list.filter((s) => s.percentage < 75);
    } else if (thresholdFilter === "below50") {
      list = list.filter((s) => s.percentage < 50);
    } else if (thresholdFilter === "below25") {
      list = list.filter((s) => s.percentage < 25);
    } else if (thresholdFilter === "zero") {
      list = list.filter((s) => s.percentage === 0);
    } else if (thresholdFilter === "above75") {
      list = list.filter((s) => s.percentage >= 75);
    }

    // 2. Search Filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.registrationNo?.toString().toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "name") {
        return sortOrder === "asc"
          ? (valA || "").localeCompare(valB || "")
          : (valB || "").localeCompare(valA || "");
      }
      if (sortField === "registrationNo") {
        return sortOrder === "asc"
          ? (Number(valA) || 0) - (Number(valB) || 0)
          : (Number(valB) || 0) - (Number(valA) || 0);
      }
      if (sortField === "percentage") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });

    return list;
  }, [studentStats, thresholdFilter, searchTerm, sortField, sortOrder]);

  // Paginated records
  const paginatedStudents = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredStudents.slice(start, start + rowsPerPage);
  }, [filteredStudents, page, rowsPerPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(filteredStudents.map((s) => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Pre-drafted Email Composer
  const handleOpenEmailComposer = (specificStudent = null) => {
    let recipients = [];
    let defaultSubject = "";
    let defaultBody = "";

    const cName = course?.courseName || "your course";
    const cCode = course?.courseCode ? `(${course.courseCode})` : "";
    const totalConducted = classesList.length;

    const instructorName = authCtx.user?.name || course?.teacher?.name || "Dr. Nishant Kumar";
    const instructorEmail =
      authCtx.user?.email ||
      course?.teacher?.email ||
      (instructorName.toLowerCase().includes("nishant") ? "nishant.kumar@gkv.ac.in" : "");

    const instructorSignoff = `Regards,\n${instructorName}\nCourse Instructor\n${
      instructorEmail ? `Email: ${instructorEmail}\n` : ""
    }NMRIL Labs - GKV Attendance Portal`;

    if (specificStudent) {
      let sEmail = specificStudent.email;
      if (!sEmail && specificStudent.registrationNo && specificStudent.registrationNo !== "-") {
        sEmail = `${String(specificStudent.registrationNo).trim()}@gkv.ac.in`;
      }
      recipients = sEmail ? [sEmail] : [];
      defaultSubject = `URGENT: Low Attendance Warning for ${cName} ${cCode}`;
      defaultBody = `Dear ${specificStudent.name},\n\nThis is an official notice regarding your attendance in ${cName} ${cCode}.\n\nYour current recorded attendance is ${specificStudent.percentage}% (${specificStudent.attendedCount} out of ${totalConducted} classes attended).\n\nAs per university regulations, a minimum of 75% attendance is strictly mandatory to remain eligible for examinations. Please contact the course instructor immediately to discuss your attendance shortage.\n\n${instructorSignoff}`;
    } else {
      // Automatic intelligent recipient selection:
      let targetList = [];
      if (selectedIds.length > 0) {
        // 1. If teacher checked specific rows
        targetList = studentStats.filter((s) => selectedIds.includes(s._id));
      } else if (thresholdFilter !== "all") {
        // 2. If a specific filter is active (<25%, <50%, <75%, 0%)
        targetList = filteredStudents;
      } else {
        // 3. Default when clicking "Email Defaulters": select all students with < 75% attendance!
        const defaulters = studentStats.filter((s) => s.percentage < 75);
        targetList = defaulters.length > 0 ? defaulters : studentStats;
      }

      recipients = targetList
        .map((s) => {
          if (s.email && s.email.trim()) return s.email.trim();
          const reg = s.registrationNo || s.rollNo || s.roll_no;
          if (reg && reg !== "-") {
            return `${String(reg).trim()}@gkv.ac.in`;
          }
          return null;
        })
        .filter(Boolean);

      defaultSubject = `URGENT: Low Attendance Notice - ${cName} ${cCode}`;
      defaultBody = `Dear Student,\n\nThis is an official notification regarding your attendance shortage in ${cName} ${cCode}.\n\nYour recorded cumulative attendance is currently below the university threshold of 75%.\n\nPlease be advised that falling short of mandatory attendance will lead to debarment from the upcoming semester examinations.\n\nYou are advised to contact the course instructor immediately.\n\nCourse: ${cName} ${cCode}\nTotal Classes Conducted: ${totalConducted}\n\n${instructorSignoff}`;
    }

    setTargetEmails(recipients);
    setEmailSubject(defaultSubject);
    setEmailBody(defaultBody);
    setEmailSendStatus(null);
    setOpenEmailModal(true);
  };

  // Send Email Directly via ZeptoMail API
  const handleSendViaZeptoMail = async () => {
    if (!targetEmails.length) {
      setEmailSendStatus({ type: "error", message: "No recipient emails selected." });
      return;
    }

    setIsSendingZepto(true);
    setEmailSendStatus(null);

    const instructorName = authCtx.user?.name || course?.teacher?.name || "Dr. Nishant Kumar";
    const instructorEmail =
      authCtx.user?.email ||
      course?.teacher?.email ||
      (instructorName.toLowerCase().includes("nishant") ? "nishant.kumar@gkv.ac.in" : "");

    const res = await sendZeptoMail({
      bcc: targetEmails,
      subject: emailSubject,
      bodyContent: emailBody,
      courseName: course?.courseName || "Academic Course",
      instructorName,
      instructorEmail,
    });

    setIsSendingZepto(false);

    if (res.success) {
      setEmailSendStatus({
        type: "success",
        message: `Official attendance notice successfully sent to ${targetEmails.length} student(s) via ZeptoMail!`,
      });
      setIsError(false);
      setAlertMessage(`Dispatched notice to ${targetEmails.length} student(s) via ZeptoMail.`);
      setShowAlert(true);
    } else {
      setEmailSendStatus({
        type: "error",
        message: res.error || "Failed to dispatch email via ZeptoMail. Check network or API credentials.",
      });
    }
  };

  const handleAddCustomEmail = () => {
    const trimmed = (customEmailInput || "").trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;
    if (!targetEmails.includes(trimmed)) {
      setTargetEmails((prev) => [...prev, trimmed]);
    }
    setCustomEmailInput("");
  };

  const handleRemoveRecipient = (emailToRemove) => {
    setTargetEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleAddTeacherEmail = () => {
    const instructorName = authCtx.user?.name || course?.teacher?.name || "Dr. Nishant Kumar";
    const tEmail =
      authCtx.user?.email?.trim().toLowerCase() ||
      course?.teacher?.email?.trim().toLowerCase() ||
      (instructorName.toLowerCase().includes("nishant") ? "nishant.kumar@gkv.ac.in" : "");
    if (tEmail && !targetEmails.includes(tEmail)) {
      setTargetEmails((prev) => [tEmail, ...prev]);
    }
  };

  const handleCopyEmails = () => {
    if (!targetEmails.length) return;
    navigator.clipboard.writeText(targetEmails.join(", "));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleCopyDraft = () => {
    const textToCopy = `Subject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredStudents.length) return;
    const headers = [
      "Student Name",
      "Registration No",
      "Email",
      "Attended Classes",
      "Total Classes",
      "Attendance Percentage",
      "Status",
    ];
    const rows = filteredStudents.map((s) => {
      const statusText =
        s.percentage >= 75
          ? "Eligible"
          : s.percentage >= 50
          ? "Shortage (<75%)"
          : s.percentage >= 25
          ? "Severe Shortage (<50%)"
          : s.percentage === 0
          ? "Zero Attendance"
          : "Critical Defaulter (<25%)";
      return `"${s.name}", "${s.registrationNo}", "${s.email}", ${s.attendedCount}, ${s.totalClasses}, "${s.percentage}%", "${statusText}"`;
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `attendance_report_${course?.courseName || "course"}_${thresholdFilter}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPercentageColor = (pct) => {
    if (pct >= 75) return "#10B981"; // Green
    if (pct >= 50) return "#F59E0B"; // Amber
    if (pct >= 25) return "#F97316"; // Orange
    return "#EF4444"; // Red
  };

  const getPercentageBadge = (pct) => {
    if (pct >= 75) {
      return (
        <Chip
          icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
          label={`${pct}% (Eligible)`}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            color: "#059669",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        />
      );
    }
    if (pct >= 50) {
      return (
        <Chip
          icon={<WarningAmberIcon sx={{ fontSize: "14px !important" }} />}
          label={`${pct}% (< 75%)`}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            backgroundColor: "rgba(245, 158, 11, 0.12)",
            color: "#D97706",
            border: "1px solid rgba(245, 158, 11, 0.3)",
          }}
        />
      );
    }
    if (pct >= 25) {
      return (
        <Chip
          icon={<ErrorOutlineIcon sx={{ fontSize: "14px !important" }} />}
          label={`${pct}% (< 50%)`}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            backgroundColor: "rgba(249, 115, 22, 0.12)",
            color: "#EA580C",
            border: "1px solid rgba(249, 115, 22, 0.3)",
          }}
        />
      );
    }
    if (pct === 0) {
      return (
        <Chip
          icon={<ErrorOutlineIcon sx={{ fontSize: "14px !important" }} />}
          label="0% (Never Attended)"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            backgroundColor: "rgba(239, 68, 68, 0.16)",
            color: "#B91C1C",
            border: "1px solid rgba(239, 68, 68, 0.35)",
          }}
        />
      );
    }
    return (
      <Chip
        icon={<ErrorOutlineIcon sx={{ fontSize: "14px !important" }} />}
        label={`${pct}% (Critical < 25%)`}
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: "0.75rem",
          backgroundColor: "rgba(239, 68, 68, 0.12)",
          color: "#DC2626",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        }}
      />
    );
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#0D7D70", mb: 2 }} />
        <Typography variant="h6" sx={{ color: "#0F172A", fontWeight: 600 }}>
          Generating Course Attendance Analytics...
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B", mt: 1 }}>
          {loadingProgress}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 1.5, sm: 3 }, mb: 5, px: { xs: 0.5, sm: 2 } }}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
      >
        <Alert onClose={() => setShowAlert(false)} severity={isError ? "error" : "success"}>
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Top Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(13, 125, 112, 0.14)",
          borderTop: "4px solid #0D7D70",
          boxShadow: "0px 6px 20px rgba(15, 23, 42, 0.04)",
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="Back to class sessions">
            <IconButton
              onClick={() => navigate(`/classes/${courseId}`)}
              sx={{
                bgcolor: "rgba(13, 125, 112, 0.06)",
                color: "#0D7D70",
                "&:hover": { bgcolor: "rgba(13, 125, 112, 0.14)" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>
              {course?.courseName || "Course"} — Attendance & Defaulters Analysis
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Course Code: <strong>{course?.courseCode}</strong> • {classesList.length} Sessions Conducted
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            sx={{
              borderRadius: "20px",
              borderColor: "rgba(13, 125, 112, 0.3)",
              color: "#0D7D70",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                borderColor: "#0D7D70",
                backgroundColor: "rgba(13, 125, 112, 0.05)",
              },
            }}
          >
            Export List ({filteredStudents.length})
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<EmailIcon />}
            onClick={() => handleOpenEmailComposer()}
            sx={{
              borderRadius: "20px",
              backgroundColor: "#0D7D70",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0px 4px 14px rgba(13, 125, 112, 0.25)",
              "&:hover": { backgroundColor: "#08564D" },
            }}
          >
            {selectedIds.length > 0
              ? `Email Selected (${selectedIds.length})`
              : thresholdFilter !== "all"
              ? `Email Filtered (${filteredStudents.length})`
              : `Email Defaulters (<75%) (${below75Count})`}
          </Button>
        </Box>
      </Paper>

      {/* 5 Interactive Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Sessions */}
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            elevation={0}
            onClick={() => setThresholdFilter("all")}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: thresholdFilter === "all" ? "#F0FDF4" : "#FFFFFF",
              border:
                thresholdFilter === "all"
                  ? "2px solid #0D7D70"
                  : "1px solid rgba(13, 125, 112, 0.12)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
              All Enrolled
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#0F172A", mt: 0.5 }}>
              {totalStudents}
            </Typography>
            <Typography variant="caption" sx={{ color: "#0D7D70", display: "block" }}>
              Avg: {avgAttendance}%
            </Typography>
          </Paper>
        </Grid>

        {/* Shortage < 75% */}
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            elevation={0}
            onClick={() => setThresholdFilter("below75")}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: thresholdFilter === "below75" ? "rgba(245, 158, 11, 0.08)" : "#FFFFFF",
              border:
                thresholdFilter === "below75"
                  ? "2px solid #F59E0B"
                  : "1px solid rgba(245, 158, 11, 0.25)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <Typography variant="caption" sx={{ color: "#B45309", fontWeight: 700 }}>
              Shortage (&lt; 75%)
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#B45309", mt: 0.5 }}>
              {below75Count}
            </Typography>
            <Typography variant="caption" sx={{ color: "#D97706", display: "block" }}>
              Exam risk threshold
            </Typography>
          </Paper>
        </Grid>

        {/* Severe < 50% */}
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            elevation={0}
            onClick={() => setThresholdFilter("below50")}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: thresholdFilter === "below50" ? "rgba(249, 115, 22, 0.08)" : "#FFFFFF",
              border:
                thresholdFilter === "below50"
                  ? "2px solid #F97316"
                  : "1px solid rgba(249, 115, 22, 0.25)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <Typography variant="caption" sx={{ color: "#C2410C", fontWeight: 700 }}>
              Severe (&lt; 50%)
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#C2410C", mt: 0.5 }}>
              {below50Count}
            </Typography>
            <Typography variant="caption" sx={{ color: "#EA580C", display: "block" }}>
              High absenteeism
            </Typography>
          </Paper>
        </Grid>

        {/* Critical < 25% */}
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            elevation={0}
            onClick={() => setThresholdFilter("below25")}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: thresholdFilter === "below25" ? "rgba(239, 68, 68, 0.08)" : "#FFFFFF",
              border:
                thresholdFilter === "below25"
                  ? "2px solid #EF4444"
                  : "1px solid rgba(239, 68, 68, 0.25)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <Typography variant="caption" sx={{ color: "#DC2626", fontWeight: 700 }}>
              Critical (&lt; 25%)
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#DC2626", mt: 0.5 }}>
              {below25Count}
            </Typography>
            <Typography variant="caption" sx={{ color: "#EF4444", display: "block" }}>
              Immediate warning
            </Typography>
          </Paper>
        </Grid>

        {/* Zero Attendance */}
        <Grid item xs={12} sm={4} md={2.4}>
          <Paper
            elevation={0}
            onClick={() => setThresholdFilter("zero")}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: thresholdFilter === "zero" ? "rgba(185, 28, 28, 0.1)" : "#FFFFFF",
              border:
                thresholdFilter === "zero"
                  ? "2px solid #B91C1C"
                  : "1px solid rgba(185, 28, 28, 0.25)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <Typography variant="caption" sx={{ color: "#991B1B", fontWeight: 700 }}>
              Zero Attendance (0%)
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#991B1B", mt: 0.5 }}>
              {zeroCount}
            </Typography>
            <Typography variant="caption" sx={{ color: "#B91C1C", display: "block" }}>
              Never attended class
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main GlassCard with Filter Toolbar & Table */}
      <GlassCard sx={{ p: { xs: 2, sm: 2.5, md: 3 }, overflow: "visible" }}>
        {/* Toolbar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
            pt: 0.5,
          }}
        >
          {/* Search Box */}
          <TextField
            size="small"
            placeholder="Search student by name, registration number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#0D7D70" }} />
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
              flex: { xs: "1 1 auto", md: "2 1 auto" },
              "& .MuiOutlinedInput-root": { backgroundColor: "#FFFFFF", borderRadius: "12px" },
            }}
          />

          {/* Threshold Dropdown */}
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel
              id="threshold-select-label"
              sx={{ backgroundColor: "#FFFFFF", px: 0.8, borderRadius: "4px" }}
            >
              Attendance Filter
            </InputLabel>
            <Select
              labelId="threshold-select-label"
              value={thresholdFilter}
              label="Attendance Filter"
              onChange={(e) => setThresholdFilter(e.target.value)}
              sx={{ borderRadius: "12px", backgroundColor: "#FFFFFF" }}
            >
              <MenuItem value="all">All Students ({totalStudents})</MenuItem>
              <MenuItem value="below75" sx={{ color: "#B45309", fontWeight: 600 }}>
                Shortage: Below 75% ({below75Count})
              </MenuItem>
              <MenuItem value="below50" sx={{ color: "#C2410C", fontWeight: 600 }}>
                Severe: Below 50% ({below50Count})
              </MenuItem>
              <MenuItem value="below25" sx={{ color: "#DC2626", fontWeight: 600 }}>
                Critical: Below 25% ({below25Count})
              </MenuItem>
              <MenuItem value="zero" sx={{ color: "#991B1B", fontWeight: 700 }}>
                Zero Attendance: 0% ({zeroCount})
              </MenuItem>
              <MenuItem value="above75" sx={{ color: "#059669", fontWeight: 600 }}>
                Eligible: 75% &amp; Above
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Status Bar with Active Filter Chips & Selection Count */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem" }}>
            Showing <strong>{filteredStudents.length}</strong> of <strong>{totalStudents}</strong> students
            {selectedIds.length > 0 && (
              <span style={{ color: "#0D7D70", fontWeight: 700, marginLeft: 8 }}>
                ({selectedIds.length} selected for email)
              </span>
            )}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {thresholdFilter !== "all" && (
              <Chip
                label={`Filter: ${
                  thresholdFilter === "below75"
                    ? "Below 75%"
                    : thresholdFilter === "below50"
                    ? "Below 50%"
                    : thresholdFilter === "below25"
                    ? "Below 25%"
                    : thresholdFilter === "zero"
                    ? "0% Attendance"
                    : "Eligible (≥75%)"
                }`}
                size="small"
                onDelete={() => setThresholdFilter("all")}
                sx={{ backgroundColor: "rgba(13, 125, 112, 0.1)", color: "#0D7D70" }}
              />
            )}
            {searchTerm && (
              <Chip
                label={`Search: "${searchTerm}"`}
                size="small"
                onDelete={() => setSearchTerm("")}
                sx={{ backgroundColor: "rgba(13, 125, 112, 0.1)", color: "#0D7D70" }}
              />
            )}
          </Box>
        </Box>

        {/* Attendance Table */}
        <TableContainer
          sx={{
            maxHeight: "60vh",
            borderRadius: "12px",
            border: "1px solid rgba(13, 125, 112, 0.14)",
            overflow: "auto",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Table stickyHeader aria-label="student attendance report table">
            <TableHead>
              <TableRow sx={{ "& th": { backgroundColor: "#EDF5F3 !important" } }}>
                <StyledTableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selectedIds.length > 0 && selectedIds.length < filteredStudents.length
                    }
                    checked={
                      filteredStudents.length > 0 &&
                      selectedIds.length === filteredStudents.length
                    }
                    onChange={handleSelectAll}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={sortField === "name"}
                    direction={sortField === "name" ? sortOrder : "asc"}
                    onClick={() => handleSort("name")}
                  >
                    Student Name
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <TableSortLabel
                    active={sortField === "registrationNo"}
                    direction={sortField === "registrationNo" ? sortOrder : "asc"}
                    onClick={() => handleSort("registrationNo")}
                  >
                    Registration No
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="left">Email</StyledTableCell>
                <StyledTableCell align="center">Attended / Total</StyledTableCell>
                <StyledTableCell align="left">
                  <TableSortLabel
                    active={sortField === "percentage"}
                    direction={sortField === "percentage" ? sortOrder : "asc"}
                    onClick={() => handleSort("percentage")}
                  >
                    Attendance % &amp; Status
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="center">Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((row) => {
                  const isSelected = selectedIds.includes(row._id);
                  return (
                    <StyledTableRow
                      key={row._id}
                      hover
                      role="checkbox"
                      aria-checked={isSelected}
                      selected={isSelected}
                    >
                      <StyledTableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(row._id)}
                        />
                      </StyledTableCell>
                      <StyledTableCell component="th" scope="row">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              backgroundColor: "rgba(13, 125, 112, 0.12)",
                              color: "#0D7D70",
                            }}
                          >
                            {getInitials(row.name)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                            {row.name}
                          </Typography>
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell align="left">
                        <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#334155" }}>
                          {row.registrationNo}
                        </Typography>
                      </StyledTableCell>

                      <StyledTableCell align="left">
                        <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.825rem" }}>
                          {row.email || "-"}
                        </Typography>
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                          {row.attendedCount} / {row.totalClasses}
                        </Typography>
                      </StyledTableCell>

                      <StyledTableCell align="left">
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 160 }}>
                          {getPercentageBadge(row.percentage)}
                          <LinearProgress
                            variant="determinate"
                            value={row.percentage}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: "rgba(0,0,0,0.06)",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: getPercentageColor(row.percentage),
                              },
                            }}
                          />
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        <Tooltip title={`Send Low Attendance warning to ${row.name}`}>
                          <Button
                            variant="outlined"
                            size="small"
                            color={row.percentage < 75 ? "error" : "primary"}
                            startIcon={<EmailIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleOpenEmailComposer(row)}
                            sx={{
                              borderRadius: "16px",
                              fontSize: "0.75rem",
                              textTransform: "none",
                              fontWeight: 600,
                              py: 0.3,
                              px: 1.2,
                            }}
                          >
                            Email
                          </Button>
                        </Tooltip>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      No students found matching your search and filter criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[15, 25, 50, 100]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
        />
      </GlassCard>

      {/* Pre-drafted Warning Email Dialog */}
      <Dialog
        open={openEmailModal}
        onClose={() => setOpenEmailModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "18px",
            border: "1px solid rgba(13, 125, 112, 0.16)",
            boxShadow: "0px 20px 50px rgba(15, 23, 42, 0.15)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: "1px solid rgba(13, 125, 112, 0.1)" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EmailIcon sx={{ color: "#0D7D70" }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
                Official Low Attendance Notice
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${targetEmails.length} Recipients`}
                size="small"
                sx={{
                  fontWeight: 700,
                  backgroundColor: "rgba(13, 125, 112, 0.1)",
                  color: "#0D7D70",
                }}
              />
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2.5}>
            {/* Real-time ZeptoMail Send Feedback */}
            {emailSendStatus && (
              <Alert
                severity={emailSendStatus.type}
                onClose={() => setEmailSendStatus(null)}
                sx={{ borderRadius: "10px" }}
              >
                {emailSendStatus.message}
              </Alert>
            )}

            {/* Recipients summary & Management box */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                backgroundColor: "rgba(13, 125, 112, 0.05)",
                border: "1px solid rgba(13, 125, 112, 0.18)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: showAllRecipients ? 1.5 : 0,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: "#0D7D70", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Target Recipients (BCC - Student emails protected privately):
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "#0F172A",
                      maxWidth: 550,
                      whiteSpace: showAllRecipients ? "normal" : "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      mt: 0.25,
                    }}
                  >
                    {targetEmails.length > 0
                      ? `${targetEmails.length} Students Selected: ${targetEmails.slice(0, 3).join(", ")}${targetEmails.length > 3 ? ` + ${targetEmails.length - 3} more` : ""}`
                      : "No recipients selected"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setShowAllRecipients(!showAllRecipients)}
                    sx={{
                      fontSize: "0.75rem",
                      textTransform: "none",
                      color: "#0D7D70",
                      fontWeight: 600,
                    }}
                  >
                    {showAllRecipients ? "Collapse List" : "View/Edit All"}
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyEmails}
                    sx={{
                      borderRadius: "16px",
                      fontSize: "0.75rem",
                      textTransform: "none",
                      borderColor: "rgba(13, 125, 112, 0.3)",
                      color: "#0D7D70",
                    }}
                  >
                    {copiedNotification ? "Copied!" : "Copy Emails"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyDraft}
                    sx={{
                      borderRadius: "16px",
                      fontSize: "0.75rem",
                      textTransform: "none",
                      borderColor: "rgba(13, 125, 112, 0.3)",
                      color: "#0D7D70",
                    }}
                  >
                    Copy Notice Text
                  </Button>
                </Box>
              </Box>

              {/* Expandable Recipient Chips & Custom Add Field */}
              {showAllRecipients && (
                <Box sx={{ pt: 1, borderTop: "1px dashed rgba(13, 125, 112, 0.2)" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.75,
                      maxHeight: 140,
                      overflowY: "auto",
                      p: 1,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 2,
                      border: "1px solid rgba(13, 125, 112, 0.12)",
                      mb: 1.5,
                    }}
                  >
                    {targetEmails.map((email) => (
                      <Chip
                        key={email}
                        label={email}
                        size="small"
                        onDelete={() => handleRemoveRecipient(email)}
                        sx={{
                          fontSize: "0.75rem",
                          backgroundColor: "rgba(13, 125, 112, 0.08)",
                          color: "#0D7D70",
                          fontWeight: 500,
                        }}
                      />
                    ))}
                    {targetEmails.length === 0 && (
                      <Typography variant="caption" sx={{ color: "#94A3B8", p: 0.5 }}>
                        No email recipients in list. Add manually below or select students from table.
                      </Typography>
                    )}
                  </Box>

                  {/* Add Extra Recipient Input */}
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      size="small"
                      placeholder="Add recipient email (e.g. teacher copy, HOD, student)..."
                      value={customEmailInput}
                      onChange={(e) => setCustomEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomEmail();
                        }
                      }}
                      sx={{
                        flexGrow: 1,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#FFFFFF",
                          fontSize: "0.825rem",
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PersonAddIcon />}
                      onClick={handleAddCustomEmail}
                      disabled={!customEmailInput.trim()}
                      sx={{
                        backgroundColor: "#0D7D70",
                        textTransform: "none",
                        borderRadius: 2,
                        whiteSpace: "nowrap",
                        "&:hover": { backgroundColor: "#08564D" },
                      }}
                    >
                      Add Recipient
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleAddTeacherEmail}
                      sx={{
                        borderColor: "rgba(13, 125, 112, 0.3)",
                        color: "#0D7D70",
                        textTransform: "none",
                        borderRadius: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      + Add My Email
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Subject Field */}
            <TextField
              fullWidth
              size="small"
              label="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            {/* Message Body Field */}
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Message Body (Official pre-drafted warning notice)"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                },
              }}
            />

            <Typography variant="caption" sx={{ color: "#64748B" }}>
              * Emails will be sent from <strong>noreply@gkv.ac.in</strong> (GKVFLow-PMS) using ZeptoMail with high deliverability.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            borderTop: "1px solid rgba(13, 125, 112, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Button
            size="medium"
            onClick={() => setOpenEmailModal(false)}
            sx={{ color: "#64748B", textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSendViaZeptoMail}
            disabled={isSendingZepto || targetEmails.length === 0}
            startIcon={
              isSendingZepto ? (
                <CircularProgress size={18} sx={{ color: "white" }} />
              ) : (
                <SendIcon />
              )
            }
            sx={{
              borderRadius: "20px",
              backgroundColor: "#0D7D70",
              fontWeight: 700,
              textTransform: "none",
              px: 3.5,
              py: 1,
              boxShadow: "0 4px 14px rgba(13, 125, 112, 0.3)",
              "&:hover": { backgroundColor: "#08564D" },
            }}
          >
            {isSendingZepto
              ? "Sending via ZeptoMail..."
              : `Send via ZeptoMail (${targetEmails.length})`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
