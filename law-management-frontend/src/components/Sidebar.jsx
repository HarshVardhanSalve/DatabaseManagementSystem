import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar,
  Typography, Box, IconButton, Avatar, Divider, Chip
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GavelIcon from "@mui/icons-material/Gavel";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import BalanceIcon from "@mui/icons-material/Balance";

const DRAWER_WIDTH = 240;

const ROLE_LABELS = { 1: "Admin", 2: "Lawyer", 3: "Client", 4: "Judge" };
const ROLE_COLORS = { 1: "error", 2: "primary", 3: "success", 4: "warning" };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "Cases", icon: <GavelIcon />, path: "/cases" },
    { label: "Lawyers", icon: <PeopleIcon />, path: "/lawyers" },
    { label: "Hearings", icon: <EventIcon />, path: "/hearings" },
    { label: "Profile", icon: <PersonIcon />, path: "/profile" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            backgroundColor: "#0f172a",
            color: "#f1f5f9",
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 2.5 }}>
          <BalanceIcon sx={{ color: "#60a5fa", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: "#f1f5f9" }}>
            LawManager
          </Typography>
        </Box>
        <Divider sx={{ borderColor: "#1e293b" }} />

        {/* User info */}
        <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "#3b82f6", width: 36, height: 36, fontSize: 14 }}>
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: "#f1f5f9" }}>
              {user?.name}
            </Typography>
            <Chip
              label={ROLE_LABELS[user?.role_id]}
              color={ROLE_COLORS[user?.role_id]}
              size="small"
              sx={{ height: 18, fontSize: 10 }}
            />
          </Box>
        </Box>
        <Divider sx={{ borderColor: "#1e293b" }} />

        {/* Nav links */}
        <List sx={{ px: 1, pt: 1 }}>
          {navItems.map((item) => (
            <ListItem
              key={item.path}
              component={NavLink}
              to={item.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: "#94a3b8",
                "&.active": { backgroundColor: "#1e3a5f", color: "#60a5fa" },
                "&:hover": { backgroundColor: "#1e293b", color: "#e2e8f0" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: "auto", p: 1 }}>
          <Divider sx={{ borderColor: "#1e293b", mb: 1 }} />
          <ListItem
            button
            onClick={handleLogout}
            sx={{ borderRadius: 2, color: "#f87171", "&:hover": { backgroundColor: "#2d1515" } }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14 }} />
          </ListItem>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{ backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0" }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
              Law Management System
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}