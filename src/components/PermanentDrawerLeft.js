import * as React from 'react';
import { useState } from 'react';
import { Box, Drawer, CssBaseline, List, Typography, IconButton, Tooltip, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText,AppBar, Toolbar } from '@mui/material';
import { Home, ReceiptLong, Savings, Person, Settings, Menu, ChevronLeft, AccountBalanceWallet } from '@mui/icons-material';
import { useLocation, useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";
import EventRepeatIcon from '@mui/icons-material/EventRepeat';

const drawerWidth = 285; // Slightly wider for better spacing

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => setOpen(!open);

  // Sidebar menu items
  const menuItems = [
    { name: "Home", icon: <Home />, path: "/dashboard" },
    { name: "Transactions", icon: <AccountBalanceWallet />, path: "/transactions" },
    { name: "Expenses", icon: <ReceiptLong />, path: "/expenses" },
    { name: "Savings", icon: <Savings />, path: "/savings" },
    { name: "Recurring Transactions", icon: <EventRepeatIcon />, path: "/recurring-transactions" },
    { name: "My Account", icon: <Person />, path: "/my-account" },
    { name: "Settings", icon: <Settings />, path: "/settings" },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* TOP BAR */}
      <AppBar
          position="fixed"
          sx={{
            zIndex: 1201,
            background: "linear-gradient(135deg, #AEC6FF, #F8C3E6)", // Same as Drawer
            boxShadow: "none",
            width: `calc(100% - ${open ? drawerWidth : 85}px)`,
            ml: `${open ? drawerWidth : 85}px`, // Push AppBar to right
            transition: "width 0.4s, margin-left 0.4s",
          }}
      >
        <Toolbar sx={{ justifyContent: "flex-end", minHeight: "64px" }}>
          <UserMenu />
        </Toolbar>
      </AppBar>


      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : 85,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 85,
            transition: "width 0.4s ease",
            boxSizing: 'border-box',
            background: "linear-gradient(135deg, #AEC6FF, #F8C3E6)", // Glassmorphic effect
            backdropFilter: "blur(10px)", // Smooth blur effect
            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "4px 0px 12px rgba(0, 0, 0, 0.08)",
            color: "#333",
            overflowX: "hidden",
          },
        }}
      >
        {/* Header with Expand/Collapse Button */}
        <Box sx={{
          display: 'flex',
          justifyContent: open ? "space-between" : "center",
          alignItems: "center",
          padding: "16px",
          background: "linear-gradient(135deg, #97A5EE, #95DFF2)",
          borderBottomLeftRadius: "12px",
          borderBottomRightRadius: "12px",
        }}>
          {open && <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>SmartBudgeter</Typography>}
          <IconButton onClick={toggleDrawer} sx={{ color: "white" }}>
            {open ? <ChevronLeft /> : <Menu />}
          </IconButton>
        </Box>

        <Divider />

        {/* Sidebar Navigation List */}
        <List sx={{ mt: 2 }}>
          {menuItems.map(({ name, icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <ListItem key={name} disablePadding sx={{ justifyContent: open ? "flex-start" : "center", my: 1 }}>
                <Tooltip title={!open ? name : ""} placement="right">
                  <ListItemButton
                    onClick={() => navigate(path)}
                    sx={{
                      backgroundColor: isActive ? "#5C6BC0" : "transparent",
                      color: isActive ? "white" : "#333",
                      "&:hover": { backgroundColor: "#C084D3", color: "white" },
                      borderRadius: "12px",
                      mx: 2,
                      py: 3,
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? "white" : "#5C6BC0", minWidth: "50px" }}>
                      {icon}
                    </ListItemIcon>
                    {open && <ListItemText primary={name} sx={{ fontSize: "16px", fontWeight: "500" }} />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </Box>
  );
}
