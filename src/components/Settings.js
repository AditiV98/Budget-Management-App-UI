import { Box } from "@mui/material"
import PermanentDrawerLeft from "./PermanentDrawerLeft";
import React from "react";
import Sidebar from "./PermanentDrawerLeft";

const drawerWidth = 240;
const pageBackground = "linear-gradient(to bottom, #E3F2FD, #FCE4EC)";



export default function Settings() {
    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    px: 3,
                    pt: 10,
                    background: pageBackground,
                    minHeight: "100vh",
                }}
            >
            <h1 style={{ color: "#333", fontWeight: "bold" }}>Settings</h1>
        </Box>
        </Box>
    )
}
