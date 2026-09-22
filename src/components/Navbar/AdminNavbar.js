import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HistoryIcon from "@mui/icons-material/History";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../store/auth-context";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 20,
  backgroundColor: "rgba(13, 125, 112, 0.06)",
  "&:hover": {
    backgroundColor: "rgba(13, 125, 112, 0.1)",
  },
  border: "1px solid rgba(13, 125, 112, 0.15)",
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#0D7D70",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function AdminNavbar({ setSearchTerm }) {
  const authCtx = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(20px)",
          boxShadow: "0px 2px 14px rgba(15, 23, 42, 0.03)",
          borderBottom: "1px solid rgba(13, 125, 112, 0.12)",
          color: "text.primary",
        }}
      >
        <Toolbar>
          <PersonPinIcon
            onClick={() => navigate("/")}
            sx={{
              display: { xs: "flex", md: "flex" },
              mr: 1,
              cursor: "pointer",
            }}
          />
          <Typography
            variant="h6"
            noWrap
            onClick={() => navigate("/")}
            sx={{
              mr: 2,
              display: "flex",
              cursor: "pointer",
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".2rem",
              color: "#0F172A",
              textDecoration: "none",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            GKVAPP
          </Typography>
          <Search sx={{ display: { xs: "none", md: "block" } }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
          {/* Email Logs quick link for Admin */}
          <Button
            onClick={() => navigate("/email-logs")}
            startIcon={<HistoryIcon sx={{ fontSize: "1rem !important" }} />}
            size="small"
            sx={{
              ml: 1,
              display: { xs: "none", md: "flex" },
              textTransform: "none",
              fontWeight: 600,
              color: "#0D7D70",
              borderRadius: "20px",
              px: 2,
              border: "1px solid rgba(13, 125, 112, 0.2)",
              "&:hover": { bgcolor: "rgba(13, 125, 112, 0.06)", borderColor: "#0D7D70" },
            }}
          >
            Email Logs
          </Button>
          <Box sx={{ flexGrow: 1 }} />
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
                  {authCtx.user?.name ? authCtx.user.name.charAt(0).toUpperCase() : "A"}
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
                    {authCtx.user?.name || "Admin"}
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
                    {authCtx.user?.role || "Administrator"}
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
                  {authCtx.user?.name || "Administrator"}
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
                  {authCtx.user?.email || "admin@gkv.ac.in"}
                </Typography>
                <Chip
                  label={authCtx.user?.role ? authCtx.user.role.toUpperCase() : "ADMIN"}
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
      </AppBar>
    </Box>
  );
}
