import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HistoryIcon from "@mui/icons-material/History";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../store/auth-context";
import { useTheme } from "@mui/material/styles";

const Navbar = () => {
  const authCtx = React.useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigate = () => {
    authCtx.user.role === "teacher"
      ? navigate("/courses")
      : navigate("/messages");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(20px)",
        boxShadow: "0px 2px 14px rgba(15, 23, 42, 0.03)",
        borderBottom: "1px solid rgba(13, 125, 112, 0.12)",
        color: "text.primary",
        borderRadius: 0,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            component="img"
            src="/logo.png"
            alt="GKV Logo"
            sx={{
              display: { xs: "none", md: "flex" },
              mr: 1,
              height: 40,
              width: 'auto',
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          />
          <Typography
            variant="h6"
            noWrap
            onClick={() => navigate("/")}
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              cursor: "pointer",
              fontWeight: 700,
              letterSpacing: ".1rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            GKVAPP
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
                mt: 1.5,
                "& .MuiPaper-root": {
                  borderRadius: "16px",
                  p: 1,
                  minWidth: 200,
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(13, 125, 112, 0.16)",
                  boxShadow: "0px 12px 28px rgba(15, 23, 42, 0.12)",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setAnchorElNav(null);
                  navigate("/");
                }}
                sx={{
                  borderRadius: "10px",
                  py: 1,
                  "&:hover": { backgroundColor: "rgba(13, 125, 112, 0.08)", color: "#0D7D70" },
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Dashboard</Typography>
              </MenuItem>
              {authCtx.user.role !== "teacher" && (
                <MenuItem
                  onClick={() => {
                    setAnchorElNav(null);
                    navigate("/messages");
                  }}
                  sx={{
                    borderRadius: "10px",
                    py: 1,
                    "&:hover": { backgroundColor: "rgba(13, 125, 112, 0.08)", color: "#0D7D70" },
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Messages</Typography>
                </MenuItem>
              )}
              {authCtx.user.role === "teacher" && (
                <MenuItem
                  onClick={() => {
                    setAnchorElNav(null);
                    navigate("/archived");
                  }}
                  sx={{
                    borderRadius: "10px",
                    py: 1,
                    "&:hover": { backgroundColor: "rgba(13, 125, 112, 0.08)", color: "#0D7D70" },
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Archived Classes</Typography>
                </MenuItem>
              )}
              {authCtx.user.role === "teacher" && (
                <MenuItem
                  onClick={() => {
                    setAnchorElNav(null);
                    navigate("/email-logs");
                  }}
                  sx={{
                    borderRadius: "10px",
                    py: 1,
                    "&:hover": { backgroundColor: "rgba(13, 125, 112, 0.08)", color: "#0D7D70" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <HistoryIcon sx={{ fontSize: "1rem", color: "#0D7D70" }} />
                  </ListItemIcon>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Email Logs</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
          <Box
            component="img"
            src="/logo.png"
            alt="GKV Logo"
            sx={{
              display: { xs: "flex", md: "none" },
              mr: 1,
              height: 32,
              width: 'auto'
            }}
          />
          <Typography
            variant="h5"
            noWrap
            onClick={() => navigate("/")}
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: ".1rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            GKVAPP
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button
              onClick={() => navigate("/")}
              sx={{ my: 2, color: "text.primary", display: "block", fontWeight: 600 }}
            >
              Dashboard
            </Button>
            {authCtx.user.role !== "teacher" && (
              <Button
                onClick={() => navigate("/messages")}
                sx={{ my: 2, color: "text.primary", display: "block", fontWeight: 600 }}
              >
                Messages
              </Button>
            )}
            {authCtx.user.role === "teacher" && (
              <Button
                onClick={() => navigate("/archived")}
                sx={{ my: 2, color: "text.primary", display: "block", fontWeight: 600 }}
              >
                Archived Classes
              </Button>
            )}
            {authCtx.user.role === "teacher" && (
              <Button
                onClick={() => navigate("/email-logs")}
                startIcon={<HistoryIcon sx={{ fontSize: "1rem !important" }} />}
                sx={{ my: 2, color: "text.primary", display: "block", fontWeight: 600 }}
              >
                Email Logs
              </Button>
            )}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {/* Attractive Interactive Profile Pill Button */}
            <Tooltip title="Account menu">
              <Box
                onClick={handleOpenUserMenu}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  py: 0.6,
                  px: { xs: 0.6, sm: 1.5 },
                  borderRadius: "24px",
                  cursor: "pointer",
                  border: Boolean(anchorElUser)
                    ? "1.5px solid #0D7D70"
                    : "1.5px solid rgba(13, 125, 112, 0.2)",
                  backgroundColor: Boolean(anchorElUser)
                    ? "rgba(13, 125, 112, 0.08)"
                    : "rgba(255, 255, 255, 0.85)",
                  boxShadow: "0px 2px 8px rgba(15, 23, 42, 0.04)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(13, 125, 112, 0.08)",
                    borderColor: "#0D7D70",
                    boxShadow: "0px 4px 14px rgba(13, 125, 112, 0.15)",
                  },
                }}
              >
                <Avatar
                  alt={authCtx.user?.name}
                  src={authCtx.user?.profileImage}
                  sx={{
                    width: 34,
                    height: 34,
                    background: "linear-gradient(135deg, #0D7D70 0%, #14B8A6 100%)",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    boxShadow: "0px 2px 8px rgba(13, 125, 112, 0.25)",
                  }}
                >
                  {authCtx.user?.name ? authCtx.user.name.charAt(0).toUpperCase() : "U"}
                </Avatar>
                <Box
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    flexDirection: "column",
                    alignItems: "flex-start",
                    lineHeight: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "#0F172A",
                      fontSize: "0.85rem",
                      maxWidth: 130,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {authCtx.user?.name || "User"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#0D7D70",
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {authCtx.user?.role || "Member"}
                  </Typography>
                </Box>
                <KeyboardArrowDownIcon
                  sx={{
                    fontSize: 18,
                    color: "#64748B",
                    transform: Boolean(anchorElUser) ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s ease",
                    display: { xs: "none", sm: "block" },
                  }}
                />
              </Box>
            </Tooltip>

            {/* Attractive Profile Dropdown Menu */}
            <Menu
              sx={{
                mt: "48px",
                "& .MuiPaper-root": {
                  borderRadius: "18px",
                  minWidth: 250,
                  p: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(13, 125, 112, 0.16)",
                  boxShadow: "0px 16px 36px rgba(15, 23, 42, 0.12), 0px 4px 14px rgba(13, 125, 112, 0.08)",
                },
              }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {/* User Header Block in Dropdown */}
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem" }}>
                  {authCtx.user?.name || "User"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748B",
                    display: "block",
                    maxWidth: 210,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {authCtx.user?.email || ""}
                </Typography>
                <Chip
                  label={authCtx.user?.role ? authCtx.user.role.toUpperCase() : "USER"}
                  size="small"
                  sx={{
                    mt: 1,
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    height: 20,
                    borderRadius: "6px",
                    backgroundColor: "rgba(13, 125, 112, 0.1)",
                    color: "#0D7D70",
                  }}
                />
              </Box>

              <Divider sx={{ my: 1, borderColor: "rgba(13, 125, 112, 0.1)" }} />

              {/* Profile Link */}
              <MenuItem
                onClick={() => {
                  handleCloseUserMenu();
                  navigate("/me");
                }}
                sx={{
                  borderRadius: "12px",
                  py: 1,
                  px: 1.5,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: "rgba(13, 125, 112, 0.08)",
                    "& .MuiListItemIcon-root": {
                      color: "#0D7D70",
                    },
                    "& .MuiTypography-root": {
                      color: "#0D7D70",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: "#475569" }}>
                  <PersonOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Account Profile"
                  primaryTypographyProps={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                  secondary="Settings & info"
                  secondaryTypographyProps={{ fontSize: "0.725rem", color: "#64748B" }}
                />
              </MenuItem>

              <Divider sx={{ my: 0.8, borderColor: "rgba(13, 125, 112, 0.08)" }} />

              {/* Logout Option */}
              <MenuItem
                onClick={() => {
                  navigate("/");
                  authCtx.onLogout();
                }}
                sx={{
                  borderRadius: "12px",
                  py: 1,
                  px: 1.5,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                    "& .MuiListItemIcon-root": {
                      color: "#EF4444",
                    },
                    "& .MuiTypography-root": {
                      color: "#EF4444",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: "#EF4444" }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Sign Out"
                  primaryTypographyProps={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#EF4444",
                  }}
                />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Navbar;
