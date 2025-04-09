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
import {MenuItem, Select, Tooltip} from '@mui/material';
import {useDispatch, useSelector} from "react-redux";
import {useEffect,useState} from "react";
import {fetchTransactions} from "../features/transactions/transactionsSlice";
import {fetchAccounts} from "../features/accounts/accountSlice";
import {format, toZonedTime} from "date-fns-tz";
import {useFilterContext} from "./FilterContext";
import dayjs from "dayjs";
import CustomDateFilter from "./CustomDateFilter";
import FilterDropdown from "./FilterDropdown";
import Sidebar from "./PermanentDrawerLeft";

const drawerWidth = 240;
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
  { id: 'account', label: 'ACCOUNT', minWidth: 170 },
  { id: 'amount', label: 'AMOUNT', minWidth: 100 },
  {id: 'type',label: 'TYPE',minWidth: 170},
  {id: 'category',label: 'CATEGORY',minWidth: 170},
  {id: 'currentValue',label: 'CURRENT VALUE',minWidth: 170},
  { id: "transactionDate", label: "TRANSACTION DATE", minWidth: 170 },
  {id: 'maturityDate',label: 'MATURITY DATE',minWidth: 170},
  {id: 'createdAt',label: 'CREATED AT',minWidth: 170},
];

const categoryOptions = [
  { label: "Other", value: "Other" },
  { label: "FD", value: "FD" },
  { label: "Mutual Funds", value: "Mutual Funds" },
  { label: "Stocks", value: "Stocks" },
  { label: "Gold ETFs", value: "Gold ETFs" },
];

export default function Savings() {
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.transaction?.transactions) || [];
  const accounts = useSelector((state) => state.account?.accounts) || [];
  const { selectedMonth, updateMonth } = useFilterContext(); // Call the hook directly
  const [showCustomFilter, setShowCustomFilter] = useState(false);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [categoryFilter, setCategoryFilter] = useState([]);

  useEffect(() => {
    if (selectedMonth?.startDate && selectedMonth?.endDate) {
      const params = new URLSearchParams({
        startDate: selectedMonth.startDate,
        endDate: selectedMonth.endDate,
        type:'SAVINGS'
      });

      if (categoryFilter?.length) {
        categoryFilter.forEach((category) => params.append("category", category));
      }

      dispatch(fetchTransactions(params));
    }
  }, [dispatch, selectedMonth, categoryFilter]);


  const handleMonthChange = (event) => {
    const value = event.target.value;
    console.log("Selected value:", value); // Debug log

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
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
            component="main"
            sx={{
              flexGrow: 1,
              px: 3,
              pt: 5,
              background: pageBackground,
              minHeight: "100vh",
            }}
        >

<Box sx={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column", p: 5}}>
  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3, position: "relative"  }}>
    <Select
        value={selectedMonth?.startDate || ""}
        onChange={handleMonthChange}
        sx={{
          width: 220,
          background: "linear-gradient(135deg, #fff, #fce4ec)",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          "& .MuiSelect-select": { padding: "10px", fontWeight: "bold", color: "#333" }
        }}
    >
      {months.map((month) => (
          <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
      ))}
      <MenuItem value="custom">Custom Date</MenuItem>
    </Select>
    {showCustomFilter && (
        <Box sx={{ position: "absolute", top: "110%", right: 0, zIndex: 10 }}>
          <CustomDateFilter
              onApply={(dates) => {
                updateMonth(dates);
                setShowCustomFilter(false);
              }}
              onCancel={() => setShowCustomFilter(false)}
          />
        </Box>
    )}
  </Box>
      <Paper sx={{ flexGrow: 1, display: "flex", flexDirection: "column", borderRadius: "10px", overflow: "hidden" }}>
        <TableContainer sx={{ flexGrow: 1, overflow: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1E88E5" }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={{ 
                      backgroundColor: "#3949ab", 
                      color: "white", 
                      fontWeight: "bold",
                      textAlign: "left"
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {column.label}

                      {column.label === "CATEGORY" && (
                          <FilterDropdown
                              options={categoryOptions}
                              selected={categoryFilter}
                              onChange={setCategoryFilter}
                          />
                      )}

                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(transactions) && transactions?.length > 0 ? (
              transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index} hover sx={{backgroundColor: index % 2 === 0 ? "#f5f5f5" : "white",
                      "&:hover": { backgroundColor: "#e3f2fd" }}}>
                    {columns.map((column) => (
                        <TableCell key={column.id}>
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
                    <TableCell colSpan={columns.length} align="center">
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
        />
      </Paper>
    </Box>
    </Box>
      </Box>
  );
}
