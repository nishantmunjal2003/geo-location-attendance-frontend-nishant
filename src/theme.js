import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0D7D70", // Crisp, sophisticated sage / forest emerald teal - fresh, subtle, never dull
      light: "#34A596",
      dark: "#08564D", // Deep pine for interactive hovers
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#14B8A6", // Lighter subtle mint / seafoam insert accent
      light: "#F0FDF4", // Soft airy mint insert wash
      dark: "#0F766E",
      contrastText: "#0F172A",
    },
    background: {
      default: "#F8FAF9", // Crisp, airy, clean porcelain light white
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A", // Modern slate charcoal, ultra crisp & readable
      secondary: "#475569", // Sophisticated slate grey
    },
    divider: "rgba(13, 125, 112, 0.12)", // Delicate sage teal insert border
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontWeight: 700,
      color: "#0F172A",
    },
    h4: {
      fontWeight: 700,
      color: "#0F172A",
    },
    h5: {
      fontWeight: 600,
      color: "#0F172A",
    },
    h6: {
      fontWeight: 600,
      color: "#0F172A",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "24px",
          padding: "8px 20px",
          boxShadow: "none",
          fontWeight: 600,
          "&:hover": {
            boxShadow: "0px 4px 14px rgba(13, 125, 112, 0.22)",
          },
        },
        containedPrimary: {
          backgroundColor: "#0D7D70",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#08564D",
          },
        },
        outlinedPrimary: {
          borderColor: "rgba(13, 125, 112, 0.35)",
          color: "#0D7D70",
          "&:hover": {
            borderColor: "#0D7D70",
            backgroundColor: "rgba(13, 125, 112, 0.05)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            "& fieldset": {
              borderColor: "rgba(13, 125, 112, 0.18)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(13, 125, 112, 0.4)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0D7D70",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0px 6px 24px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          border: "1px solid rgba(13, 125, 112, 0.12)",
          boxShadow: "0px 6px 20px rgba(15, 23, 42, 0.04)",
          backgroundColor: "#FFFFFF",
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        primary: {
          backgroundColor: "#0D7D70",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#08564D",
          },
          boxShadow: "0px 6px 20px rgba(13, 125, 112, 0.35)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
          border: "1px solid rgba(13, 125, 112, 0.14)",
          boxShadow: "0px 20px 50px rgba(15, 23, 42, 0.12)",
        },
      },
    },
  },
});

export default theme;
