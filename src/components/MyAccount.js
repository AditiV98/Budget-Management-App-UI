import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid, Chip,DialogActions } from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WalletIcon from '@mui/icons-material/Wallet';
import MoneyIcon from '@mui/icons-material/Money';
import Alert from '@mui/material/Alert';
import { 
 Button, Dialog, DialogTitle, DialogContent, 
  TextField, Select, MenuItem, InputLabel, FormControl,IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { createAccount, fetchAccounts,deleteAccount, updateAccount} from "../features/accounts/accountSlice";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PermanentDrawerLeft from "./PermanentDrawerLeft";
import Sidebar from "./PermanentDrawerLeft";


const drawerWidth = 240;
const pageBackground = "linear-gradient(to bottom, #E3F2FD, #FCE4EC)";

const accountColors = {
  BANK: "linear-gradient(135deg, #D4E5FF, #A9C5FF)",
  'CREDIT CARD': "linear-gradient(135deg, #FFC1C1, #FF8A80)",
  CASH: "linear-gradient(135deg, #C8E6C9, #A5D6A7)",
  WALLET: "linear-gradient(135deg, #FFECB3, #FFD54F)",
};

const accountTypes = ["BANK", "CASH", "WALLET", "CREDIT CARD"];
const expenseCategories = [
  "Housing", "Utilities", "Groceries", "Transportation", "Education",
  "Healthcare", "Loan & Debt Payments", "Dining Out", "Entertainment",
  "Shopping", "Travel", "Gifts & Donations", "Fitness & Wellness",
  "Childcare", "Home Maintenance", "Pet Care", "Self-Development","Tax","Other"
];
const savingsCategories = ["FD", "Mutual Funds", "Stocks", "Gold ETFs","Other"];

const MyAccount = () => {
  const dispatch = useDispatch();
  const { accounts, status, error } = useSelector((state) => state.account || []);
    const [openErrorDialog, setOpenErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editedAccount, setEditedAccount] = useState(null);

    const [open, setOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "", type: "BANK", balance: "", expenseCategories: [], savingCategories: []
  });

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  useEffect(() => {
      if (error) {
            setErrorMessage(error.error?.message || "An unknown error occurred");
            setOpenErrorDialog(true);
      }}, [error]);

  const handleAddAccount = () => {
    dispatch(createAccount(newAccount));
    setOpen(false);
  };

    const handleEdit = (account) => {
        setEditedAccount({ ...account });
        setOpenEditDialog(true);
    };

    const handleSave = () => {
        dispatch(updateAccount({ id: editedAccount.id, data: editedAccount }));
        setOpenEditDialog(false);
    };

  return (
      <Box sx={{ display: "flex" }}>
          <Sidebar />
          <Box
              component="main"
              sx={{
                  flexGrow: 1,
                  px: 3,
                  pt: 10,
                  background: pageBackground,
                  minHeight: "100vh",
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

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{
            background: "linear-gradient(90deg, #5c6bc0, #7986cb)",
            color: "white",
            borderRadius: "10px",
            padding: "8px 20px",
            textTransform: "none",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "0.3s",
            "&:hover": { background: "linear-gradient(90deg, #3f51b5, #5c6bc0)", transform: "scale(1.05)" }
          }}
        >
          Add Account
        </Button>
      </Box>

       {/* Add Account Dialog */}
        <Dialog
            open={open} onClose={() => setOpen(false)}
            sx={{
                "& .MuiBackdrop-root": { backdropFilter: "blur(8px)" }, // Blurred background
                "& .MuiPaper-root": {
                    borderRadius: "12px",
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(10px)",
                }
            }}
            fullWidth
        >

        <DialogTitle>Add New Account</DialogTitle>
        <DialogContent>
          <TextField 
            label="Account Name" fullWidth margin="dense"
            value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={newAccount.type}
              onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
            >
              {accountTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </Select>
          </FormControl>

            <TextField
                label="Initial Balance (₹)" type="number" fullWidth margin="dense"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
            />

          {/* Expense Categories */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Expense Categories</InputLabel>
            <Select
              multiple
              value={newAccount.expenseCategories}
              onChange={(e) => setNewAccount({ ...newAccount, expenseCategories: e.target.value })}
              renderValue={(selected) => selected.join(", ")}
            >
              {expenseCategories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>
          {/* <Box sx={{ display: "flex", gap: 1, alignItems: "center", marginTop: 2 }}>
            <TextField 
              label="Custom Expense Category" fullWidth 
              value={customExpense} 
              onChange={(e) => setCustomExpense(e.target.value)}
            />
            <Button variant="contained" onClick={handleAddCustomExpense}>Add</Button>
          </Box> */}

          {/* Saving Categories */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Saving Categories</InputLabel>
            <Select
              multiple
              value={newAccount.savingCategories}
              onChange={(e) => setNewAccount({ ...newAccount, savingCategories: e.target.value })}
              renderValue={(selected) => selected.join(", ")}
            >
              {savingsCategories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>
          {/* <Box sx={{ display: "flex", gap: 1, alignItems: "center", marginTop: 2 }}>
            <TextField 
              label="Custom Saving Category" fullWidth 
              value={customSaving} 
              onChange={(e) => setCustomSaving(e.target.value)}
            />
            <Button variant="contained" onClick={handleAddCustomSaving}>Add</Button>
          </Box> */}

          <Button fullWidth variant="contained" color="primary" sx={{ marginTop: 2 }} onClick={handleAddAccount}>
            Save Account
          </Button>
        </DialogContent>
      </Dialog>

      {status === "loading" ? (
        <p>Loading accounts...</p>
      )  : (
      <Grid container spacing={3}>
          {Array.isArray(accounts) && accounts?.length > 0 ? (
      accounts.map((acc) => (
          <Grid item xs={12} sm={6} md={4}>
              <Card
                  sx={{
                      background: accountColors[acc.type] || "#F3E5F5",
                      color: "#333",
                      textAlign: "center",
                      p: 3,
                      borderRadius: "16px",
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.3s",
                      "&:hover": { transform: "scale(1.05)" },
                      position: "relative",
                  }}
              >
                  {/* Edit & Delete Buttons in Top Right */}
                  <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <IconButton onClick={() => handleEdit(acc)} color="primary">
                          <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => dispatch(deleteAccount(acc.id))} color="error">
                          <DeleteIcon />
                      </IconButton>
                  </Box>

                  <CardContent>
                      {/* Account Name & Type */}
                      <Typography variant="h6" sx={{ fontWeight: "600" }}>
                          {acc.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {acc.type}
                      </Typography>

                      {/* Account Balance */}
                      <Typography
                          variant="h5"
                          sx={{
                              fontWeight: "bold",
                              color: acc.balance < 500 ? "#D32F2F" : "#388E3C",
                              mt: 1,
                          }}
                      >
                          ₹{acc.balance.toLocaleString()}
                      </Typography>

                      {/* Categories Section */}
                      {[
                          { title: "Expenses", categories: acc.expenseCategories, color: "#BBDEFB", textColor: "#1A237E" },
                          { title: "Savings", categories: acc.savingCategories, color: "#C8E6C9", textColor: "#1B5E20" },
                      ].map((section, index) => (
                          <Box key={index} sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                                  {section.title}
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                                  {section.categories.length > 0 ? (
                                      section.categories.map((cat, idx) => (
                                          <Chip key={idx} label={cat} sx={{ background: section.color, color: section.textColor }} />
                                      ))
                                  ) : (
                                      <Typography variant="body2" color="textSecondary">
                                          No categories assigned
                                      </Typography>
                                  )}
                              </Box>
                          </Box>
                      ))}
                  </CardContent>
              </Card>
          </Grid>
))
          ) : (
              <Typography variant="body2" color="textSecondary" sx={{ width: "100%", textAlign: "center" }}>
                  No accounts found.
              </Typography>
          )}

          {/* Edit Account Dialog */}
          <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
              <DialogTitle>Edit Account</DialogTitle>
              <DialogContent>
                  {editedAccount && (
                      <>
                          <TextField label="Account Name" value={editedAccount.name}
                                     onChange={(e) => setEditedAccount({ ...editedAccount, name: e.target.value })} fullWidth/>
                          <FormControl fullWidth>
                              <InputLabel>Type</InputLabel>
                              <Select value={editedAccount.type}
                                      onChange={(e) => setEditedAccount({ ...editedAccount, type: e.target.value })}>
                                  {accountTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                              </Select>
                          </FormControl>
                          <TextField label="Balance" type="number" value={editedAccount.balance}
                                     onChange={(e) => setEditedAccount({ ...editedAccount, balance: parseFloat(e.target.value) })} fullWidth/>
                          <FormControl fullWidth>
                              <InputLabel>Expense Categories</InputLabel>
                              <Select multiple value={editedAccount.expenseCategories}
                                      onChange={(e) => setEditedAccount({ ...editedAccount, expenseCategories: e.target.value })}
                                      renderValue={(selected) => selected.join(", ")}>
                                  {expenseCategories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                              </Select>
                          </FormControl>
                          <FormControl fullWidth>
                              <InputLabel>Saving Categories</InputLabel>
                              <Select multiple value={editedAccount.savingCategories}
                                      onChange={(e) => setEditedAccount({ ...editedAccount, savingCategories: e.target.value })}
                                      renderValue={(selected) => selected.join(", ")}>
                                  {savingsCategories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                              </Select>
                          </FormControl>
                      </>
                  )}
              </DialogContent>
              <DialogActions>
                  <Button onClick={() => setOpenEditDialog(false)} color="secondary">Cancel</Button>
                  <Button onClick={handleSave} color="primary">Save Changes</Button>
              </DialogActions>
          </Dialog>

      </Grid>
        )}
    </Box>
      </Box>
  );
};

export default MyAccount;
