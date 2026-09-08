import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  Alert,
  Box,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
  Container,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import useAxios from "../api";
import GlassCard from "../components/UI/GlassCard";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    color: theme.palette.text.primary,
    fontWeight: 700,
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const UserCourses = () => {
  const location = useLocation();
  const Axios = useAxios();
  const [courses, setCourses] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState(null);
  const [isError, setIsError] = React.useState(false);

  const getCourses = async () => {
    await Axios(
      `/user/Courses?userId=${location.state.userId}&role=${location.state.role}`
    )
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

  if (!courses.length) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "90vh",
          justifyContent: "center",
          alignItems: "center",
          mr: 10,
          ml: 10,
        }}
      >
        <Typography variant="h3" component="h2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
          No Course Found
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
        <TableContainer>
          <Table sx={{ minWidth: 300 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>
                  Course Name
                </StyledTableCell>
                <StyledTableCell align="right">
                  Course Code
                </StyledTableCell>
                <StyledTableCell align="right">
                  Total Student
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((row) => (
                <StyledTableRow key={row._id}>
                  <StyledTableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                    {row.courseName}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Box sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      fontFamily: 'monospace'
                    }}>
                      {row.courseCode}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.students.length}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>
    </Container>
  );
};

export default UserCourses;
