import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Tooltip, IconButton, Select } from "@mui/material"
import PermanentDrawerLeft from "./PermanentDrawerLeft";
import React, { useEffect, useState } from "react";
import Sidebar from "./PermanentDrawerLeft";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecurringTransaction,deleteRecurringTransaction,updateRecurringTransaction,createRecurringTransaction} from "../features/recurringTransactions/recurringTransactionsSlice";
import { fetchAccounts } from "../features/accounts/accountSlice";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { format,toZonedTime } from "date-fns-tz";

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
    { id: "frequency", label: "FREQUENCY", minWidth: 150 },
    { id: "customDays", label: "CUSTOM DAYS", minWidth: 150 },
    { id: "startDate", label: "START DATE", minWidth: 150 },
    { id: "endDate", label: "END DATE", minWidth: 150 },
    { id: "lastRun", label: "LAST RUN", minWidth: 150 },
    { id: "nextRun", label: "NEXT RUN", minWidth: 150 },
    { id: "createdAt", label: "CREATED AT", minWidth: 150 },
    { id: "actions", label: "ACTIONS", minWidth: 100 },
  ];
  
export default function RecurringTransaction(){
    const dispatch = useDispatch();
    const recurringTransactions = useSelector((state)=>state.recurringTransactions?.recurringTransactions) || [];
    const accounts = useSelector((state)=>state.account?.accounts) || [];
    const [page,setPage]=useState(0);
    const [rowsPerPage,setRowsPerPage]=useState(12);
    const [open,setOpen]=useState(false);
    const [isEditMode,setIsEditMode]=useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchRecurringTransaction());
  }, [dispatch]);

    useEffect(()=>{
        if (accounts.length ===0){
            dispatch(fetchAccounts());
        }
    },[dispatch,accounts]);

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

        const startDateUTC=  selectedTransaction.startDate
    ? new Date(selectedTransaction.startDate).toISOString()
    : null;

    const endDateUTC =selectedTransaction.endDate ? new Date(selectedTransaction.endDate).toISOString() : null;
    
        const transactionData = {
          account: { id: selectedTransaction.accountId },
          amount: Number(selectedTransaction.amount),
          type: selectedTransaction.type,
          category: selectedTransaction.category,
          description: selectedTransaction.description,
          frequency: selectedTransaction.frequency,
          customDays:Number(selectedTransaction.customDays),
          startDate: startDateUTC,
          endDate:endDateUTC,
        };
    
        if (selectedTransaction.id) {
          dispatch(updateRecurringTransaction({ id: selectedTransaction.id, data: transactionData }));
        } else {
          dispatch(createRecurringTransaction(transactionData));
        }
    
        handleClose();
      };
    
      const handleOpen = (transaction = null) => {
        if (transaction) {
          setIsEditMode(true);
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
            categories = ["Salary", "Interest", "Refund", "Other"];
          }
          setFilteredCategories(categories);
        } else {
        setIsEditMode(false);
          setSelectedTransaction(null);
          setSelectedAccount(null);
          setSelectedType("");
          setFilteredCategories([]);
        }

        setOpen(true);
      };
      
      const handleClose = () => {
        document.activeElement.blur();
        setSelectedTransaction(null);
        setOpen(false);
      };

      const handleDelete = (id) => {
        dispatch(deleteRecurringTransaction(id))
      };
    
      const handleChangePage = (_, newPage) => setPage(newPage);
    
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
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, flexWrap: 'wrap' }}>
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
      </Box>

      <Paper sx={{ flexGrow: 1, display: "flex", flexDirection: "column", borderRadius: "10px", overflow: "hidden",fontSize: "0.75rem",p:1 }}>
        <TableContainer sx={{ flexGrow: 1, overflow: "auto",borderRadius: "10px" }}>
        <Table stickyHeader size="small"> 
              <TableHead>
              <TableRow sx={{ backgroundColor: "#1E88E5" }}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{ minWidth: column.minWidth }}
                      sx={{ backgroundColor: "#3949ab", color: "white", fontWeight: "bold", textAlign: "left" ,fontSize: "0.7rem",py: 1}}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {column.label}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {recurringTransactions.length > 0 ? (
                  recurringTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#f5f5f5" : "white",
                          "&:hover": { backgroundColor: "#e3f2fd" },
                        }}
                      >
                        {columns.map((column) => (
                          <TableCell key={column.id} sx={{ fontSize: "0.65rem", py: 1 }}>
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
                              row.account.name
                            ) : column.id === "startDate" ||
                              column.id === "endDate" ||
                              column.id === "lastRun" ||
                              column.id === "nextRun" ||
                              column.id === "createdAt" ? (
                              formatDate(row[column.id])
                            ) : (
                              row[column.id]
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                ) : (
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
            count={recurringTransactions.length}
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

      <Dialog open={open} onClose={handleClose} PaperProps={{
    sx: {
      width: '500px', // adjust as needed
      maxWidth: '90%', // responsive limit
      fontSize: '12px',
      height:'600px'
    },
  }}>
         <DialogTitle sx={{ fontSize: '16px' }}>{isEditMode ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
       <DialogContent sx={{ px: 2, fontSize: '8px' }}>
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
          label="Description" name="description" fullWidth margin="normal" value={selectedTransaction?.description || ""} onChange={handleChange} />
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
          select label="Frequency" name="frequency" fullWidth margin="normal" value={selectedTransaction?.frequency || ""} onChange={handleChange}>
  <MenuItem value="DAILY" sx={{ fontSize: '12px' }}>DAILY</MenuItem>
  <MenuItem value="WEEKLY" sx={{ fontSize: '12px' }}>WEEKLY</MenuItem>
  <MenuItem value="MONTHLY" sx={{ fontSize: '12px' }}>MONTHLY</MenuItem>
  <MenuItem value="CUSTOM" sx={{ fontSize: '12px' }}>CUSTOM</MenuItem>
</TextField>

{selectedTransaction?.frequency === "CUSTOM" && (
  <TextField
    label="Custom Days"
    name="customDays"
    type="number"
    fullWidth
    margin="normal"
    value={selectedTransaction?.customDays || ""}
    onChange={handleChange}
  />
)}

         
          <TextField
              label="Start Date"
              name="startDate"
              type="datetime-local"
              fullWidth
              margin="normal"
              value={selectedTransaction?.startDate || ""}
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
          <TextField
              label="End Date"
              name="endDate"
              type="datetime-local"
              fullWidth
              margin="normal"
              value={selectedTransaction?.endDate || ""}
              onChange={handleChange}
              InputLabelProps={{
                shrink:true,
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
      </Box>
    </Box>
  </Box>

    )
}