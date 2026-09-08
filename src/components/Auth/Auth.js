import * as React from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";

import useAxios from "../../api";
import Modal from "../Modal/Modal";
import AuthContext from "../../store/auth-context";

function Copyright(props) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      align="center"
      sx={{ opacity: 0.7 }}
      {...props}
    >
      {"© "}
      {new Date().getFullYear()}
      {" "}
      <Link color="inherit" href="https://nishantmunjal.com/nmril" target="_blank" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
        RajeevSahu and NMRIL Labs
      </Link>
    </Typography>
  );
}

export default function Auth() {
  const Axios = useAxios();
  const authCtx = React.useContext(AuthContext);
  const theme = useTheme();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const data = new FormData(event.currentTarget);
    const requestbody = isSignUp
      ? {
        email: data.get("email"),
        password: data.get("password"),
        name: `${data.get("firstName").trim()} ${data
          .get("lastName")
          .trim()}`,
      }
      : { email: data.get("email"), password: data.get("password") };
    await Axios({
      method: "post",
      url: isSignUp ? "/auth/signUp" : "/auth/login",
      data: requestbody,
    })
      .then((res) => {
        if (res.data.user) {
          authCtx.onLogin(res.data.token, res.data.user);
        } else {
          setShowSuccess(res.data.message);
          setIsSignUp(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setShowError(err.response.data.message);
      });
    setIsLoading(false);
  };
  const handleGoogle = async (google) => {
    setIsLoading(true);
    await Axios.post("/auth/google", {
      credential: google.credential,
    })
      .then((res) => {
        authCtx.onLogin(res.data.token, res.data.user);
      })
      .catch((err) => {
        console.error(err);
        setShowError(err.response.data.message);
      });
    setIsLoading(false);
  };
  const forgotPassword = async (email) => {
    setShowModal(false);
    setIsLoading(true);
    await Axios({
      method: "post",
      url: "/auth/recover",
      data: { email },
    })
      .then((res) => {
        setShowSuccess(res.data.message);
      })
      .catch((err) => {
        console.error(err);
        setShowError(err.response.data.message);
      });
    setIsLoading(false);
  };

  React.useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogle,
      });

      google.accounts.id.renderButton(document.getElementById("googleDiv"), {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 280,
      });
      if (localStorage.getItem("token") === null) {
        google.accounts.id.prompt();
      }
    }
  }, []);

  return (
    <Container component="main" maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
      {showModal && (
        <Modal
          open={showModal}
          setOpen={setShowModal}
          onSuccess={forgotPassword}
          title="Forgot Password"
          label="Email Address"
          enteredValue={email}
          setEnteredvalue={setEmail}
          successButton="Send"
          content="Enter your email address and we'll send you a link to reset your password."
        />
      )}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: { xs: 3, sm: 4 },
          py: { xs: 3, sm: 4 },
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          width: '100%',
          maxWidth: 440
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 1 }}>
          <img
            src="/logo.png"
            alt="GKV Logo"
            style={{ width: '80px', height: 'auto' }}
          />
        </Box>

        <Typography
          variant="h5"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: 'primary.main',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.1rem', sm: '1.5rem' },
            whiteSpace: 'nowrap'
          }}
        >
          Geo-Location Attendance App
        </Typography>

        {/* Title */}
        <Typography
          component="h1"
          variant="h5"
          sx={{
            mb: 0.5,
            fontWeight: 700,
            color: '#1a1a1a',
            letterSpacing: '-0.02em'
          }}
        >
          {isSignUp ? "Create Account" : "Welcome Back"}
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body2"
          sx={{
            mb: 3,
            color: 'text.secondary',
            textAlign: 'center'
          }}
        >
          {isSignUp ? "Sign up to get started" : "Sign in to continue"}
        </Typography>

        {/* Google Sign In - Moved to Top */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: '100%',
            mb: 2
          }}
        >
          <div id="googleDiv"></div>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 1, width: '100%' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
            OR
          </Typography>
        </Divider>

        {/* Alerts */}
        {(showError || showSuccess) && (
          <Alert
            severity={showError ? "error" : "success"}
            sx={{
              width: '100%',
              mb: 3,
              borderRadius: 2
            }}
          >
            {showError ? showError : showSuccess}
          </Alert>
        )}

        {/* Form */}
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{ width: '100%' }}
        >
          <Grid container spacing={2}>
            {isSignUp && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    size="medium"
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                type="email"
                size="medium"
                autoFocus={!isSignUp}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prevState) => !prevState)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Forgot Password Link */}
          {!isSignUp && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                onClick={() => setShowModal(true)}
                variant="text"
                size="small"
                sx={{
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  color: 'primary.main',
                  '&:hover': { background: 'transparent', textDecoration: 'underline' }
                }}
              >
                Forgot password?
              </Button>
            </Box>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              mt: 2,
              mb: 2,
              py: 1.2,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(108, 99, 255, 0.4)',
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Toggle Sign Up/Sign In */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary" component="span">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </Typography>
            {" "}
            <Button
              onClick={() => setIsSignUp((prevState) => !prevState)}
              variant="text"
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { background: 'transparent', textDecoration: 'underline' }
              }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </Box>
        </Box>

        {/* Copyright */}
        <Copyright sx={{ mt: 2 }} />
      </Paper>
    </Container >
  );
}
