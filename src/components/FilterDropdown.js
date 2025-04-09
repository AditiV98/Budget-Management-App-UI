import React, { useState } from "react";
import {
    Popover,
    Button,
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

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
                variant="outlined"
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
            >
                <div style={{ padding: "16px", width: "250px" }}>
                    {/* Search Input */}
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {/* Select All / Clear */}
                    <Typography
                        variant="body2"
                        color="primary"
                        style={{ cursor: "pointer", marginTop: "8px" }}
                        onClick={handleSelectAll}
                    >
                        Select all
                    </Typography>
                    <Typography
                        variant="body2"
                        color="primary"
                        style={{ cursor: "pointer" }}
                        onClick={handleClear}
                    >
                        Clear
                    </Typography>

                    {/* Options List */}
                    <List>
                        {options
                            .filter((opt) =>
                                opt.label.toLowerCase().includes(search.toLowerCase())
                            )
                            .map((opt) => (
                                <ListItem key={opt.value} button onClick={() => handleToggle(opt.value)}>
                                    <Checkbox checked={tempSelected.includes(opt.value)} />
                                    <ListItemText primary={opt.label} />
                                </ListItem>
                            ))}
                    </List>

                    {/* Cancel & Apply Buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button onClick={handleClose} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleApply} variant="contained" color="primary">
                            OK
                        </Button>
                    </div>
                </div>
            </Popover>
        </div>
    );
};

export default FilterDropdown;
