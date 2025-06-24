import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Drawer,
  CssBaseline,
  List,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  useTheme
} from '@mui/material';
import {
  Home,
  ReceiptLong,
  Savings,
  Person,
  Settings,
  Menu,
  ChevronLeft,
  AccountBalanceWallet
} from '@mui/icons-material';
import { useLocation, useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";
import EventRepeatIcon from '@mui/icons-material/EventRepeat';

const drawerWidth = 203;
const collapsedDrawerWidth = 60;
const appBarHeight = 50;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const toggleDrawer = () => setOpen(!open);

  const menuItems = [
    { name: "Home", icon: <Home />, path: "/dashboard" },
    { name: "Transactions", icon: <AccountBalanceWallet />, path: "/transactions" },
    { name: "Expenses", icon: <ReceiptLong />, path: "/expenses" },
    { name: "Savings", icon: <Savings />, path: "/savings" },
    { name: "Recurring Transactions", icon: <EventRepeatIcon />, path: "/recurring-transactions" },
    { name: "Account", icon: <Person />, path: "/my-account" },
    { name: "Settings", icon: <Settings />, path: "/settings" },
  ];

  const drawerGradient = theme.palette.sidebar.drawerGradient;

  const drawerHeaderBg = theme.palette.sidebar.drawerHeaderBg;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
          height: appBarHeight,
          background: isDark
            ? 'linear-gradient(135deg, #2A263D, #3A3359)'
            : 'linear-gradient(135deg, #AEC6FF, #F8C3E6)',
          boxShadow: "none",
          width: `calc(100% - ${open ? drawerWidth : collapsedDrawerWidth}px)`,
          ml: `${open ? drawerWidth : collapsedDrawerWidth}px`,
          transition: "width 0.3s, margin-left 0.3s",
        }}
      >
        <Toolbar
  sx={{
    minHeight: appBarHeight,
    display: "flex",
    justifyContent: "flex-end", // Keep right-aligned
    alignItems: "center",       // Vertically center
    px: 2,
  }}
>
  <UserMenu />
</Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : collapsedDrawerWidth,
            transition: "width 0.3s ease",
            boxSizing: 'border-box',
            background: drawerGradient,
            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "4px 0px 8px rgba(0, 0, 0, 0.05)",
            color: "#333",
            overflowX: "hidden",
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: open ? "space-between" : "center",
            alignItems: "center",
            padding: open ? "8px" : "6px",
            background: drawerHeaderBg,
           
          }}
        >
          {open && (
            <Typography variant="subtitle2"  sx={{
              fontWeight: "bold",
              color: "white",
              fontSize: "12px",
              textAlign: "center", // centers text within parent
              width: "100%",        // make sure it spans the width
            }}>
              SmartBudgeter
            </Typography>
          )}
          <IconButton onClick={toggleDrawer} sx={{ color: "white" }}>
            {open ? <ChevronLeft fontSize="small" /> : <Menu fontSize="small" />}
          </IconButton>
        </Box>

        <Divider />

        {/* Sidebar Items */}
        <List sx={{ mt: 0.5 }}>
          {menuItems.map(({ name, icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <ListItem key={name} disablePadding sx={{ justifyContent: open ? "flex-start" : "center", my: 0.5 }}>
                <Tooltip title={!open ? name : ""} placement="right">
                  <ListItemButton
                    onClick={() => navigate(path)}
                    sx={{
                      backgroundColor: isActive
                      ? theme.palette.primary.main
                      : 'transparent',
                      color: isActive ? 'white' : theme.palette.sidebar.textColor,
                      '&:hover': {
                        backgroundColor: theme.palette.sidebar.hoverBg,
                        color: 'white',
                      },
                      borderRadius: "10px",
                      mx: open ? 1.5 : 0.5,
                      py: open ? 1.2 : 0.8,
                      px: open ? 1.5 : 0.8,
                      minHeight: 36,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive
                          ? 'white'
                          : theme.palette.sidebar.iconColor,
                        minWidth: open ? "32px" : "24px",
                      }}
                    >
                      {React.cloneElement(icon, { fontSize: "small" })}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={
                          <Typography variant="caption" sx={{ fontSize: "11px", fontWeight: 500 }}>
                            {name}
                          </Typography>
                        }
                      />
                    )}
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
