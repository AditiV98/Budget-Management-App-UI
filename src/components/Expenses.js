import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import {useEffect,useState} from "react";
import {fetchTransactions} from "../features/transactions/transactionsSlice";
import {useDispatch, useSelector} from "react-redux";
import {fetchAccounts} from "../features/accounts/accountSlice";
import {format, toZonedTime} from "date-fns-tz";
import dayjs from "dayjs";
import {MenuItem, Select} from "@mui/material";
import {useFilterContext} from "./FilterContext";
import CustomDateFilter from "./CustomDateFilter";
import Sidebar from "./PermanentDrawerLeft";

const pageBackground = "linear-gradient(to bottom, #E3F2FD, #FCE4EC)";

const formatDate = (dateString) => {
  if (!dateString) return "";

  try {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Convert UTC date to the user's time zone
    const zonedDate = toZonedTime(new Date(dateString), userTimeZone);

    // Format the date correctly in the user's time zone
    const formattedDate = format(zonedDate, "dd MMMM yyyy, hh:mm a", {
      timeZone: userTimeZone,
    });

    return formattedDate;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Fallback to original date
  }
};

const columns = [
  { id: "account", label: "ACCOUNT", minWidth: 120 },
  { id: "amount", label: "AMOUNT", minWidth: 100 },
  { id: "type", label: "TYPE", minWidth: 120 },
  { id: "category", label: "CATEGORY", minWidth: 120 },
  { id: "description", label: "DESCRIPTION", minWidth: 180 },
  { id: "transactionDate", label: "TRANSACTION DATE", minWidth: 150 },
  { id: "createdAt", label: "CREATED AT", minWidth: 150 },
];

export default function Expenses() {
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.transaction?.transactions) || [];
  const accounts = useSelector((state) => state.account?.accounts) || [];
  const { selectedMonth, updateMonth } = useFilterContext(); // Call the hook directly
  const [showCustomFilter, setShowCustomFilter] = useState(false);

  const [selectedMonthNum, setSelectedMonthNum] = useState(dayjs().month()); // month index (0-11)
  const [selectedYear, setSelectedYear] = useState(dayjs().year()); // e.g., 2024
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);

  useEffect(() => {
    if (selectedMonth?.startDate && selectedMonth?.endDate) {
      dispatch(fetchTransactions({type: 'EXPENSE',startDate: selectedMonth.startDate, endDate: selectedMonth.endDate}))
    }
  }, [dispatch, selectedMonth]);

  useEffect(() => {
    if (!isCustomMode && selectedYear && selectedMonthNum >= 0) {
      const startDate = dayjs().year(selectedYear).month(selectedMonthNum).startOf('month').format('YYYY-MM-DD');
      const endDate = dayjs().year(selectedYear).month(selectedMonthNum).endOf('month').format('YYYY-MM-DD');
      updateMonth({ startDate, endDate });
    }
  }, [selectedMonthNum, selectedYear, isCustomMode]); // Note: depend on isCustomMode


    const handleMonthChange = (event) => {
        const value = event.target.value;

        if (value === "custom") {
            setShowCustomFilter(true);
        } else {
            setShowCustomFilter(false);
            updateMonth(value); // Handle predefined months
        }
    };

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = dayjs().month(i).format("MMMM YYYY");
    return { value: dayjs().month(i).startOf("month").format("YYYY-MM-DD"), label: month };
  });

  useEffect(() => {
    if (accounts.length === 0) {  // Fetch only if accounts are empty
      dispatch(fetchAccounts());
    }
  }, [dispatch, accounts]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
    <Sidebar />
    <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: "auto",
            background: pageBackground,
            px: 1,
            pt: 8, 
          }}
      >


<Box sx={{ height: "calc(100vh - 80px)", display: "flex", flexDirection: "column"}}>
<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, flexWrap: 'wrap', position: 'relative' }}>
                {/* Month Dropdown */}
<Select
  value={selectedMonthNum}
  onChange={(e) => setSelectedMonthNum(parseInt(e.target.value))}
  sx={{
    width: 110,
    height: 30,
    background: "linear-gradient(135deg, #fff, #fce4ec)",
    borderRadius: "6px",
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    mr: 1,
    p:1,
    '& .MuiSelect-select': {
      padding: '1px 1px',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#333',
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
    background: "linear-gradient(135deg, #fff, #fce4ec)",
    borderRadius: "6px",
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    mr: 1,
    p:1,
    '& .MuiSelect-select': {
      padding: '1px 1px',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#333',
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
              background: "linear-gradient(135deg, #fff, #fce4ec)",
              borderRadius: "6px",
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              mr: 1,
              p:1,
              '& .MuiSelect-select': {
                padding: '1px 1px',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#333',
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

            <Paper sx={{ flexGrow: 1, display: "flex", flexDirection: "column", borderRadius: "10px", overflow: "hidden",fontSize: "0.75rem",p:1 }}>
        <TableContainer sx={{ flexGrow: 1, overflow: "auto" ,borderRadius: "10px",}}>
        <Table stickyHeader size="small"> 
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#1E88E5" }}>
                {columns.map((column) => (
                    <TableCell
                        key={column.id}
                        style={{ minWidth: column.minWidth }}
                        sx={{ backgroundColor: "#3949ab", color: "white", fontWeight: "bold", textAlign: "left" ,fontSize: "0.7rem",py: 1}}
                    >
                      {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(transactions) && transactions?.length > 0 ? (
              transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow
                      key={row.id}
                      hover
                      sx={{ backgroundColor: index % 2 === 0 ? "#f5f5f5" : "white", "&:hover": { backgroundColor: "#e3f2fd" } }}
                  >
                    {columns.map((column) => (
                        <TableCell key={column.id} sx={{ fontSize: "0.70rem", py: 1 }}>
                          {column.id === "account" ? (
                              row.account.name // Extract account name instead of showing the entire object
                          ) : column.id === "transactionDate" || column.id === "createdAt" ? (
                              formatDate(row[column.id]) // ✅ Correctly format the date values
                          ) : (
                              row[column.id]
                          )}
                        </TableCell>
                    ))}
                  </TableRow>
                ))):(
                  <TableRow>
                     <TableCell colSpan={columns.length} align="center" sx={{ fontSize: "0.65rem" }}>
                      No transactions available.
                    </TableCell>
                  </TableRow>

              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[15]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '& .MuiTablePagination-toolbar': {
              minHeight: '32px',
              fontSize: '0.65rem',
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.65rem',
            },
            '& .MuiInputBase-root': {
              fontSize: '0.65rem',
            },
          }}
        />
      </Paper>
    </Box>
    </Box>
      </Box>
  );
}
