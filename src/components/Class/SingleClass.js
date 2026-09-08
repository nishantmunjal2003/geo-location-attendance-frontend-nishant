import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import useAxios from "../../api";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Fab,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ReplayIcon from "@mui/icons-material/Replay";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleIcon from "@mui/icons-material/People";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RemoveDoneIcon from "@mui/icons-material/RemoveDone";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Switch from "@mui/material/Switch";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useParams, useNavigate } from "react-router-dom";
import GlassCard from "../UI/GlassCard";
import AlertModal from "../Modal/AlertModal";

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "rgba(13, 125, 112, 0.08)",
    color: "#0F172A",
    fontWeight: 700,
    fontSize: 14,
    borderBottom: "2px solid rgba(13, 125, 112, 0.16)",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: "#0F172A",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "background-color 0.15s ease",
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(13, 125, 112, 0.02)",
  },
  "&:hover": {
    backgroundColor: "rgba(13, 125, 112, 0.06)",
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const SingleCourse = () => {
  const Axios = useAxios();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { classId } = useParams();

  const [students, setStudents] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState(null);
  const [isError, setIsError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  // Search, Filter & Sort state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all"); // "all" | "present" | "absent"
  const [orderBy, setOrderBy] = React.useState("default"); // "default" | "name" | "registrationNo" | "present"
  const [order, setOrder] = React.useState("asc"); // "asc" | "desc"

  const deleteClassHandler = async () => {
    setShowDeleteModal(false);
    try {
      await Axios({
        method: "delete",
        url: `/class/${classId}`,
      });
      navigate(-1);
    } catch (err) {
      setIsError(true);
      setShowAlert(true);
      setAlertMessage(err.response?.data?.message || "Failed to delete class");
    }
  };

  const getClass = async () => {
    try {
      const res = await Axios({ url: "/class/students", params: { classId } });
      setStudents(res.data.data || []);
    } catch (err) {
      setIsError(true);
      setShowAlert(true);
      setAlertMessage(err.response?.data?.message || "Failed to load class students");
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  };

  const updateClassHandler = async (_id, present) => {
    // Optimistically update local state for immediate UI feedback
    setStudents((prev) =>
      prev.map((student) =>
        student._id === _id ? { ...student, present } : student
      )
    );

    try {
      const res = await Axios({
        method: "put",
        url: `/class/${classId}`,
        data: { students: [{ _id, present }] },
      });
      setIsError(false);
      setShowAlert(true);
      setAlertMessage(res.data.message || "Attendance updated");
    } catch (err) {
      // Revert optimistic update on failure
      setStudents((prev) =>
        prev.map((student) =>
          student._id === _id ? { ...student, present: !present } : student
        )
      );
      setIsError(true);
      setShowAlert(true);
      setAlertMessage(err.response?.data?.message || "Failed to update attendance");
    }
  };

  const handleBulkUpdate = async (present) => {
    const targetStudents = filteredStudents;
    if (!targetStudents.length) return;

    setIsBulkUpdating(true);
    const targetIds = new Set(targetStudents.map((s) => s._id));

    // Optimistically update state
    setStudents((prev) =>
      prev.map((s) => (targetIds.has(s._id) ? { ...s, present } : s))
    );

    try {
      const payload = targetStudents.map((s) => ({ _id: s._id, present }));
      const res = await Axios({
        method: "put",
        url: `/class/${classId}`,
        data: { students: payload },
      });
      setIsError(false);
      setShowAlert(true);
      setAlertMessage(
        res.data.message ||
          `Marked ${targetStudents.length} student${targetStudents.length === 1 ? "" : "s"} as ${
            present ? "Present" : "Absent"
          }`
      );
    } catch (err) {
      // Re-fetch accurate state on failure
      getClass();
      setIsError(true);
      setShowAlert(true);
      setAlertMessage(err.response?.data?.message || "Failed to bulk update attendance");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  React.useEffect(() => {
    getClass();
  }, []);

  // Compute statistics
  const totalCount = students.length;
  const presentCount = students.filter((s) => Boolean(s.present)).length;
  const absentCount = totalCount - presentCount;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Handle Sort Request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Filter and Sort Students
  const filteredStudents = React.useMemo(() => {
    let result = [...students];

    // 1. Search filter (by name or registration number)
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.trim().toLowerCase();
      result = result.filter(
        (student) =>
          student.name?.toLowerCase().includes(lowerSearch) ||
          student.registrationNo?.toString().toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Attendance status filter
    if (statusFilter === "present") {
      result = result.filter((student) => Boolean(student.present));
    } else if (statusFilter === "absent") {
      result = result.filter((student) => !Boolean(student.present));
    }

    // 3. Sorting
    if (orderBy !== "default") {
      result.sort((a, b) => {
        let valueA = a[orderBy];
        let valueB = b[orderBy];

        if (orderBy === "name") {
          valueA = (valueA || "").toLowerCase();
          valueB = (valueB || "").toLowerCase();
          return order === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        if (orderBy === "registrationNo") {
          const numA = Number(valueA) || 0;
          const numB = Number(valueB) || 0;
          if (numA && numB) {
            return order === "asc" ? numA - numB : numB - numA;
          }
          return order === "asc"
            ? String(valueA).localeCompare(String(valueB))
            : String(valueB).localeCompare(String(valueA));
        }

        if (orderBy === "present") {
          const boolA = Boolean(valueA) ? 1 : 0;
          const boolB = Boolean(valueB) ? 1 : 0;
          return order === "asc" ? boolA - boolB : boolB - boolA;
        }

        return 0;
      });
    }

    return result;
  }, [students, searchTerm, statusFilter, orderBy, order]);

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all" || orderBy !== "default";

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setOrderBy("default");
    setOrder("asc");
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "80vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ width: "100%", pb: 8 }}>
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

      {showDeleteModal && (
        <AlertModal
          open={showDeleteModal}
          setOpen={setShowDeleteModal}
          title="Delete Class Session"
          content="Are you sure you want to permanently delete this class session? All student attendance data recorded for this date will be permanently deleted. This action cannot be undone."
          successButton="Delete Class"
          onSuccess={deleteClassHandler}
        />
      )}

      {/* Top Header Card with Back Button, Title & Attendance Stats */}
      <GlassCard sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Title & Navigation */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Tooltip title="Go Back">
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.08)" },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                Class Attendance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review and update student attendance status
              </Typography>
            </Box>
          </Box>

          {/* Quick Stats Badges */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Chip
              icon={<PeopleIcon sx={{ color: "#0D7D70 !important" }} />}
              label={`Total: ${totalCount}`}
              sx={{
                fontWeight: 600,
                bgcolor: "rgba(13, 125, 112, 0.08)",
                color: "#0D7D70",
                border: "1px solid rgba(13, 125, 112, 0.2)",
              }}
            />
            <Chip
              icon={<CheckCircleIcon sx={{ color: "#2e7d32 !important" }} />}
              label={`Present: ${presentCount} (${attendanceRate}%)`}
              sx={{
                bgcolor: "rgba(46, 125, 50, 0.12)",
                color: "#1b5e20",
                fontWeight: 600,
                border: "1px solid rgba(46, 125, 50, 0.25)",
              }}
            />
            <Chip
              icon={<CancelIcon sx={{ color: "#d32f2f !important" }} />}
              label={`Absent: ${absentCount}`}
              sx={{
                bgcolor: "rgba(211, 47, 47, 0.1)",
                color: "#c62828",
                fontWeight: 600,
                border: "1px solid rgba(211, 47, 47, 0.2)",
              }}
            />
          </Box>
        </Box>
      </GlassCard>

      {/* Search & Filter Toolbar */}
      <GlassCard sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search by student name or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flexGrow: 1,
                maxWidth: { md: 460 },
                "& .MuiOutlinedInput-root": {
                  bgcolor: "white",
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <Tooltip title="Clear search">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                        edge="end"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : null,
              }}
            />

            {/* Attendance Filter Toggle Buttons */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <ToggleButtonGroup
                value={statusFilter}
                exclusive
                fullWidth={isMobile}
                onChange={(e, nextFilter) => {
                  if (nextFilter !== null) {
                    setStatusFilter(nextFilter);
                  }
                }}
                size="small"
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  "& .MuiToggleButton-root": {
                    px: { xs: 1.5, sm: 2 },
                    py: 0.75,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="all">
                  All ({totalCount})
                </ToggleButton>
                <ToggleButton value="present">
                  Present ({presentCount})
                </ToggleButton>
                <ToggleButton value="absent">
                  Absent ({absentCount})
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <Tooltip title="Reset all filters">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={handleResetFilters}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      bgcolor: "white",
                    }}
                  >
                    Reset
                  </Button>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Secondary bar: Active counts & Bulk Actions */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 1.5,
              pt: 0.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{filteredStudents.length}</strong> of{" "}
              <strong>{totalCount}</strong> students
              {searchTerm && ` for "${searchTerm}"`}
              {statusFilter !== "all" && ` (${statusFilter})`}
            </Typography>

            {/* Bulk Mark Options */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="outlined"
                color="success"
                disabled={isBulkUpdating || filteredStudents.length === 0}
                startIcon={<DoneAllIcon />}
                onClick={() => handleBulkUpdate(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: 1.5,
                }}
              >
                Mark {hasActiveFilters ? "Filtered" : "All"} Present
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={isBulkUpdating || filteredStudents.length === 0}
                startIcon={<RemoveDoneIcon />}
                onClick={() => handleBulkUpdate(false)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: 1.5,
                }}
              >
                Mark {hasActiveFilters ? "Filtered" : "All"} Absent
              </Button>
            </Box>
          </Box>
        </Stack>
      </GlassCard>

      {/* Students Attendance Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2.5,
          overflow: "hidden",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Table sx={{ minWidth: 320 }} aria-label="student attendance table">
          <TableHead>
            <TableRow>
              <StyledTableCell width={70}>S.No.</StyledTableCell>
              <StyledTableCell>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleRequestSort("name")}
                >
                  Student Name
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell align="right">
                <TableSortLabel
                  active={orderBy === "registrationNo"}
                  direction={orderBy === "registrationNo" ? order : "asc"}
                  onClick={() => handleRequestSort("registrationNo")}
                >
                  Registration Number
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell align="right">
                <TableSortLabel
                  active={orderBy === "present"}
                  direction={orderBy === "present" ? order : "asc"}
                  onClick={() => handleRequestSort("present")}
                >
                  Attendance
                </TableSortLabel>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((row, index) => (
                <StyledTableRow key={row._id}>
                  <StyledTableCell width={70} component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                      {index + 1}.
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                      {row.name}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Typography variant="body2" sx={{ fontFamily: "monospace", letterSpacing: 0.5 }}>
                      {row.registrationNo}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Chip
                        size="small"
                        label={row.present ? "Present" : "Absent"}
                        color={row.present ? "success" : "default"}
                        variant={row.present ? "filled" : "outlined"}
                        sx={{
                          minWidth: 68,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          border: row.present ? "none" : "1px solid rgba(0, 0, 0, 0.15)",
                          color: row.present ? "#ffffff" : "text.secondary",
                          bgcolor: row.present ? "#2e7d32" : "transparent",
                        }}
                      />
                      <IOSSwitch
                        checked={Boolean(row.present)}
                        onChange={(e) => updateClassHandler(row._id, e.target.checked)}
                        inputProps={{
                          "aria-label": `Mark attendance for ${row.name}`,
                        }}
                      />
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <SearchOffIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                    <Typography variant="h6" color="text.secondary">
                      No students found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                      {searchTerm
                        ? `No students matching "${searchTerm}" with the current filter.`
                        : `No students marked as ${statusFilter} in this class.`}
                    </Typography>
                    {hasActiveFilters && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleResetFilters}
                        startIcon={<RestartAltIcon />}
                        sx={{ mt: 1, textTransform: "none" }}
                      >
                        Reset Search & Filters
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Danger Zone: Delete Class (Guarded and not easily reachable) */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 2.5,
          borderRadius: 3,
          border: "1px solid rgba(239, 68, 68, 0.25)",
          backgroundColor: "rgba(254, 242, 242, 0.6)",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#991B1B" }}>
            Danger Zone
          </Typography>
          <Typography variant="body2" sx={{ color: "#7F1D1D", fontSize: "0.825rem" }}>
            Permanently delete this class session and all its recorded student attendance data. This action cannot be undone.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteForeverIcon />}
          onClick={() => setShowDeleteModal(true)}
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.825rem",
            borderColor: "rgba(239, 68, 68, 0.4)",
            color: "#DC2626",
            whiteSpace: "nowrap",
            "&:hover": {
              borderColor: "#DC2626",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
            },
          }}
        >
          Delete This Class
        </Button>
      </Paper>

      {/* Floating Refresh Action Button */}
      <Box sx={{ position: "fixed", right: { xs: "20px", sm: "40px" }, bottom: { xs: "80px", sm: "40px" }, zIndex: 10 }}>
        <Tooltip title="Refresh student attendance">
          <Fab
            onClick={() => {
              getClass();
              setIsLoaded(false);
            }}
            color="primary"
            aria-label="refresh"
          >
            {isLoaded ? (
              <ReplayIcon />
            ) : (
              <CircularProgress size={28} style={{ color: "#fff" }} />
            )}
          </Fab>
        </Tooltip>
      </Box>
    </Stack>
  );
};

export default SingleCourse;
