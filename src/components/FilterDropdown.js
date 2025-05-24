import React, { useState } from "react";
import {
    Popover,
    Button,
    Checkbox,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography,
    Divider,
    IconButton,
    Box
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import DoneAllIcon from "@mui/icons-material/DoneAll";

const FilterDropdown = ({ label, options, selected, onChange }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [search, setSearch] = useState("");
    const [tempSelected, setTempSelected] = useState(selected || []);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelectAll = () => {
        setTempSelected(options.map((opt) => opt.value));
    };

    const handleClear = () => {
        setTempSelected([]);
    };

    const handleToggle = (value) => {
        setTempSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const handleApply = () => {
        onChange(tempSelected);
        handleClose();
    };

    return (
        <div>
            <Button
                size="small"
                startIcon={<FilterListIcon />}
                onClick={handleOpen}
            >
                {label}
            </Button>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                PaperProps={{
                    style: {
                        width: 200,
                        padding: "12px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        mb: 1,
                    }}
                >
                    <IconButton size="small" onClick={handleSelectAll} title="Select All">
                        <DoneAllIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleClear} title="Clear All">
                        <ClearAllIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Divider sx={{ mb: 1 }} />

                <List dense disablePadding sx={{ maxHeight: 180, overflowY: "auto" }}>
                    {options
                        .filter((opt) =>
                            opt.label.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((opt) => (
                            <ListItem
                                key={opt.value}
                                disablePadding
                                dense
                                button
                                onClick={() => handleToggle(opt.value)}
                            >
                                <Checkbox
                                    size="small"
                                    checked={tempSelected.includes(opt.value)}
                                    sx={{ paddingLeft: 1 }}
                                />
                                <ListItemText
                                    primary={opt.label}
                                    sx={{ marginLeft: 1 }}
                                />
                            </ListItem>
                        ))}
                </List>

                <Divider sx={{ mt: 1, mb: 1 }} />

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1,
                    }}
                >
                    <Button size="small" onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        size="small"
                        onClick={handleApply}
                        variant="contained"
                        color="primary"
                    >
                        OK
                    </Button>
                </Box>
            </Popover>
        </div>
    );
};

export default FilterDropdown;
