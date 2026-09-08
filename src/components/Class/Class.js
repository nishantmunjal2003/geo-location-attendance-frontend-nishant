import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssessmentIcon from "@mui/icons-material/Assessment";
import useAxios from "../../api";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

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
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "background-color 0.15s ease",
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(13, 125, 112, 0.02)",
  },
  "&:hover": {
    backgroundColor: "rgba(13, 125, 112, 0.05)",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const Class = () => {
  const Axios = useAxios();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [classes, setClasses] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState(null);
  const [isError, setIsError] = React.useState(false);

  const getClasses = async () => {
    try {
      const res = await Axios({ url: "/class", params: { courseId } });
      setClasses(res.data.data || []);
    } catch (err) {
      setIsError(true);
      setShowAlert(true);
      setAlertMessage(err.response?.data?.message || "Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    getClasses();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "90vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#0D7D70" }} />
      </Box>
    );
  }

  return (
    <Stack sx={{ width: "100%" }} spacing={2.5}>
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

      {/* Top Header with Back Navigation */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(13, 125, 112, 0.14)",
          borderTop: "4px solid #0D7D70",
          boxShadow: "0px 6px 20px rgba(15, 23, 42, 0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="Go Back">
            <IconButton
              onClick={() => navigate(-1)}
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
              Class Attendance Sessions
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Select a class session below to view and update student records
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Chip
            icon={<EventNoteIcon sx={{ color: "#0D7D70 !important" }} />}
            label={`Total Sessions: ${classes.length}`}
            sx={{
              fontWeight: 600,
              backgroundColor: "rgba(13, 125, 112, 0.08)",
              color: "#0D7D70",
              border: "1px solid rgba(13, 125, 112, 0.18)",
            }}
          />
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate(`/classes/${courseId}/report`)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              py: 0.8,
              backgroundColor: "#0D7D70",
              boxShadow: "0 4px 12px rgba(13, 125, 112, 0.22)",
              "&:hover": {
                backgroundColor: "#095c52",
                boxShadow: "0 6px 16px rgba(13, 125, 112, 0.32)",
              },
            }}
          >
            Attendance & Defaulters
          </Button>
        </Box>
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(13, 125, 112, 0.14)",
          boxShadow: "0px 6px 20px rgba(15, 23, 42, 0.04)",
        }}
      >
        <Table sx={{ minWidth: 300 }} aria-label="class sessions table">
          <TableHead>
            <TableRow>
              <StyledTableCell sx={{ fontWeight: 700 }}>
                Created Date
              </StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 700 }}>
                Status
              </StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 700 }}>
                Students
              </StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 700 }}>
                Radius
              </StyledTableCell>
              <StyledTableCell align="right" sx={{ fontWeight: 700 }}>
                Action
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.length > 0 ? (
              classes.map((row) => (
                <StyledTableRow key={row._id}>
                  <StyledTableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {new Date(row.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </StyledTableCell>
                  <StyledTableCell>
                    <Chip
                      label={row.active ? "Active" : "Closed"}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        backgroundColor: row.active
                          ? "rgba(16, 185, 129, 0.12)"
                          : "rgba(100, 116, 139, 0.1)",
                        color: row.active ? "#0D7D70" : "#64748B",
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Chip
                      label={`${row.students.length} Students`}
                      size="small"
                      onClick={() => navigate(`/class/${row._id}`)}
                      sx={{
                        fontWeight: 600,
                        cursor: "pointer",
                        backgroundColor: "rgba(13, 125, 112, 0.08)",
                        color: "#0D7D70",
                        "&:hover": { backgroundColor: "rgba(13, 125, 112, 0.16)" },
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell sx={{ color: "#475569" }}>
                    {row.radius}m
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<ArrowForwardIosIcon sx={{ fontSize: 11 }} />}
                      onClick={() => navigate(`/class/${row._id}`)}
                      sx={{
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "rgba(13, 125, 112, 0.3)",
                        color: "#0D7D70",
                        "&:hover": {
                          borderColor: "#0D7D70",
                          backgroundColor: "rgba(13, 125, 112, 0.05)",
                        },
                      }}
                    >
                      View Class
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No class sessions recorded yet for this course.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default Class;
