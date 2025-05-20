import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid, Chip,DialogActions,Divider } from "@mui/material";
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
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
    <Sidebar />
      <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: "auto",
            background: pageBackground,
            px: 1,
            pt: 8, // adjust based on AppBar height
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
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
          Add Account
        </Button>
      </Box>

       {/* Add Account Dialog */}
       <Dialog
  open={open}
  onClose={() => setOpen(false)}
  fullWidth
  sx={{
    "& .MuiBackdrop-root": { backdropFilter: "blur(8px)" },
    "& .MuiPaper-root": {
      borderRadius: "16px",
      boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(12px)",
    },
  }}
>
  <DialogTitle
    sx={{
      fontWeight: "bold",
      fontSize: "1.3rem",
      textAlign: "center",
      color: "#333",
    }}
  >
    Add New Account
  </DialogTitle>

  <DialogContent>
    <Box component="form" noValidate autoComplete="off" sx={{ px: 1 }}>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: "text.primary", fontWeight: 500 }}>
        Account Details
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Account Name"
            fullWidth
            value={newAccount.name}
            onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={newAccount.type}
              label="Type"
              onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
            >
              {accountTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Initial Balance (₹)"
            type="number"
            fullWidth
            value={newAccount.balance}
            onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" sx={{ mb: 1, color: "text.primary", fontWeight: 500 }}>
        Expense Categories
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Expense Categories</InputLabel>
        <Select
          multiple
          value={newAccount.expenseCategories}
          onChange={(e) => setNewAccount({ ...newAccount, expenseCategories: e.target.value })}
          renderValue={(selected) => selected.join(", ")}
        >
          {expenseCategories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" sx={{ mb: 1, color: "text.primary", fontWeight: 500 }}>
        Saving Categories
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Saving Categories</InputLabel>
        <Select
          multiple
          value={newAccount.savingCategories}
          onChange={(e) => setNewAccount({ ...newAccount, savingCategories: e.target.value })}
          renderValue={(selected) => selected.join(", ")}
        >
          {savingsCategories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 4, py: 1.2, fontWeight: "bold" }}
        onClick={handleAddAccount}
      >
        Save Account
      </Button>
    </Box>
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
                          <EditIcon fontSize="small"/>
                      </IconButton>
                      <IconButton onClick={() => dispatch(deleteAccount(acc.id))} color="error">
                          <DeleteIcon fontSize="small"/>
                      </IconButton>
                  </Box>

                  <CardContent>
                      {/* Account Name & Type */}
                      <Typography variant="h6" sx={{ fontWeight: "600", fontSize: "0.95rem"}}>
                          {acc.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 ,fontSize: "0.70rem"}}>
                          {acc.type}
                      </Typography>

                      {/* Account Balance */}
                      <Typography
                          variant="h5"
                          sx={{
                              fontWeight: "bold",
                              color: acc.balance < 500 ? "#D32F2F" : "#388E3C",
                              mt: 1,
                              fontSize: "0.95rem"
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
                              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 ,fontSize: "0.80rem"}}>
                                  {section.title}
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                                  {section.categories.length > 0 ? (
                                      section.categories.map((cat, idx) => (
                                          <Chip key={idx} label={cat} sx={{ background: section.color, color: section.textColor,fontSize: "0.60rem" }} />
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
          <Dialog
  open={openEditDialog}
  onClose={() => setOpenEditDialog(false)}
  fullWidth
  sx={{
    "& .MuiBackdrop-root": { backdropFilter: "blur(8px)" },
    "& .MuiPaper-root": {
      borderRadius: "16px",
      boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(12px)",
    },
  }}
>
  <DialogTitle
    sx={{
      fontWeight: "bold",
      fontSize: "1.3rem",
      textAlign: "center",
      color: "#333",
    }}
  >
    Edit Account
  </DialogTitle>

  <DialogContent>
    {editedAccount && (
      <Box component="form" noValidate autoComplete="off" sx={{ px: 1 }}>
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: "text.primary", fontWeight: 500 }}>
          Account Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Account Name"
              fullWidth
              value={editedAccount.name}
              onChange={(e) => setEditedAccount({ ...editedAccount, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={editedAccount.type}
                label="Type"
                onChange={(e) => setEditedAccount({ ...editedAccount, type: e.target.value })}
              >
                {accountTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Balance"
              type="number"
              fullWidth
              value={editedAccount.balance}
              onChange={(e) =>
                setEditedAccount({ ...editedAccount, balance: parseFloat(e.target.value) || 0 })
              }
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" sx={{ mb: 1, color: "text.primary", fontWeight: 500 }}>
          Expense Categories
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Expense Categories</InputLabel>
          <Select
            multiple
            value={editedAccount.expenseCategories}
            onChange={(e) =>
              setEditedAccount({ ...editedAccount, expenseCategories: e.target.value })
            }
            renderValue={(selected) => selected.join(", ")}
          >
            {expenseCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" sx={{ mb: 1, color: "text.primary", fontWeight: 500 }}>
          Saving Categories
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Saving Categories</InputLabel>
          <Select
            multiple
            value={editedAccount.savingCategories}
            onChange={(e) =>
              setEditedAccount({ ...editedAccount, savingCategories: e.target.value })
            }
            renderValue={(selected) => selected.join(", ")}
          >
            {savingsCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    )}
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button
      onClick={() => setOpenEditDialog(false)}
      variant="outlined"
      color="secondary"
      sx={{ borderRadius: 2 }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleSave}
      variant="contained"
      color="primary"
      sx={{ borderRadius: 2, fontWeight: "bold" }}
    >
      Save Changes
    </Button>
  </DialogActions>
</Dialog>


      </Grid>
        )}
    </Box>
      </Box>
  );
};

export default MyAccount;
