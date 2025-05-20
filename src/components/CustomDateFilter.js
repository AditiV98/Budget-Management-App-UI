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
        <Box 
        sx={{
            p: 2,
            background: "#fff",
            borderRadius: "8px",
            boxShadow: 3,
            width: 170,
            zIndex: 10,
            position: "absolute", // Only needed if you want it to float
            top: "100%",           // Adjust based on trigger button
            right: 0               // Aligns it to the right
          }}>
            <Typography variant="body1" sx={{ fontWeight: "bold", color: "blue", cursor: "pointer", mb: 1,fontSize:"12px" }} onClick={onCancel}>
                - Clear Filter
            </Typography>

            <Typography variant="subtitle1" sx={{ mb: 0.5 , fontSize:"12px"}}>From</Typography>
            <TextField
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
                InputLabelProps={{ shrink: true ,
                    sx: {
                        fontSize: '12px',
                        "&.Mui-focused": { fontSize: '12px' },
                        "&.MuiInputLabel-shrink": { fontSize: '12px' },
                      }}}
                      InputProps={{
                        sx: {
                          fontSize: "12px", // 👈 This affects the input and placeholder text
                          height: "36px",   // Optional: adjust height if needed
                        }
                      }}
            />

            <Typography variant="subtitle1" sx={{ mb: 0.5,fontSize:"12px" }}>To</Typography>
            <TextField
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true,
                    sx: {
                        fontSize: '12px',
                        "&.Mui-focused": { fontSize: '12px' },
                        "&.MuiInputLabel-shrink": { fontSize: '12px' },
                      } }}
                      InputProps={{
                        sx: {
                          fontSize: "12px", // 👈 This affects the input and placeholder text
                          height: "36px",   // Optional: adjust height if needed
                        }
                      }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button variant="outlined" size="small" onClick={onCancel}>Cancel</Button>
                <Button variant="contained" size="small" color="primary" onClick={handleApply}>OK</Button>
            </Box>
        </Box>
    );
}
