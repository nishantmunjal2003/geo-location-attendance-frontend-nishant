import * as React from "react";
import { styled } from "@mui/material/styles";
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
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useParams, useNavigate } from "react-router-dom";
import AlertModal from "../Modal/AlertModal";
import EditCourseModal from "../Modal/EditCourseModal";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "rgba(13, 125, 112, 0.08)",
    color: "#0F172A",
    fontWeight: 700,
    borderBottom: "2px solid rgba(13, 125, 112, 0.16)",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: "#0F172A",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const SingleCourse = () => {
  const Axios = useAxios();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [students, setStudents] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [course, setCourse] = React.useState(null);

  const filteredStudents = React.useMemo(() => {
    if (!searchTerm.trim()) return students;
    const lower = searchTerm.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(lower) ||
        s.registrationNo?.toString().toLowerCase().includes(lower)
    );
  }, [students, searchTerm]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState(null);
  const [isError, setIsError] = React.useState(false);
  const [studentId, setStudentId] = React.useState(null);
  const [showAlertModal, setShowAlertModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const hiddenFileInput = React.useRef(null);

  const fileChangeHandler = async (event) => {
    const fileUploaded = event.target.files[0];
    const fileExt = fileUploaded.name.split(".").pop();
    if (fileExt !== "csv" && fileExt !== "xlsx") {
      setIsError(true);
      setShowAlert(true);
      setAlertMessage("Only csv and xlsx format are allow");
      return;
    }
    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("emails", fileUploaded);
    await Axios({
      method: "post",
      url: "/course/invite",
      data: formData,
    })
      .then((res) => {
        setIsError(false);
        setShowAlert(true);
        setAlertMessage(res.data.message);
      })
      .catch((err) => {
        setIsError(true);
        setShowAlert(true);
        setAlertMessage(err.response.data.message);
      });
    getCourse();
  };

  const getCourse = async () => {
    await Axios({ url: `/course/${courseId}` })
      .then((res) => {
        setStudents(res.data.data.students);
        setCourse(res.data.data);
      })
      .catch((err) => {
        setIsError(true);
        setShowAlert(true);
        setAlertMessage(err.response.data.message);
      });
    setIsLoading(false);
  };

  const deleteCourseHandler = async () => {
    setShowDeleteModal(false);
    await Axios({
      method: "delete",
      url: `/course/${course._id}`,
    })
      .then((res) => {
        setIsError(false);
        setShowAlert(true);
        setAlertMessage(res.data.message);
        navigate("/");
      })
      .catch((err) => {
        setIsError(true);
        setShowAlert(true);
        setAlertMessage(err.response.data.message);
      });
  };

  const editCourseHandler = async () => {
    setShowEditModal(false);
    await Axios({
      method: "put",
      url: `/course/${course._id}`,
      data: {
        toggle: course.isActive,
        courseName: course.courseName,
      },
    })
      .then((res) => {
        setIsError(false);
        setShowAlert(true);
        setAlertMessage(res.data.message);
      })
      .catch((err) => {
        setIsError(true);
        setShowAlert(true);
        setAlertMessage(err.response.data.message);
      });
    getCourse();
  };

  const removeStudentHandler = async () => {
    setShowAlertModal(false);
    await Axios({
      method: "put",
      url: `/course/${courseId}`,
      data: { students: [studentId] },
    })
      .then((res) => {
        setIsError(false);
        setShowAlert(true);
        setAlertMessage(res.data.message);
      })
      .catch((err) => {
        setIsError(true);
        setShowAlert(true);
        setAlertMessage(err.response.data.message);
      });
    getCourse();
  };

  React.useEffect(() => {
    getCourse();
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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack sx={{ width: "100%" }}>
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
      {showAlertModal && (
        <AlertModal
          open={showAlertModal}
          setOpen={setShowAlertModal}
          title="Remove Student"
          content="Are you sure you want to remove this Student?"
          successButton="Remove"
          onSuccess={removeStudentHandler}
        />
      )}
      {showDeleteModal && (
        <AlertModal
          open={showDeleteModal}
          setOpen={setShowDeleteModal}
          title="Delete Course"
          content="Are you sure you want to delete this Course? This action cannot be undone."
          successButton="Delete"
          onSuccess={deleteCourseHandler}
        />
      )}
      {showEditModal && course && (
        <EditCourseModal
          open={showEditModal}
          setOpen={setShowEditModal}
          onSuccess={editCourseHandler}
          course={course}
          setCourse={setCourse}
          title="Update Course"
          label="Name"
          label1="Course Active"
          successButton="Update"
          content="Change Any Field to Update Course Details"
        />
      )}
      <Paper
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
          gap: { xs: 2, md: 0 },
          borderRadius: 3,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(13, 125, 112, 0.14)",
          borderTop: "4px solid #0D7D70",
          boxShadow: "0px 6px 20px rgba(15, 23, 42, 0.04)",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "center", md: "flex-start" }, gap: 1 }}>
          <Typography
            variant="h4"
            sx={{
              color: "#0F172A",
              fontWeight: "bold",
              textAlign: { xs: "center", md: "left" },
            }}
          >
            {course?.courseName}
          </Typography>
          {course && (
            <Chip
              label={course.isActive ? "Active" : "Deactivated"}
              color={course.isActive ? "success" : "default"}
              sx={{ fontWeight: 600 }}
              size="small"
            />
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'nowrap',
            justifyContent: { xs: 'center', md: 'flex-end' },
            width: { xs: '100%', md: 'auto' },
            overflowX: 'auto',
            pb: 1
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate(`/classes/${courseId}/report`)}
            sx={{
              whiteSpace: 'nowrap',
              minWidth: 'auto',
              backgroundColor: "#0D7D70",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#095c52" }
            }}
          >
            Attendance Report
          </Button>
          <Button
            variant="contained"
            color="warning"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setShowEditModal(true)}
            sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteForeverIcon />}
            onClick={() => setShowDeleteModal(true)}
            sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
          >
            Delete
          </Button>
        </Box>
      </Paper>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search students by name or registration number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            minWidth: { xs: "100%", sm: 360 },
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
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ) : null,
          }}
        />
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
          Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Table sx={{ minWidth: 300 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell sx={{ fontWeight: 700 }}>
                Student Name
              </StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 700 }} align="right">
                Registration Number
              </StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 700 }} align="right">
                Remove Student
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((row) => (
                <StyledTableRow key={row._id}>
                  <StyledTableCell component="th" scope="row">
                    {row.name}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.registrationNo}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Button
                      onClick={() => {
                        setStudentId(row._id);
                        setShowAlertModal(true);
                      }}
                    >
                      <PersonRemoveIcon />
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm
                      ? `No students found matching "${searchTerm}"`
                      : "No students enrolled in this course"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Semester Bulk Student Enrollment via CSV (Used once every 6 months) */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 2.5,
          borderRadius: 3,
          backgroundColor: "#FFFFFF",
          border: "1px dashed rgba(13, 125, 112, 0.3)",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "rgba(13, 125, 112, 0.08)",
              color: "#0D7D70",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UploadFileIcon />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A" }}>
              Semester Bulk Student Enrollment (CSV / Excel)
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>
              Upload student roster once per semester (6 months) to bulk invite students into this course.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            href="/users.xlsx"
            download="users.xlsx"
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            sx={{
              borderColor: "rgba(13, 125, 112, 0.3)",
              color: "#0D7D70",
              textTransform: "none",
              fontSize: "0.825rem",
              borderRadius: "20px",
              "&:hover": {
                borderColor: "#0D7D70",
                backgroundColor: "rgba(13, 125, 112, 0.05)",
              },
            }}
          >
            Sample Template (.xlsx)
          </Button>
          <input
            ref={hiddenFileInput}
            onChange={fileChangeHandler}
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            style={{ display: "none" }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<UploadFileIcon />}
            onClick={() => hiddenFileInput.current.click()}
            sx={{
              backgroundColor: "#0D7D70",
              borderRadius: "20px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.825rem",
              "&:hover": { backgroundColor: "#08564D" },
            }}
          >
            Upload Student CSV
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
};

export default SingleCourse;
