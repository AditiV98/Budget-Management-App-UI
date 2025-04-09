import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";

export default function CustomDateFilter({ onApply, onCancel }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleApply = () => {
        if (dayjs(startDate).isValid() && dayjs(endDate).isValid()) {
            onApply({ startDate, endDate });
        }
    };

    return (
        <Box sx={{ p: 2, background: "#fff", borderRadius: "8px", boxShadow: 3, maxWidth: 400 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold", color: "blue", cursor: "pointer", mb: 1 }} onClick={onCancel}>
                - Clear Filter
            </Typography>

            <Typography variant="subtitle1">From</Typography>
            <TextField
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />

            <Typography variant="subtitle1">To</Typography>
            <TextField
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button variant="outlined" onClick={onCancel}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleApply}>OK</Button>
            </Box>
        </Box>
    );
}
