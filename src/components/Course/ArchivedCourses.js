import * as React from "react";
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
} from "@mui/material";

const ArchivedCourseCard = ({ course, navigate }) => {
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
                    borderTop: "4px solid #34A596", // Subtle sage teal insert
                    boxShadow: "0px 6px 20px rgba(15, 23, 42, 0.04)",
                }}
            >
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="div" fontWeight="bold" sx={{ color: "#0F172A" }} gutterBottom>
                        {course.courseName}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: "#475569" }}>
                        Code: <strong>{course.courseCode}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#75675E", mt: 1 }}>
                        <strong>Students:</strong> {course.students.length}
                    </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        startIcon={<SettingsIcon />}
                        onClick={() => navigate(`/course/${course._id}`)}
                    >
                        Settings (Reactivate)
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    );
};

const ArchivedCourses = () => {
    const Axios = useAxios();
    const navigate = useNavigate();
    const [courses, setCourses] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showAlert, setShowAlert] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState(null);
    const [isError, setIsError] = React.useState(false);

    const getCourses = async () => {
        await Axios("/course")
            .then((res) => {
                // Filter for INACTIVE courses
                setCourses(res.data.data.filter((c) => !c.isActive));
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
        <Stack sx={{ width: "100%", p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Archived Classes
            </Typography>

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

            {courses.length === 0 ? (
                <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
                    No archived classes found.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {courses.map((row) => (
                        <ArchivedCourseCard
                            key={row._id}
                            course={row}
                            navigate={navigate}
                        />
                    ))}
                </Grid>
            )}
        </Stack>
    );
};

export default ArchivedCourses;
