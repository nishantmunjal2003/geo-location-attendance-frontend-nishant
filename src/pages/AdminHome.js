import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { styled } from "@mui/material/styles";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAxios from "../api";
import EditUserModal from "../components/Modal/EditUserModal";
import GlassCard from "../components/UI/GlassCard";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "rgba(13, 125, 112, 0.08)",
    color: "#0F172A",
    fontWeight: 700,
    borderBottom: "2px solid rgba(13, 125, 112, 0.15)",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: "#0F172A",
    borderBottom: "1px solid rgba(13, 125, 112, 0.08)",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "rgba(13, 125, 112, 0.04)",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

// Modern, Interactive Executive KPI Card
const ModernStatCard = ({ title, count, icon, subtitle, isActive, onClick, color }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 2.5,
      borderRadius: 3,
      backgroundColor: isActive ? "#F0FDF4" : "#FFFFFF",
      border: isActive
        ? "2px solid #0D7D70"
        : "1px solid rgba(13, 125, 112, 0.14)",
      boxShadow: isActive
        ? "0px 10px 25px rgba(13, 125, 112, 0.12)"
        : "0px 6px 18px rgba(15, 23, 42, 0.04)",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.25s ease",
      "&:hover": onClick
        ? {
            transform: "translateY(-3px)",
            boxShadow: "0px 12px 28px rgba(13, 125, 112, 0.15)",
            borderColor: "#0D7D70",
          }
        : {},
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <Box>
      <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold" sx={{ color: "#0F172A", lineHeight: 1.1 }}>
        {count.toLocaleString()}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: "#64748B", mt: 0.5, display: "block" }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "14px",
        backgroundColor: isActive ? "rgba(13, 125, 112, 0.18)" : "rgba(13, 125, 112, 0.08)",
        color: color || "#0D7D70",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Box>
  </Paper>
);

