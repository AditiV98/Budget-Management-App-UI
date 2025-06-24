import React from 'react';
import { Box, MenuItem, Select} from "@mui/material";
import CustomDateFilter from './CustomDateFilter';
import dayjs from "dayjs";

export default function DateAndAccountFilter({
    accounts = [],
    selectedAccount,
    handleAccountChange,
    selectedMonthNum,
    setSelectedMonthNum,
    selectedYear,
    setSelectedYear,
    isCustomMode,
    setIsCustomMode,
    showCustomFilter,
    setShowCustomFilter,
    updateMonth,
    theme,
  }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, flexWrap: 'wrap', position: 'relative' }}>
        {/* Account Filter */}
          <Select
            value={selectedAccount}
            onChange={handleAccountChange}
            displayEmpty
            sx={{
              width: 110,
              height: 30,
              background: theme.palette.filters.dropdown,
              color: theme.palette.filters.dropdownColor,
              borderRadius: "6px",
              boxShadow: theme.palette.filters.dropdownShadow,
              mr: 1,
              p:1,
              '& .MuiSelect-select': {
                padding: '1px 1px',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: theme.palette.filters.dropdownColor,
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  background:  theme.palette.filters.background,
                  maxHeight: 150, // limit height of dropdown
                  width: 120,     // narrow the dropdown width
                  fontSize: '0.75rem',
                  '& .MuiMenuItem-root': {
                    minHeight: '30px',
                    fontSize: '0.75rem',
                    px: 1,
                  },
                },
              },
            }}
          >
            <MenuItem value="" disabled>Select Account</MenuItem>
            {accounts.map((acc) => (
              <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
            ))}
          </Select>

        
{/* Month Dropdown */}
<Select
  value={selectedMonthNum}
  onChange={(e) => setSelectedMonthNum(parseInt(e.target.value))}
  sx={{
    width: 110,
              height: 30,
              background: theme.palette.filters.dropdown,
              color: theme.palette.filters.dropdownColor,
              borderRadius: "6px",
              boxShadow: theme.palette.filters.dropdownShadow,
              mr: 1,
              p:1,
              '& .MuiSelect-select': {
                padding: '1px 1px',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: theme.palette.filters.dropdownColor,
              },
  }}
  MenuProps={{
    PaperProps: {
      sx: {
        background:  theme.palette.filters.background,
        maxHeight: 150, 
        width: 120,     
        fontSize: '0.75rem',
        '& .MuiMenuItem-root': {
          minHeight: '30px',
          fontSize: '0.75rem',
          px: 1,
        },
      },
    },
  }}
>
  {Array.from({ length: 12 }, (_, i) => (
    <MenuItem key={i} value={i}>
      {dayjs().month(i).format("MMMM")}
    </MenuItem>
  ))}
</Select>

{/* Year Dropdown */}
<Select
  value={selectedYear}
  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
  sx={{
    width: 110,
    height: 30,
    background: theme.palette.filters.dropdown,
color: theme.palette.filters.dropdownColor,
    borderRadius: "6px",
    boxShadow: theme.palette.filters.dropdownShadow,
    mr: 1,
    p:1,
    '& .MuiSelect-select': {
      padding: '1px 1px',
      fontSize: '0.75rem',
      fontWeight: '500',
      color:theme.palette.filters.dropdownColor,
    },
  }}
  MenuProps={{
    PaperProps: {
      sx: {
        background:  theme.palette.filters.background,
        maxHeight: 150, // limit height of dropdown
        width: 120,     // narrow the dropdown width
        fontSize: '0.75rem',
        '& .MuiMenuItem-root': {
          minHeight: '30px',
          fontSize: '0.75rem',
          px: 1,
        },
      },
    },
  }}
>
  {Array.from({ length: 5 }, (_, i) => {
    const year = dayjs().year() - i;
    return <MenuItem key={year} value={year}>{year}</MenuItem>;
  })}
</Select>

{/* Custom Date Option */}
<Select
 value={isCustomMode ? "custom" : ""}
 onChange={(e) => {
   const isCustom = e.target.value === "custom";
   setIsCustomMode(isCustom);
   setShowCustomFilter(isCustom);
 }}
  displayEmpty
  sx={{
    width: 110,
    height: 30,
    background: theme.palette.filters.dropdown,
    borderRadius: "6px",
    boxShadow: theme.palette.filters.dropdownShadow,
    mr: 1,
    p:1,
    '& .MuiSelect-select': {
      padding: '1px 1px',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: theme.palette.filters.dropdownColor,
    },
  }}
  MenuProps={{
    PaperProps: {
      sx: {
        maxHeight: 150, // limit height of dropdown
        width: 120,     // narrow the dropdown width
        fontSize: '0.75rem',
        '& .MuiMenuItem-root': {
          minHeight: '30px',
          fontSize: '0.75rem',
          px: 1,
        },
      },
    },
  }}
>
  <MenuItem value="">Default</MenuItem>
  <MenuItem value="custom">Custom Date</MenuItem>
</Select>

{/* Render Custom Date Picker */}
{showCustomFilter && (
  <Box sx={{ position: "absolute", top: "110%", right: 0, zIndex: 10 }}>
    <CustomDateFilter
      onApply={(dates) => {
        updateMonth(dates);
        setShowCustomFilter(false);
        setIsCustomMode(true); // Stay in custom mode
      }}
      onCancel={() => {
        setShowCustomFilter(false);
        setIsCustomMode(false);
      }}
    />
  </Box>
)}
      </Box>
    )
}