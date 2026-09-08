import * as React from "react";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useAxios from "../../api";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Collapse,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AlertModal from "../Modal/AlertModal";
import EditCourseModal from "../Modal/EditCourseModal";

// Styles removed

const CourseCard = ({ course, sendAttendance, navigate, setCourse, setShowEditModal, setShowAlertModal }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(13, 125, 112, 0.14)",
          borderTop: "4px solid #0D7D70", // Subtle fresh sage / forest teal insert
          boxShadow: "0px 6px 20px rgba(15, 23, 42, 0.04)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0px 12px 28px rgba(13, 125, 112, 0.12)",
            borderColor: "rgba(13, 125, 112, 0.35)",
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, cursor: "pointer", pb: 1 }} onClick={() => setExpanded(!expanded)}>
          <Typography variant="h5" component="div" fontWeight="bold" sx={{ color: "#0F172A" }} gutterBottom>
            {course.courseName}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            {expanded ? "Click to hide details" : "Click to view details"}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          <Button
            variant="contained"
            endIcon={<ForwardToInboxIcon />}
            onClick={(e) => {
              e.stopPropagation();
              sendAttendance(course);
            }}
            color="primary"
            size="small"
          >
            Send Attendance
          </Button>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
            sx={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s",
              color: "#0D7D70",
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<CalendarViewMonthIcon />}
                onClick={() => navigate(`/classes/${course._id}`)}
              >
                Class Data
              </Button>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => navigate(`/course/${course._id}`)}
              >
                Students ({course.students.length})
              </Button>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="warning"
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => { setCourse(course); setShowEditModal(true); }}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  startIcon={<DeleteForeverIcon />}
                  onClick={() => { setCourse(course); setShowAlertModal(true); }}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Collapse>
      </Card>
    </Grid>
  );
};

const Course = () => {
  const Axios = useAxios();
  const navigate = useNavigate();
  const [courses, setCourses] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState(null);
  const [isError, setIsError] = React.useState(false);
  const [course, setCourse] = React.useState(null);
  const [showAlertModal, setShowAlertModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);

  const sendAttendance = async (course) => {
    await Axios({
      method: "post",
      url: "/course/attendance",
      params: { courseId: course._id },
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
  };

  const deleteCourseHandler = async () => {
    setShowAlertModal(false);
    await Axios({
      method: "delete",
      url: `/course/${course._id}`,
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
    getCourses();
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
    getCourses();
  };
  const getCourses = async () => {
    await Axios("/course")
      .then((res) => {
        setCourses(res.data.data);
      })
      .catch((err) => {
        setIsError(true);
        setShowAlert(true);
        setAlertMessage(err.response.data.message);
      });
    setIsLoading(false);
  };
  React.useEffect(() => {
    getCourses();
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
          title="Delete Course"
          content="Are you sure you want to delete this Course?"
          successButton="Delete"
          onSuccess={deleteCourseHandler}
        />
      )}
      {showEditModal && (
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
      <Grid container spacing={3} sx={{ padding: 2 }}>
        {courses.map((row) => (
          <CourseCard
            key={row._id}
            course={row}
            sendAttendance={sendAttendance}
            navigate={navigate}
            setCourse={setCourse}
            setShowEditModal={setShowEditModal}
            setShowAlertModal={setShowAlertModal}
          />
        ))}
      </Grid>
    </Stack>
  );
};

export default Course;