export default function AdminHome({ searchTerm: globalSearchTerm = "" }) {
  const navigate = useNavigate();
  const Axios = useAxios();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState(null);
  const [isError, setIsError] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [copiedEmail, setCopiedEmail] = React.useState(null);

  // In-Panel Search & Filter States
  const [localSearch, setLocalSearch] = React.useState("");
  const [selectedBatch, setSelectedBatch] = React.useState("All");
  const [selectedCourse, setSelectedCourse] = React.useState("All");
  const [sortField, setSortField] = React.useState("name");
  const [sortOrder, setSortOrder] = React.useState("asc");

  // Tab: 0 = All, 1 = Teachers, 2 = Students
  const [tabValue, setTabValue] = React.useState(0);

  // Cache for user courses
  const [userCourses, setUserCourses] = React.useState({});

  // Store raw users from backend
  const [allUsers, setAllUsers] = React.useState([]);

  // Fetch all users
  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const res = await Axios.get(`/user?pageNumber=1&limit=5000`);
      const usersData = res.data.data || [];
      setAllUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
      setIsError(true);
      setShowAlert(true);
      setAlertMessage(err.response?.data?.message || "Failed to fetch users");
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchAllUsers();
  }, []);

  // Fetch courses for users currently displayed or needed
  const fetchCoursesForUsers = async (usersList) => {
    const coursesData = {};
    const usersToFetch = usersList.filter(
      (u) => (u.role === "teacher" || u.role === "student") && !userCourses[u._id]
    );

    if (usersToFetch.length === 0) return;

    await Promise.all(
      usersToFetch.slice(0, 30).map(async (userItem) => {
        try {
          const res = await Axios.get(
            `/user/Courses?userId=${userItem._id}&role=${userItem.role}`
          );
          const courses = res.data.data;
          if (courses && courses.length > 0) {
            coursesData[userItem._id] = courses.map((c) => c.courseName).join(", ");
          } else {
            coursesData[userItem._id] = "-";
          }
        } catch (err) {
          coursesData[userItem._id] = "-";
        }
      })
    );

    if (Object.keys(coursesData).length > 0) {
      setUserCourses((prev) => ({ ...prev, ...coursesData }));
    }
  };

  // Stats calculation
  const stats = React.useMemo(() => {
    const teachers = allUsers.filter((u) => u.role === "teacher").length;
    const students = allUsers.filter((u) => u.role === "student").length;
    return {
      teachers,
      students,
      total: allUsers.length,
    };
  }, [allUsers]);

  // Extract unique batches from student roll/email (e.g. 216301001 -> 2021)
  const detectedBatches = React.useMemo(() => {
    const batchSet = new Set();
    allUsers.forEach((u) => {
      if (u.email) {
        const match = u.email.match(/^(\d{2})/);
        if (match) {
          const yr = parseInt(match[1], 10);
          if (yr >= 15 && yr <= 30) {
            batchSet.add(`20${match[1]}`);
          }
        }
      }
    });
    return Array.from(batchSet).sort().reverse();
  }, [allUsers]);

  // Extract all unique courses
  const allAvailableCourses = React.useMemo(() => {
    const courseSet = new Set();
    Object.values(userCourses).forEach((val) => {
      if (val && val !== "-") {
        val.split(",").forEach((c) => courseSet.add(c.trim()));
      }
    });
    return Array.from(courseSet).sort();
  }, [userCourses]);

  // Multi-field live filtering & sorting
  const filteredUsers = React.useMemo(() => {
    let list = allUsers;

    // 1. Role filter via Tab
    if (tabValue === 1) {
      list = list.filter((u) => u.role === "teacher");
    } else if (tabValue === 2) {
      list = list.filter((u) => u.role === "student");
    }

    // 2. Search query (supports Name, Email, Roll Number, Course)
    const q = (localSearch || globalSearchTerm || "").trim().toLowerCase();
    if (q) {
      list = list.filter((u) => {
        const nameMatch = u.name?.toLowerCase().includes(q);
        const emailMatch = u.email?.toLowerCase().includes(q);
        const rollMatch = u.email?.split("@")[0]?.toLowerCase().includes(q);
        const courseMatch = userCourses[u._id]?.toLowerCase().includes(q);
        return nameMatch || emailMatch || rollMatch || courseMatch;
      });
    }

    // 3. Batch year filter
    if (selectedBatch && selectedBatch !== "All") {
      const prefix = selectedBatch.slice(-2);
      list = list.filter((u) => u.email?.startsWith(prefix));
    }

    // 4. Course filter
    if (selectedCourse && selectedCourse !== "All") {
      list = list.filter((u) => {
        const c = userCourses[u._id];
        return c && c.toLowerCase().includes(selectedCourse.toLowerCase());
      });
    }

    // 5. Sorting
    list = [...list].sort((a, b) => {
      const valA = (a[sortField] || "").toString().toLowerCase();
      const valB = (b[sortField] || "").toString().toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [
    allUsers,
    tabValue,
    localSearch,
    globalSearchTerm,
    selectedBatch,
    selectedCourse,
    userCourses,
    sortField,
    sortOrder,
  ]);

  // Paginated slice
  const paginatedUsers = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  // Fetch course info for visible users
  React.useEffect(() => {
    if (paginatedUsers.length > 0) {
      fetchCoursesForUsers(paginatedUsers);
    }
  }, [paginatedUsers]);

  // Reset page to 0 on any filter/search change
  React.useEffect(() => {
    setPage(0);
  }, [localSearch, globalSearchTerm, selectedBatch, selectedCourse, tabValue]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Export currently filtered list to CSV
  const handleExportCSV = () => {
    if (!filteredUsers.length) return;
    const headers = ["Name", "Email", "Roll Number", "Role", "Enrolled Courses"];
    const rows = filteredUsers.map((u) => {
      const rollNo = u.email ? u.email.split("@")[0] : "";
      const courses = (userCourses[u._id] || "-").replace(/"/g, '""');
      return `"${u.name || ""}", "${u.email || ""}", "${rollNo}", "${u.role || ""}", "${courses}"`;
    });
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `gkv_users_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    setSelectedBatch("All");
    setSelectedCourse("All");
    setTabValue(0);
  };

  const updateUserHandler = async () => {
    setShowModal(false);
    try {
      const res = await Axios.put(`/user/detail`, {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      setIsError(false);
      setShowAlert(true);
      setAlertMessage(res.data.message || "User updated successfully");
      fetchAllUsers();
    } catch (err) {
      setIsError(true);
      setShowAlert(true);
      setAlertMessage(err.response?.data?.message || "Update failed");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const hasActiveFilters =
    localSearch || selectedBatch !== "All" || selectedCourse !== "All" || tabValue !== 0;

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 1.5, sm: 3 }, mb: 4, px: { xs: 0.5, sm: 2 } }}>
      {/* 4 Interactive Executive KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ModernStatCard
            title="Total Enrolled"
            count={stats.total}
            icon={<GroupIcon />}
            subtitle="All verified users"
            isActive={tabValue === 0}
            onClick={() => setTabValue(0)}
            color="#0D7D70"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernStatCard
            title="Faculty / Teachers"
            count={stats.teachers}
            icon={<PersonIcon />}
            subtitle="Click to filter"
            isActive={tabValue === 1}
            onClick={() => setTabValue(1)}
            color="#08564D"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernStatCard
            title="Students"
            count={stats.students}
            icon={<SchoolIcon />}
            subtitle="Click to filter"
            isActive={tabValue === 2}
            onClick={() => setTabValue(2)}
            color="#14B8A6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernStatCard
            title="Active Subjects"
            count={allAvailableCourses.length || 18}
            icon={<MenuBookIcon />}
            subtitle="Course offerings"
            isActive={false}
            color="#0D7D70"
          />
        </Grid>
      </Grid>

      <GlassCard>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={showAlert}
          autoHideDuration={3000}
          onClose={() => setShowAlert(false)}
        >
          <Alert
            onClose={() => setShowAlert(false)}
            severity={isError ? "error" : "success"}
            sx={{ width: "100%" }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>

        {/* Top Control Bar: Role Tabs + CSV Export */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            borderBottom: "1px solid rgba(13, 125, 112, 0.12)",
            pb: 1.5,
            mb: 2,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: "0.9rem",
                textTransform: "none",
                minWidth: "auto",
                px: 2,
              },
            }}
          >
            <Tab label={`All Users (${stats.total})`} />
            <Tab label={`Teachers (${stats.teachers})`} />
            <Tab label={`Students (${stats.students})`} />
          </Tabs>

          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            sx={{
              borderColor: "rgba(13, 125, 112, 0.3)",
              color: "#0D7D70",
              fontWeight: 600,
              borderRadius: "20px",
              px: 2,
              "&:hover": {
                borderColor: "#0D7D70",
                backgroundColor: "rgba(13, 125, 112, 0.05)",
              },
            }}
          >
            Export CSV ({filteredUsers.length})
          </Button>
        </Box>

        {/* In-Panel Smart Search & Quick Filter Center */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            gap: 1.5,
            mb: 2,
          }}
        >
          {/* Prominent Live Search Input */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search by student name, email, roll no (e.g. 216301...), or course..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#0D7D70" }} />
                </InputAdornment>
              ),
              endAdornment: localSearch && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setLocalSearch("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              flex: { xs: "1 1 auto", md: "2 1 auto" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
              },
            }}
          />

          {/* Batch Year Dropdown */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="batch-select-label">Batch / Year</InputLabel>
            <Select
              labelId="batch-select-label"
              value={selectedBatch}
              label="Batch / Year"
              onChange={(e) => setSelectedBatch(e.target.value)}
              sx={{ borderRadius: "12px", backgroundColor: "#FFFFFF" }}
            >
              <MenuItem value="All">All Batches</MenuItem>
              {detectedBatches.map((batch) => (
                <MenuItem key={batch} value={batch}>
                  Batch {batch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Subject / Course Filter Dropdown */}
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel id="course-select-label">Course Filter</InputLabel>
            <Select
              labelId="course-select-label"
              value={selectedCourse}
              label="Course Filter"
              onChange={(e) => setSelectedCourse(e.target.value)}
              sx={{ borderRadius: "12px", backgroundColor: "#FFFFFF" }}
            >
              <MenuItem value="All">All Courses</MenuItem>
              {allAvailableCourses.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Tooltip title="Reset all filters">
              <Button
                variant="text"
                size="small"
                onClick={handleClearFilters}
                startIcon={<FilterAltOffIcon />}
                sx={{ color: "#64748B", textTransform: "none", whiteSpace: "nowrap" }}
              >
                Reset
              </Button>
            </Tooltip>
          )}
        </Box>

        {/* Live Filter Indicator Chips */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem" }}>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{allUsers.length}</strong> users
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {selectedBatch !== "All" && (
              <Chip
                label={`Batch: ${selectedBatch}`}
                size="small"
                onDelete={() => setSelectedBatch("All")}
                sx={{ backgroundColor: "rgba(13, 125, 112, 0.1)", color: "#0D7D70" }}
              />
            )}
            {selectedCourse !== "All" && (
              <Chip
                label={`Course: ${selectedCourse}`}
                size="small"
                onDelete={() => setSelectedCourse("All")}
                sx={{ backgroundColor: "rgba(13, 125, 112, 0.1)", color: "#0D7D70" }}
              />
            )}
            {localSearch && (
              <Chip
                label={`Query: "${localSearch}"`}
                size="small"
                onDelete={() => setLocalSearch("")}
                sx={{ backgroundColor: "rgba(13, 125, 112, 0.1)", color: "#0D7D70" }}
              />
            )}
          </Box>
        </Box>

        {showModal && (
          <EditUserModal
            open={showModal}
            setOpen={setShowModal}
            onSuccess={updateUserHandler}
            user={user}
            setUser={setUser}
            title="Update User"
            label="Name"
            label1="Email Address"
            successButton="Update"
            content="Change Any Field to Update User Details"
          />
        )}

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress sx={{ color: "#0D7D70" }} />
          </Box>
        ) : !filteredUsers.length ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 6 }}>
            <Typography variant="h6" sx={{ color: "#0F172A", mb: 1 }}>
              No matching users found
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
              Try adjusting your search keywords or clearing active filters.
            </Typography>
            <Button variant="outlined" size="small" onClick={handleClearFilters}>
              Clear All Filters
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: "62vh" }}>
              <Table stickyHeader aria-label="user directory table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>
                      <TableSortLabel
                        active={sortField === "name"}
                        direction={sortField === "name" ? sortOrder : "asc"}
                        onClick={() => handleSort("name")}
                      >
                        User Name
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      <TableSortLabel
                        active={sortField === "email"}
                        direction={sortField === "email" ? sortOrder : "asc"}
                        onClick={() => handleSort("email")}
                      >
                        Email / Roll No
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell align="center">Role</StyledTableCell>
                    <StyledTableCell align="left">Subject / Course</StyledTableCell>
                    <StyledTableCell align="center">Edit</StyledTableCell>
                    <StyledTableCell align="center">Details</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((row) => {
                    const courses = userCourses[row._id];
                    return (
                      <StyledTableRow key={row._id}>
                        {/* User Name with Avatar */}
                        <StyledTableCell component="th" scope="row">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 34,
                                height: 34,
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                backgroundColor:
                                  row.role === "admin"
                                    ? "#0D7D70"
                                    : row.role === "teacher"
                                    ? "#08564D"
                                    : "rgba(13, 125, 112, 0.15)",
                                color:
                                  row.role === "student" ? "#0D7D70" : "#FFFFFF",
                              }}
                            >
                              {getInitials(row.name)}
                            </Avatar>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#0F172A" }}
                            >
                              {row.name}
                            </Typography>
                          </Box>
                        </StyledTableCell>

                        {/* Email with 1-click Copy */}
                        <StyledTableCell align="left">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography variant="body2" sx={{ color: "#334155" }}>
                              {row.email}
                            </Typography>
                            <Tooltip
                              title={
                                copiedEmail === row.email ? "Copied!" : "Copy Email"
                              }
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleCopyEmail(row.email)}
                                sx={{ p: 0.5, color: "#64748B" }}
                              >
                                <ContentCopyIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </StyledTableCell>

                        {/* Role Chip */}
                        <StyledTableCell align="center">
                          <Chip
                            label={row.role ? row.role.toUpperCase() : "STUDENT"}
                            size="small"
                            sx={{
                              fontSize: "0.725rem",
                              fontWeight: 700,
                              borderRadius: "8px",
                              backgroundColor:
                                row.role === "admin"
                                  ? "rgba(13, 125, 112, 0.15)"
                                  : row.role === "teacher"
                                  ? "rgba(14, 116, 144, 0.12)"
                                  : "rgba(16, 185, 129, 0.12)",
                              color:
                                row.role === "admin"
                                  ? "#0D7D70"
                                  : row.role === "teacher"
                                  ? "#0E7490"
                                  : "#0D7D70",
                            }}
                          />
                        </StyledTableCell>

                        {/* Assigned Course Chips (Clickable to filter!) */}
                        <StyledTableCell align="left">
                          {courses ? (
                            courses === "-" ? (
                              <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                -
                              </Typography>
                            ) : (
                              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", maxWidth: 280 }}>
                                {courses.split(",").map((cName, idx) => {
                                  const trimmed = cName.trim();
                                  return (
                                    <Tooltip key={idx} title="Click to filter by this course">
                                      <Chip
                                        label={trimmed}
                                        size="small"
                                        onClick={() => setSelectedCourse(trimmed)}
                                        sx={{
                                          fontSize: "0.725rem",
                                          cursor: "pointer",
                                          backgroundColor:
                                            selectedCourse === trimmed
                                              ? "#0D7D70"
                                              : "rgba(15, 23, 42, 0.05)",
                                          color:
                                            selectedCourse === trimmed
                                              ? "#FFFFFF"
                                              : "#334155",
                                          "&:hover": {
                                            backgroundColor: "rgba(13, 125, 112, 0.15)",
                                            color: "#0D7D70",
                                          },
                                        }}
                                      />
                                    </Tooltip>
                                  );
                                })}
                              </Box>
                            )
                          ) : row.role === "teacher" || row.role === "student" ? (
                            <CircularProgress size={16} sx={{ color: "#0D7D70" }} />
                          ) : (
                            "-"
                          )}
                        </StyledTableCell>

                        {/* Edit Action */}
                        <StyledTableCell align="center">
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setUser(row);
                                setShowModal(true);
                              }}
                              sx={{
                                color: "#0D7D70",
                                backgroundColor: "rgba(13, 125, 112, 0.06)",
                                "&:hover": {
                                  backgroundColor: "rgba(13, 125, 112, 0.14)",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </StyledTableCell>

                        {/* Details Action */}
                        <StyledTableCell align="center">
                          <Tooltip title="View User Courses & Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                navigate(`/courses`, {
                                  state: { userId: row._id, role: row.role },
                                });
                              }}
                              sx={{
                                color: "#475569",
                                backgroundColor: "rgba(15, 23, 42, 0.04)",
                                "&:hover": {
                                  backgroundColor: "rgba(13, 125, 112, 0.14)",
                                  color: "#0D7D70",
                                },
                              }}
                            >
                              <ArrowForwardIosIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <TablePagination
              rowsPerPageOptions={[15, 25, 50, 100]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(+e.target.value);
                setPage(0);
              }}
            />
          </>
        )}
      </GlassCard>
    </Container>
  );
}
