import React, { useState } from "react";
import { Avatar, Menu, MenuItem, IconButton, Typography, Divider } from "@mui/material";
import { jwtDecode } from "jwt-decode"; // ✅ Named import
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice"; // Adjust path as needed
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const accessToken = useSelector((state) => state.auth.accessToken);
    let userEmail = "";

    if (accessToken) {
        try {
            const decoded = jwtDecode(accessToken); // ✅ updated here
            userEmail = decoded.email || "";
        } catch (e) {
            console.error("Invalid token:", e);
        }
    }

    const handleLogout = () => {
        dispatch(logout());
        navigate("/"); // Redirect to home/login
    };

    return (
        <>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: "auto", mr: 2, p: 0.5 }}>
  <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem' }}>
    {userEmail?.[0]?.toUpperCase() || "U"}
  </Avatar>
</IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} onClick={() => setAnchorEl(null)}
            PaperProps={{
                sx: {
                  width: 160,                // smaller width
                  padding: 1,                // reduce padding
                  borderRadius: 2,
                  fontSize: '0.75rem',       // smaller text size
                },
              }}>
                <MenuItem disabled>
                    <div>
                    <Typography fontWeight="bold" sx={{ fontSize: '0.6rem' }}>{userEmail}</Typography>
                    </div>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                <Typography sx={{ fontSize: '0.6rem' }}>Logout</Typography>
                </MenuItem>
            </Menu>
        </>
    );
};

export default UserMenu;
