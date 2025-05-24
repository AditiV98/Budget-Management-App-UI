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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { fetchSavings} from "../features/saving/savingSlice";
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';

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
  { id: "withdrawFrom", label: "WITHDRAW FROM", minWidth: 150 },
  { id: "actions", label: "ACTIONS", minWidth: 100 },
];

const typeOptions = [
  { label: "Income", value: "INCOME" },
  { label: "Expense", value: "EXPENSE" },
  { label: "Savings", value: "SAVINGS" },
  { label: "Withdraw", value: "WITHDRAW" },
  { label: "SelfTransfer", value: "SELF TRANSFER" },
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
  const { transactions, error } = useSelector((state) => state.transaction);
  const accounts = useSelector((state) => state.account?.accounts) || [];
  const savings = useSelector((state) => state.savings?.savings) || [];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
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

  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const accountOptions = accounts.map((acc) => ({
    label: acc.name,
    value: acc.id,
  }));
  
  const [accountFilter, setAccountFilter] = useState([]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error); 
      setOpenErrorDialog(true);
    }
  }, [error]);

  useEffect(() => {
    if (selectedMonth?.startDate && selectedMonth?.endDate) {
      const params = new URLSearchParams({
        startDate: selectedMonth.startDate,
        endDate: selectedMonth.endDate,
      });

      if (typeFilter?.length) {
        typeFilter.forEach((type) => params.append("type", type));
      }

      if (categoryFilter?.length) {
        categoryFilter.forEach((category) => params.append("category", category));
      }

      if (accountFilter?.length) {
        accountFilter.forEach((acc) => params.append("accountID", acc));
      }

      dispatch(fetchTransactions(params));
    }
  }, [dispatch, selectedMonth, typeFilter, categoryFilter,accountFilter]);

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

  useEffect(() => {
    if (savings.length === 0) { 
      dispatch(fetchSavings());
    }
  }, [dispatch, savings]);

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
      if (transaction.type === "SAVINGS" || transaction.type === "WITHDRAW") {
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
    }else if (name === "type") {
      setSelectedType(value);
      setSelectedTransaction((prev) => ({
        ...prev,
        type: value,
        category: "", // Reset category when type changes
      }));
    }else if (name==="withdrawFrom"){
      const saving = savings.find((s) => s.id === Number(value));

      if (saving) {
        setSelectedTransaction((prev) => ({
          ...prev,
          withdrawFrom: saving.id,                      // for display in Select
          withdrawFromTransactionID: saving.transactionID,  // for backend submission
        }));
      }
    }else if (name.includes(".")) {
      const [parent, child] = name.split(".");
  setSelectedTransaction((prev) => ({
    ...prev,
    [parent]: {
      ...(prev[parent] || {}), // ensure it's not undefined
      [child]: value,
    },
  }));
    } else{
      setSelectedTransaction((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    if (selectedAccount && selectedType) {
      let categories = [];

      if (selectedType === "SAVINGS" || selectedType === "WITHDRAW" ) {
        categories = selectedAccount.savingCategories;
      } else if (selectedType === "EXPENSE") {
        categories = selectedAccount.expenseCategories;
      } else if (selectedType === "INCOME") {
        categories = ["Salary", "Interest","Refund","Other"]; // Fixed categories for INCOME
      } else if (selectedType === "SELF TRANSFER"){
        categories = ["Self Transfer"];
      }

      setFilteredCategories(categories || []);
    } else {
      setFilteredCategories([]); // Reset if no account/type selected
    }
  }, [selectedAccount, selectedType]);

  const handleSubmit = () => {
    if (!selectedTransaction) return;

    const transactionDateUTC =selectedTransaction.transactionDate ? new Date(selectedTransaction.transactionDate).toISOString() : null;
    
    const transactionData = {
      account: { id: selectedTransaction.accountId },
      amount: Number(selectedTransaction.amount),
      type: selectedTransaction.type,
      category: selectedTransaction.category,
      description: selectedTransaction.description,
      transactionDate: transactionDateUTC,
      withdrawFrom:selectedTransaction.withdrawFromTransactionID
    };

    if (selectedTransaction.type === "SELF TRANSFER" && selectedTransaction.metaData) {
      transactionData.metaData = {
        transferTo: selectedTransaction.metaData.transferTo,
      };
    }

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

    console.log("came inside csv upload")

    Papa.parse(selectedCSVFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        let counter = 0; // Counter to increment time

        const transactionsData = results.data.map((row) => {
          console.log(row)
          
          const tranDateStr = row.TransactionDate;
if (!tranDateStr) return null;

// Parse "01 May 2023, 05:30 AM" into a Date object
const parsedDate = new Date(tranDateStr);

// Validate date
if (isNaN(parsedDate.getTime())) {
  return null; // Skip invalid rows
}

          // Increment time component to preserve order
          parsedDate.setSeconds(parsedDate.getSeconds() + counter);
          counter++;

           // 🔍 Match account name from CSV with accountsList
        const matchingAccount = accounts.find(
          (account) => account.name.toLowerCase().trim() === row.Account.toLowerCase().trim()
        );

        if (!matchingAccount) {
          console.warn(`Account not found for: ${row.Account}`);
          return null;
        }

        console.log(matchingAccount)
          return {
            account: { id: matchingAccount.id },
            amount: parseFloat(row.Amount),
            type: row.Type,
            category: row.Category,
            description: row.Description,
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

  const handleCSVDownload = () => {
    if (!transactions?.length) {
      return 
    }
  
    const csvData = transactions.map(txn => ({
      Account: txn?.account?.name || "",
      Amount: txn.amount,
      Type: txn.type,
      Category: txn.category,
      Description: txn.description,
      TransactionDate: formatDate(txn.transactionDate),
      CreatedAt: formatDate(txn.createdAt),
    }));
  
    const csv = Papa.unparse(csvData);
  
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

<Dialog
            open={openErrorDialog}
            onClose={() => setOpenErrorDialog(false)}
            sx={{
                "& .MuiBackdrop-root": { backdropFilter: "blur(8px)" }, // Blurred background
                "& .MuiPaper-root": {
                    borderRadius: "12px",
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(10px)",
                    position: "relative" // Needed for absolute positioning of CloseIcon
                }
            }}
        >
            {/* Close Button at Top Right */}
            <IconButton
                onClick={() => setOpenErrorDialog(false)}
                sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#666",
                    "&:hover": { color: "#000" }
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogTitle sx={{ fontWeight: "bold", color: "#333" }}>Error</DialogTitle>

            <DialogContent>
                <Alert severity="error"
                       sx={{
                           backgroundColor: "#ffecec",
                           color: "#d32f2f",
                           borderRadius: "8px"
                       }}
                >
                    {errorMessage}
                </Alert>
            </DialogContent>
        </Dialog>

    <Box sx={{ height: "calc(100vh - 80px)", display: "flex", flexDirection: "column"}}>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, flexWrap: 'wrap', position: 'relative' }}>
        {/* Styled Button */}
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen(null)}
            sx={{
              background: "linear-gradient(90deg, #5c6bc0, #7986cb)",
              color: "white",
              borderRadius: "6px",               // Match select's border radius
              height: "30px",                    // Match select's height
              minWidth: "110px",                 // Optional: similar to Select width
              padding: "2px 8px",                // Smaller padding
              textTransform: "none",
              fontSize: "0.75rem",               // Match Select text
              fontWeight: "bold",
              mr: 2,
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
                borderRadius: "6px",               // Match select's border radius
                height: "30px",                    // Match select's height
                minWidth: "110px",                 // Optional: similar to Select width
                padding: "2px 8px",                // Smaller padding
                textTransform: "none",
                fontSize: "0.75rem",               // Match Select text
                fontWeight: "bold",
                mr: 2,
                boxShadow: "0px 5px 15px rgba(92, 107, 192, 0.3)",
                transition: "0.3s ease-in-out",
                "&:hover": {
                  background: "linear-gradient(90deg, #3f51b5, #5c6bc0)",
                  transform: "scale(1.05)"
                }
              }}>
          Upload CSV
        </Button>

        <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={handleCSVDownload}
               sx={{
                background: "linear-gradient(90deg, #5c6bc0, #7986cb)",
                color: "white",
                borderRadius: "6px",               // Match select's border radius
                height: "30px",                    // Match select's height
                minWidth: "110px",                 // Optional: similar to Select width
                padding: "2px 8px",                // Smaller padding
                textTransform: "none",
                fontSize: "0.75rem",               // Match Select text
                fontWeight: "bold",
                mr: 2,
                boxShadow: "0px 5px 15px rgba(92, 107, 192, 0.3)",
                transition: "0.3s ease-in-out",
                "&:hover": {
                  background: "linear-gradient(90deg, #3f51b5, #5c6bc0)",
                  transform: "scale(1.05)"
                }
              }}>
          Download CSV
        </Button>

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

      {/* Transactions Table */}
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
                    <Box sx={{ display: "flex", alignItems: "center"}}>
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

{column.label === "ACCOUNT" && (
  <FilterDropdown
    options={accountOptions}
    selected={accountFilter}
    onChange={setAccountFilter}
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
                    <TableCell key={column.id} sx={{ fontSize: "0.65rem", py: 1.1 }}>
                      {column.id === "actions" ? (
                        <>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleOpen(row)} sx={{ p: 0.5 }}><EditIcon fontSize="small" color="primary" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDelete(row.id)} sx={{ p: 0.5 }}><DeleteIcon fontSize="small" color="error" /></IconButton>
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
                    <TableCell colSpan={columns.length} align="center" sx={{ fontSize: "0.65rem" }}>
                      No transactions available.
                    </TableCell>
                  </TableRow>

                )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[12]}
          component="div"
          count={transactions?.length ?? 0}
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

      {/* Add/Edit Transaction Modal */}
      <Dialog open={open} onClose={handleClose} PaperProps={{
    sx: {
      width: '500px', // adjust as needed
      maxWidth: '90%', // responsive limit
      fontSize: '12px',
      height:'600px'
    },
  }}>
        <DialogTitle sx={{ fontSize: '16px' }}>{isEditMode ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        <DialogContent sx={{ px: 2, py: 1, fontSize: '8px' }}>
          <TextField
              select
              label="Account"
              name="account"
              fullWidth
              margin="normal"
              value={selectedTransaction?.accountId || ""}
              onChange={handleChange}
              InputLabelProps={{
                sx: {
                  fontSize: '12px',
                  "&.Mui-focused": { fontSize: '12px' },
                  "&.MuiInputLabel-shrink": { fontSize: '12px' },
                }
              }}
              sx={{
                fontSize: '12px',
                "& .MuiSelect-select": {
                  fontSize: '12px',   // font size of selected value inside select input
                },
                "& .MuiInputBase-input": {
                  fontSize: '12px',   // fallback for normal inputs
                },
              }} 
          >
            {accounts.map((acc) => (
                <MenuItem key={acc.id} value={acc.id} sx={{ fontSize: '12px' }}>
                  {acc.name}
                </MenuItem>
            ))}
          </TextField>
          <TextField 
          InputLabelProps={{
            sx: {
              fontSize: '12px',
              "&.Mui-focused": { fontSize: '12px' },
              "&.MuiInputLabel-shrink": { fontSize: '12px' },
            }
          }}
          sx={{
            fontSize: '12px',
            "& .MuiSelect-select": {
              fontSize: '12px',   // font size of selected value inside select input
            },
            "& .MuiInputBase-input": {
              fontSize: '12px',   // fallback for normal inputs
            },
          }} 
            label="Amount" name="amount" type="number" fullWidth margin="normal" value={selectedTransaction?.amount || ""} onChange={handleChange} />
          <TextField InputLabelProps={{
                sx: {
                  fontSize: '12px',
                  "&.Mui-focused": { fontSize: '12px' },
                  "&.MuiInputLabel-shrink": { fontSize: '12px' },
                }
              }}
              sx={{
                fontSize: '12px',
                "& .MuiSelect-select": {
                  fontSize: '12px',   // font size of selected value inside select input
                },
                "& .MuiInputBase-input": {
                  fontSize: '12px',   // fallback for normal inputs
                },
              }} 
           select label="Type" name="type" fullWidth margin="normal" value={selectedTransaction?.type || ""} onChange={handleChange}>
            <MenuItem value="INCOME" sx={{ fontSize: '12px' }}>INCOME</MenuItem>
            <MenuItem value="SAVINGS" sx={{ fontSize: '12px' }}>SAVINGS</MenuItem>
            <MenuItem value="EXPENSE" sx={{ fontSize: '12px' }}>EXPENSE</MenuItem>
            <MenuItem value="WITHDRAW" sx={{ fontSize: '12px' }}>WITHDRAW</MenuItem>
            <MenuItem value="SELF TRANSFER" sx={{ fontSize: '12px' }}>SELF TRANSFER</MenuItem>
          </TextField>
          <TextField
              select
              label="Category"
              name="category"
              fullWidth
              margin="normal"
              value={selectedTransaction?.category || ""}
              onChange={handleChange}
              InputLabelProps={{
                sx: {
                  fontSize: '12px',
                  "&.Mui-focused": { fontSize: '12px' },
                  "&.MuiInputLabel-shrink": { fontSize: '12px' },
                }
              }}
              sx={{
                fontSize: '12px',
                "& .MuiSelect-select": {
                  fontSize: '12px',   // font size of selected value inside select input
                },
                "& .MuiInputBase-input": {
                  fontSize: '12px',   // fallback for normal inputs
                },
              }} 
          >
            {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                    <MenuItem key={category} value={category} sx={{ fontSize: '12px' }}>
                      {category}
                    </MenuItem>
                ))
            ) : (
                <MenuItem disabled>No categories available</MenuItem>
            )}
          </TextField>
          {selectedTransaction?.type === "SELF TRANSFER" && (
  <TextField
    select
    label="Transfer To"
    name="metaData.transferTo"
    fullWidth
    margin="normal"
    value={selectedTransaction?.metaData?.transferTo || ""}
    onChange={handleChange}
    InputLabelProps={{
      sx: {
        fontSize: '12px',
        "&.Mui-focused": { fontSize: '12px' },
        "&.MuiInputLabel-shrink": { fontSize: '12px' },
      }
    }}
    sx={{
      fontSize: '12px',
      "& .MuiSelect-select": {
        fontSize: '12px',
      },
      "& .MuiInputBase-input": {
        fontSize: '12px',
      },
    }}
  >
    {accounts
      .filter((acc) => acc.id !== selectedTransaction?.accountId)
      .map((acc) => (
        <MenuItem key={acc.id} value={acc.id} sx={{ fontSize: '12px' }}>
          {acc.name}
        </MenuItem>
      ))}
  </TextField>
)}

          {selectedTransaction?.type === "WITHDRAW" && (
          <TextField
              select
              label="Withdraw From"
              name="withdrawFrom"
              fullWidth
              margin="normal"
              value={selectedTransaction?.withdrawFrom || ""}
              onChange={handleChange}
              InputLabelProps={{
                sx: {
                  fontSize: '12px',
                  "&.Mui-focused": { fontSize: '12px' },
                  "&.MuiInputLabel-shrink": { fontSize: '12px' },
                }
              }}
              sx={{
                fontSize: '12px',
                "& .MuiSelect-select": {
                  fontSize: '12px',   // font size of selected value inside select input
                },
                "& .MuiInputBase-input": {
                  fontSize: '12px',   // fallback for normal inputs
                },
              }} 
          >
             {savings.filter(s => s.category === selectedTransaction?.category).length > 0 ? (
    savings
      .filter(s => s.category === selectedTransaction?.category)
      .map(saving => (
        <MenuItem key={saving.id} value={saving.id} sx={{ fontSize: '12px' }}>
          {saving.account.name} - {saving.category} - {saving.amount}
        </MenuItem>
      ))
  ) : (
    <MenuItem disabled>No matching savings available</MenuItem>
  )}
          </TextField>
          )}
          <TextField 
          InputLabelProps={{
            sx: {
              fontSize: '12px',
              "&.Mui-focused": { fontSize: '12px' },
              "&.MuiInputLabel-shrink": { fontSize: '12px' },
            }
          }}
          sx={{
            fontSize: '12px',
            "& .MuiSelect-select": {
              fontSize: '12px',   // font size of selected value inside select input
            },
            "& .MuiInputBase-input": {
              fontSize: '12px',   // fallback for normal inputs
            },
          }} 
           label="Description" name="description" fullWidth margin="normal" value={selectedTransaction?.description || ""} onChange={handleChange} />
          <TextField
              label="Transaction Date"
              name="transactionDate"
              type="datetime-local"
              fullWidth
              margin="normal"
              value={selectedTransaction?.transactionDate || ""}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
                sx: {
                  fontSize: '12px',
                  "&.Mui-focused": { fontSize: '12px' },
                  "&.MuiInputLabel-shrink": { fontSize: '12px' },
                }
              }}
              sx={{
                fontSize: '12px',
                "& .MuiSelect-select": {
                  fontSize: '12px',   // font size of selected value inside select input
                },
                "& .MuiInputBase-input": {
                  fontSize: '12px',   // fallback for normal inputs
                },
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
