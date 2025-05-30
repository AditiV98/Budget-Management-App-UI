import React, {useEffect, useState} from "react";
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Tooltip, IconButton, Select
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {useDispatch, useSelector} from "react-redux";
import {fetchTransactions,updateTransaction,createTransaction,deleteTransaction} from "../features/transactions/transactionsSlice";
import { fetchAccounts} from "../features/accounts/accountSlice";
import { format,toZonedTime } from "date-fns-tz";
import {useFilterContext} from "./FilterContext";
import dayjs from "dayjs";
import Papa from "papaparse";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CustomDateFilter from "./CustomDateFilter";
import FilterDropdown from "./FilterDropdown";
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
  { id: "actions", label: "ACTIONS", minWidth: 100 },
];

const typeOptions = [
  { label: "Income", value: "INCOME" },
  { label: "Expense", value: "EXPENSE" },
  { label: "Savings", value: "SAVINGS" },
];

const categoryOptions = [
  { label: "Housing", value: "Housing" },
  { label: "Utilities", value: "Utilities" },
  { label: "Groceries", value: "Groceries" },
  { label: "Transportation", value: "Transportation" },
  { label: "Education", value: "Education" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Loan & Debt Payments", value: "Loan & Debt Payments" },
  { label: "Dining Out", value: "Dining Out" },
  { label: "Entertainment", value: "Entertainment" },
  { label: "Shopping", value: "Shopping" },
  { label: "Travel", value: "Travel" },
  { label: "Gifts & Donations", value: "Gifts & Donations" },
  { label: "Fitness & Wellness", value: "Fitness & Wellness" },
  { label: "Childcare", value: "Childcare" },
  { label: "Home Maintenance", value: "Home Maintenance" },
  { label: "Pet Care", value: "Pet Care" },
  { label: "Self-Development", value: "Self-Development" },
  { label: "Tax", value: "Tax" },
  { label: "Other", value: "Other" },
  { label: "FD", value: "FD" },
  { label: "Mutual Funds", value: "Mutual Funds" },
  { label: "Stocks", value: "Stocks" },
  { label: "Gold ETFs", value: "Gold ETFs" },
  { label: "Salary", value: "Salary" },
  { label: "Interest", value: "Interest" },
  { label: "Refund", value: "Refund" },
];

export default function Transactions() {
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.transaction?.transactions) || [];
  const accounts = useSelector((state) => state.account?.accounts) || [];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [openCSVDialog, setOpenCSVDialog] = useState(false);
  const [selectedCSVFile, setSelectedCSVFile] = useState(null);
  const [selectedCSVAccount, setSelectedCSVAccount] = useState("");
  const { selectedMonth, updateMonth } = useFilterContext(); // Call the hook directly
  const [showCustomFilter, setShowCustomFilter] = useState(false);
  const [typeFilter, setTypeFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);

  const [selectedMonthNum, setSelectedMonthNum] = useState(dayjs().month()); // month index (0-11)
  const [selectedYear, setSelectedYear] = useState(dayjs().year()); // e.g., 2024
  const [isCustomMode, setIsCustomMode] = useState(false);


  useEffect(() => {
    if (selectedMonth?.startDate && selectedMonth?.endDate) {
      const params = new URLSearchParams({
        startDate: selectedMonth.startDate,
        endDate: selectedMonth.endDate
      });

      if (typeFilter?.length) {
        typeFilter.forEach((type) => params.append("type", type));
      }

      if (categoryFilter?.length) {
        categoryFilter.forEach((category) => params.append("category", category));
      }

      dispatch(fetchTransactions(params));
    }
  }, [dispatch, selectedMonth, typeFilter, categoryFilter]);

  useEffect(() => {
    if (!isCustomMode && selectedYear && selectedMonthNum >= 0) {
      const startDate = dayjs().year(selectedYear).month(selectedMonthNum).startOf('month').format('YYYY-MM-DD');
      const endDate = dayjs().year(selectedYear).month(selectedMonthNum).endOf('month').format('YYYY-MM-DD');
      updateMonth({ startDate, endDate });
    }
  }, [selectedMonthNum, selectedYear, isCustomMode]); // Note: depend on isCustomMode

  useEffect(() => {
    if (accounts.length === 0) {  // Fetch only if accounts are empty
      dispatch(fetchAccounts());
    }
  }, [dispatch, accounts]);

  const handleOpen = (transaction = null) => {
    setIsEditMode(!!transaction);

    if (transaction) {
      const account = transaction?.account ? accounts.find((acc) => acc.id === transaction.account.id) : null;

      setSelectedTransaction({
        ...transaction,
        accountId: transaction?.account?.id || "",
      });

      setSelectedAccount(account || null);
      setSelectedType(transaction.type || "");

      let categories = [];
      if (transaction.type === "SAVINGS") {
        categories = account?.savingCategories || [];
      } else if (transaction.type === "EXPENSE") {
        categories = account?.expenseCategories || [];
      } else if (transaction.type === "INCOME") {
        categories = ["Salary","Interest","Refund", "Other"];
      }
      setFilteredCategories(categories);
    } else {
      setSelectedTransaction(null);
    }

    setOpen(true);
  };

  const handleClose = () => {
    document.activeElement.blur();
    setSelectedTransaction(null);
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "account") {
      const account = accounts.find((acc) => acc.id === value);
      setSelectedAccount(account);
      setSelectedTransaction((prev) => ({
        ...prev,
        accountId: account.id, // Store account ID
        account: account.name, // Store account name
        category: "", // Reset category when account changes
      }));
    }

    if (name === "type") {
      setSelectedType(value);
      setSelectedTransaction((prev) => ({
        ...prev,
        type: value,
        category: "", // Reset category when type changes
      }));
    }

    setSelectedTransaction((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (selectedAccount && selectedType) {
      let categories = [];

      if (selectedType === "SAVINGS") {
        categories = selectedAccount.savingCategories;
      } else if (selectedType === "EXPENSE") {
        categories = selectedAccount.expenseCategories;
      } else if (selectedType === "INCOME") {
        categories = ["Salary", "Interest","Refund","Other"]; // Fixed categories for INCOME
      }

      setFilteredCategories(categories || []);
    } else {
      setFilteredCategories([]); // Reset if no account/type selected
    }
  }, [selectedAccount, selectedType]);

  const handleSubmit = () => {
    if (!selectedTransaction) return;

    const transactionDateUTC = new Date(selectedTransaction.transactionDate).toISOString();

    const transactionData = {
      account: { id: selectedTransaction.accountId },
      amount: Number(selectedTransaction.amount),
      type: selectedTransaction.type,
      category: selectedTransaction.category,
      description: selectedTransaction.description,
      transactionDate: transactionDateUTC,
    };

    if (selectedTransaction.id) {
      dispatch(updateTransaction({ id: selectedTransaction.id, data: transactionData }));
    } else {
      dispatch(createTransaction(transactionData));
    }

    handleClose();
  };

  const handleDelete = (id) => {
    dispatch(deleteTransaction(id))
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenCSVDialog = () => {
    setOpenCSVDialog(true);
  };

  const handleCloseCSVDialog = () => {
    setSelectedCSVFile(null);
    setSelectedCSVAccount("");
    setOpenCSVDialog(false);
  };

  const handleCSVFileChange = (event) => {
    setSelectedCSVFile(event.target.files[0]);
  };

  const handleCSVUpload = () => {
    if (!selectedCSVFile || !selectedCSVAccount) {
      alert("Please select an account and a CSV file.");
      return;
    }

    Papa.parse(selectedCSVFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        let counter = 0; // Counter to increment time

        const transactionsData = results.data.map((row) => {
          // Parse "Tran Date" in DD-MM-YYYY format
          const dateParts = row["Tran Date"].split("-");
          const parsedDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T00:00:00Z`);

          // Validate date
          if (isNaN(parsedDate.getTime())) {
            console.error("Invalid date found in row:", row["Tran Date"]);
            return null; // Skip invalid rows
          }

          // Increment time component to preserve order
          parsedDate.setSeconds(parsedDate.getSeconds() + counter);
          counter++;

          return {
            account: { id: selectedCSVAccount },
            amount: row.Debit ? Number(row.Debit) : Number(row.Credit),
            type: row.Debit ? "EXPENSE" : "INCOME",
            category: row.Category,
            description: row.Particulars,
            transactionDate: parsedDate.toISOString(),
          };
        }).filter(Boolean); // Remove null values from invalid rows

        // Sort transactions by transactionDate before storing them
        transactionsData.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));

        transactionsData.forEach((transaction) => {
          dispatch(createTransaction(transaction));
        });

        handleCloseCSVDialog();
      },
    });
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
      {/* Month Selector - Moved to Top Right */}
      {/* Add Transaction Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3, position: "relative"  }}>
        {/* Styled Button */}
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen(null)}
            sx={{
              background: "linear-gradient(90deg, #5c6bc0, #7986cb)",
              color: "white",
              borderRadius: "12px",
              padding: "10px 24px",
              textTransform: "none",
              fontSize: "16px",
              mr: 2,
              fontWeight: "bold",
              boxShadow: "0px 5px 15px rgba(92, 107, 192, 0.3)",
              transition: "0.3s ease-in-out",
              "&:hover": {
                background: "linear-gradient(90deg, #3f51b5, #5c6bc0)",
                transform: "scale(1.05)"
              }
            }}
        >
          Add Transaction
        </Button>

        <Button variant="contained" startIcon={<UploadFileIcon />} onClick={handleOpenCSVDialog}
                sx={{
                  background: "linear-gradient(90deg, #5c6bc0, #7986cb)",
                  color: "white",
                  borderRadius: "12px",
                  padding: "10px 24px",
                  textTransform: "none",
                  fontSize: "16px",
                  mr: 2,
                  fontWeight: "bold",
                  boxShadow: "0px 5px 15px rgba(92, 107, 192, 0.3)",
                  transition: "0.3s ease-in-out",
                  "&:hover": {
                    background: "linear-gradient(90deg, #3f51b5, #5c6bc0)",
                    transform: "scale(1.05)"
                  }
                }}>
          Upload CSV
        </Button>

       {/* Month Dropdown */}
<Select
  value={selectedMonthNum}
  onChange={(e) => setSelectedMonthNum(parseInt(e.target.value))}
  sx={{
    width: 150,
    background: "linear-gradient(135deg, #fff, #fce4ec)",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    mr: 2,
    "& .MuiSelect-select": { padding: "10px", fontWeight: "bold", color: "#333" }
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
    width: 120,
    background: "linear-gradient(135deg, #fff, #fce4ec)",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    mr: 2,
    "& .MuiSelect-select": { padding: "10px", fontWeight: "bold", color: "#333" }
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
    width: 150,
    background: "linear-gradient(135deg, #fff, #fce4ec)",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    "& .MuiSelect-select": {
      padding: "10px",
      fontWeight: "bold",
      color: "#333",
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

      {/* Transactions Table */}
      <Paper sx={{ flexGrow: 1, display: "flex", flexDirection: "column", borderRadius: "10px", overflow: "hidden" }}>
        <TableContainer sx={{ flexGrow: 1, overflow: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1E88E5" }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                    sx={{ backgroundColor: "#3949ab", color: "white", fontWeight: "bold", textAlign: "left" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {column.label}

                      {/* Show FilterDropdown only for "Type" column */}
                      {column.label === "TYPE" && (
                          <FilterDropdown
                              options={typeOptions}
                              selected={typeFilter}
                              onChange={setTypeFilter}
                          />
                      )}

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
              (transactions).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow
                  key={row.id} 
                  hover 
                  sx={{ backgroundColor: index % 2 === 0 ? "#f5f5f5" : "white", "&:hover": { backgroundColor: "#e3f2fd" } }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.id === "actions" ? (
                        <>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleOpen(row)}><EditIcon color="primary" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDelete(row.id)}><DeleteIcon color="error" /></IconButton>
                          </Tooltip>
                        </>
                      ) : column.id === "account" ? (
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
          rowsPerPageOptions={[10]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Transaction Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditMode ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        <DialogContent>
          <TextField
              select
              label="Account"
              name="account"
              fullWidth
              margin="normal"
              value={selectedTransaction?.accountId || ""}
              onChange={handleChange}
          >
            {accounts.map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.name}
                </MenuItem>
            ))}
          </TextField>
          <TextField label="Amount" name="amount" type="number" fullWidth margin="normal" value={selectedTransaction?.amount || ""} onChange={handleChange} />
          <TextField select label="Type" name="type" fullWidth margin="normal" value={selectedTransaction?.type || ""} onChange={handleChange}>
            <MenuItem value="INCOME">INCOME</MenuItem>
            <MenuItem value="SAVINGS">SAVINGS</MenuItem>
            <MenuItem value="EXPENSE">EXPENSE</MenuItem>
          </TextField>
          <TextField
              select
              label="Category"
              name="category"
              fullWidth
              margin="normal"
              value={selectedTransaction?.category || ""}
              onChange={handleChange}
          >
            {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                ))
            ) : (
                <MenuItem disabled>No categories available</MenuItem>
            )}
          </TextField>
          <TextField label="Description" name="description" fullWidth margin="normal" value={selectedTransaction?.description || ""} onChange={handleChange} />
          <TextField
              label="Transaction Date"
              name="transactionDate"
              type="datetime-local"
              fullWidth
              margin="normal"
              value={selectedTransaction?.transactionDate || ""}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true, // Ensures the label doesn't overlap with the input value
              }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">{isEditMode ? "Update" : "Submit"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCSVDialog} onClose={handleCloseCSVDialog}>
        <DialogTitle>Upload Transactions via CSV</DialogTitle>
        <DialogContent>
          <Select
              fullWidth
              value={selectedCSVAccount}
              onChange={(e) => setSelectedCSVAccount(e.target.value)}
              displayEmpty
          >
            <MenuItem value="" disabled>Select Account</MenuItem>
            {accounts.map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
            ))}
          </Select>
          <input type="file" accept=".csv" onChange={handleCSVFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCSVDialog}>Cancel</Button>
          <Button onClick={handleCSVUpload} variant="contained" color="primary">Upload</Button>
        </DialogActions>
      </Dialog>
    </Box>

    </Box>
      </Box>
  );
}
