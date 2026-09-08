import * as React from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CloseIcon from "@mui/icons-material/Close";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
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
  Chip,
} from "@mui/material";
import Modal from "../Modal/Modal";

// Styles removed

const CourseCard = ({
  course,
  endClassHandler,
  openStartClassModalHandler,
  navigate,
  sendAttendance
}) => {
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Typography variant="h5" component="div" fontWeight="bold" sx={{ color: "#0F172A" }} gutterBottom>
              {course.courseName}
            </Typography>
            {course.activeClass && (
              <Chip
                label="Class Active"
                size="small"
                sx={{
                  bgcolor: "rgba(13, 125, 112, 0.1)",
                  color: "#0D7D70",
                  fontWeight: 600,
                  border: "1px solid rgba(13, 125, 112, 0.25)",
                }}
              />
            )}
          </Box>
          <Typography variant="subtitle1" sx={{ color: "#475569", fontWeight: 500 }}>
            Code: <strong>{course.courseCode}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B", mt: 1 }}>
            {expanded ? "Click to hide details" : "Click to view details"}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          <Button
            variant={course.activeClass ? "outlined" : "contained"}
            color={course.activeClass ? "error" : "primary"}
            startIcon={course.activeClass ? <CloseIcon /> : <AddCircleIcon />}
            onClick={(e) => {
              e.stopPropagation();
              course.activeClass
                ? endClassHandler(course)
                : openStartClassModalHandler(course._id, course.radius);
            }}
          >
            {course.activeClass ? "End Class" : "Start Class"}
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "#F0FDF4",
                  border: "1px solid rgba(13, 125, 112, 0.12)",
                }}
              >
                <Typography variant="body2" sx={{ color: "#0F172A" }}>
                  <strong>Students:</strong> {course.students.length}
                </Typography>
                <Typography variant="body2" sx={{ color: "#0F172A" }}>
                  <strong>Radius:</strong> {course.radius}m
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                endIcon={<ForwardToInboxIcon />}
                onClick={() => sendAttendance(course)}
              >
                Send Attendance
              </Button>

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
                startIcon={<SettingsIcon />}
                onClick={() => navigate(`/course/${course._id}`)}
              >
                Settings
              </Button>
            </Stack>
          </CardContent>
        </Collapse>
      </Card>
    </Grid>
  );
};

const Home = () => {
  const Axios = useAxios();
  const navigate = useNavigate();
  const [courses, setCourses] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState(null);
  const [isError, setIsError] = React.useState(false);
  const [courseId, setCourseId] = React.useState(null);
  const [showCourseModal, setShowCourseModal] = React.useState(false);
  const [courseName, setCourseName] = React.useState("");
  const [radius, setRadius] = React.useState(null);
  const [showClassModal, setShowClassModal] = React.useState(false);



  const createCourseHandler = async () => {
    if (courseName.trim().length === 0) {
      setIsError(true);
      setShowAlert(true);
      setAlertMessage("Course Name can't be empty");
      return;
    }
    setShowCourseModal(false);
    await Axios({
      method: "post",
      url: "/course",
      data: { courseName },
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
    setCourseName("");
    getCourses();
  };

  const openStartClassModalHandler = async (courseId, radius) => {
    setRadius(radius);
    setCourseId(courseId);
    setShowClassModal(true);
  };

  const startClassHandler = async () => {
    setShowClassModal(false);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await Axios({
          method: "post",
          url: "/class",
          data: {
            courseId,
            radius,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
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
      },
      (err) => {
        console.error(err);
        setIsError(true);
        setShowAlert(true);
        setAlertMessage("Allow Location Access to Start Class");
      }
    );
  };
  const endClassHandler = async (course) => {
    await Axios({
      method: "put",
      url: "/class",
      data: { courseId: course._id },
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

  const sendAttendanceHandler = async (course) => {
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

  const getCourses = async () => {
    await Axios("/course")
      .then((res) => {
        setCourses(res.data.data.filter((c) => c.isActive));
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
      {showCourseModal && (
        <Modal
          open={showCourseModal}
          setOpen={setShowCourseModal}
          onSuccess={createCourseHandler}
          title="Create Course"
          label="Course Name"
          enteredValue={courseName}
          setEnteredvalue={setCourseName}
          successButton="Create"
          content="Please Enter the Course Name"
        />
      )}
      {showClassModal && (
        <Modal
          open={showClassModal}
          setOpen={setShowClassModal}
          onSuccess={startClassHandler}
          title="Start Class"
          label="Class Radius"
          enteredValue={radius}
          setEnteredvalue={setRadius}
          successButton="Start"
          content="Change if You want to modify the class radius"
        />
      )}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 0.5, sm: 2 }, mb: 8 }}>
        {courses.map((row) => (
          <CourseCard
            key={row._id}
            course={row}
            endClassHandler={endClassHandler}
            openStartClassModalHandler={openStartClassModalHandler}
            navigate={navigate}
            sendAttendance={sendAttendanceHandler}
          />
        ))}
      </Grid>

      <Box
        sx={{
          position: "fixed",
          right: { xs: "20px", sm: "40px" },
          bottom: { xs: "80px", sm: "110px" },
          zIndex: 10,
        }}
      >
        <Fab
          onClick={() => setShowCourseModal(true)}
          color="primary"
          aria-label="add"
        >
          <AddIcon />
        </Fab>
      </Box>
    </Stack>
  );
};

export default Home;
