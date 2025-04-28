import React, {useEffect,useState} from "react";
import { Box, Card, CardContent, Typography, Grid, MenuItem, Select,IconButton  } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import SavingsIcon from "@mui/icons-material/Savings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { PieChart, Pie, Cell, Tooltip, Legend,ResponsiveContainer } from "recharts";
import {useDispatch, useSelector} from "react-redux";
import {fetchDashboard} from "../features/dashboard/dashboardSlice";
import { useFilterContext } from "./FilterContext";
import dayjs from "dayjs";
import CustomDateFilter from "./CustomDateFilter";
import Sidebar from "./PermanentDrawerLeft";
import { fetchAccounts} from "../features/accounts/accountSlice";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchRecurringTransaction,deleteRecurringTransaction,updateRecurringTransaction,createRecurringTransaction} from "../features/recurringTransactions/recurringTransactionsSlice";

const pageBackground = "linear-gradient(to bottom, #E3F2FD, #FCE4EC)";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { dashboard, status, error } = useSelector((state) => state.dashboard || { dashboard: {} });
  const accounts = useSelector((state) => state.account?.accounts) || [];
  const [selectedAccount, setSelectedAccount] = useState(null);
  const { selectedMonth, updateMonth } = useFilterContext(); // Call the hook directly
  const [showCustomFilter, setShowCustomFilter] = useState(false);
  const [selectedMonthNum, setSelectedMonthNum] = useState(dayjs().month()); // month index (0-11)
const [selectedYear, setSelectedYear] = useState(dayjs().year()); // e.g., 2024
const [isCustomMode, setIsCustomMode] = useState(false);
const recurringTransactions = useSelector((state)=>state.recurringTransactions?.recurringTransactions) || [];

  useEffect(() => {
  if (selectedAccount && selectedMonth?.startDate && selectedMonth?.endDate) {
    console.log("Dispatching fetchDashboard with:", selectedAccount);
    dispatch(fetchDashboard({ 
      accountId: selectedAccount,
      startDate: selectedMonth.startDate,
      endDate: selectedMonth.endDate 
    }));
  }
}, [dispatch, selectedAccount, selectedMonth]);

useEffect(() => {
  const now = new Date();
  
  // Start of the current month (set time to midnight)
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // End of the current month (set time to the last moment of the month)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Format the dates as 'YYYY-MM-DD'
  const startDateFormatted = startDate.toISOString().split('T')[0];
  const endDateFormatted = endDate.toISOString().split('T')[0];

  if (recurringTransactions.length === 0) {
    dispatch(fetchRecurringTransaction({
      startDate: startDateFormatted,
      endDate: endDateFormatted
    }));
  }
}, [dispatch, recurringTransactions]);


  useEffect(() => {
    if (accounts.length === 0) {  // Fetch only if accounts are empty
      dispatch(fetchAccounts());
    }
  }, [dispatch, accounts]);

  const handleAccountChange = (event) => {
    setSelectedAccount(event.target.value);
  };

  useEffect(() => {
    if (!isCustomMode && selectedYear && selectedMonthNum >= 0) {
      const startDate = dayjs().year(selectedYear).month(selectedMonthNum).startOf('month').format('YYYY-MM-DD');
      const endDate = dayjs().year(selectedYear).month(selectedMonthNum).endOf('month').format('YYYY-MM-DD');
      updateMonth({ startDate, endDate });
    }
  }, [selectedMonthNum, selectedYear, isCustomMode]); // Note: depend on isCustomMode


  const {
    totalIncome = 0,
    totalExpense = 0,
    totalSavings = 0,
    remainingBalance = 0,
    expenseBreakdown = [],
    savingsBreakdown = [],
    incomeBreakdown = []
  } = dashboard || {};

  const cardData = [
    { 
      title: "Total Income", 
      value: totalIncome,
      icon: <AttachMoneyIcon fontSize="large" sx={{ color: "#0D47A1" }} />, 
      gradient: "linear-gradient(135deg, #D4E5FF, #A9C5FF)" 
    },
    { 
      title: "Total Expense", 
      value: totalExpense, 
      icon: <MoneyOffIcon fontSize="large" sx={{ color: "#D50000" }} />, 
      gradient: "linear-gradient(135deg, #FFC1C1, #FF8A80)" 
    },
    { 
      title: "Total Savings", 
      value: totalSavings, 
      icon: <SavingsIcon fontSize="large" sx={{ color: "#2E7D32" }} />, 
      gradient: "linear-gradient(135deg, #C8E6C9, #A5D6A7)" 
    },
    { 
      title: "Remaining Balance", 
      value: remainingBalance, 
      icon: <AccountBalanceIcon fontSize="large" sx={{ color: "#FF8F00" }} />, 
      gradient: "linear-gradient(135deg, #FFECB3, #FFD54F)" 
    },    
  ];
  const minDisplayValue = 0; // Ensure at least some value
  const pieCharts = [
    { title: "Income Breakdown", data: incomeBreakdown },
     { title: "Expense Breakdown", data: expenseBreakdown },
    { title: "Savings Breakdown", data: savingsBreakdown },
  {title: "Expense vs Savings",
        data: [
    { name: "Expenses", value: Math.max(totalExpense, minDisplayValue), color: "#F770E5" },
    { name: "Savings", value: Math.max(totalSavings, minDisplayValue), color: "#B795E4" },
    { name: "Remaining", value: Math.max(remainingBalance, minDisplayValue), color: "#F8B1D3" }
  ]
  }];

  // const [recurringTransactions, setRecurringTransactions] = useState([
  //   { id: 1, title: "Netflix Subscription", amount: 499 },
  //   { id: 2, title: "Gym Membership", amount: 1200 },
  //   { id: 1, title: "Netflix Subscription", amount: 499 },
  //   { id: 2, title: "Gym Membership", amount: 1200 },
  //   { id: 1, title: "Netflix Subscription", amount: 499 },
  //   { id: 2, title: "Gym Membership", amount: 1200 },
  //   { id: 1, title: "Netflix Subscription", amount: 499 },
  //   { id: 2, title: "Gym Membership", amount: 1200 },
  // ]); // Dummy data - replace with API if needed



  const handleDeleteRecurring = (id) => {
    //setRecurringTransactions(prev => prev.filter(item => item.id !== id));
  };

  const handleEditRecurring = (id) => {
    alert(`Edit recurring transaction with id: ${id}`);
    // You can implement a modal to edit if you want
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3, position: "relative"  }}>
        {/* Account Filter */}
          <Select
            value={selectedAccount}
            onChange={handleAccountChange}
            displayEmpty
            sx={{
              width: 150,
              background: "linear-gradient(135deg, #fff, #fce4ec)",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              mr: 2,
              "& .MuiSelect-select": { padding: "10px", fontWeight: "bold", color: "#333" }
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

    <Grid container spacing={4}>
  {/* Main Left Content */}
  <Grid item xs={12} md={9}>
    {/* Cards - 4 in a row */}
    <Grid container spacing={4}>
    {cardData.map(({ title, value, icon, gradient }, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              background: gradient, 
              color: "#333", 
              textAlign: "center", 
              p: 3, 
              borderRadius: "16px", 
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)", 
              transition: "transform 0.3s", 
              "&:hover": { transform: "scale(1.05)" } 
            }}>
              <CardContent>
                {icon}
                <Typography variant="h6" sx={{ mt: 1, fontWeight: "500" }}>{title}</Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>₹{value.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
    </Grid>

    {/* Pie Charts - 3 in a row */}
    <Grid container spacing={4} sx={{ mt: 2 }}>
    {pieCharts.map((chart, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ background: "rgba(255, 255, 255, 0.75)", borderRadius: "16px" }}>
                <CardContent>
                  <Typography variant="h6">{chart.title}</Typography>
                  {Array.isArray(chart.data) && chart.data.some((entry) => entry.value > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                              data={chart.data}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius="70%"
                              innerRadius="40%"
                              paddingAngle={5}
                              label={false}
                          >
                            {chart.data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`₹${value.toLocaleString()}`, name]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                  ) : (
                      <Typography variant="body2" color="textSecondary">No data available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
        ))}
    </Grid>
  </Grid>

  {/* Right Sidebar Content */}
  <Grid item xs={12} md={3}>
  {/* Recurring Transactions */}
  <Card
    sx={{
      background: "linear-gradient(135deg, #c1f1fc, #e0c3fc)",
      borderRadius: "16px",
      p: 3,
      mb: 4,
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
    }}
  >
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Scheduled Transactions
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
      </Typography>
      {recurringTransactions.length > 0 ? (
        recurringTransactions.map((txn) => (
          <Box
            key={txn.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
              borderRadius: "12px",
              p: 1.5,
              mb: 1.5,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "500" }}>
              {txn.title}: ₹{txn.amount}
            </Typography>
            <Box>
              <IconButton size="small" onClick={() => handleEditRecurring(txn.id)}>
              <EditIcon fontSize="small" style={{ color: '#4caf50' }} />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteRecurring(txn.id)}>
              <DeleteIcon fontSize="small" style={{ color: '#ff5c5c' }} />
              </IconButton>
            </Box>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No scheduled transactions
        </Typography>
      )}
    </CardContent>
  </Card>

  {/* Recent Transactions */}
  <Card
    sx={{
      background: "linear-gradient(135deg, #fbc2eb, #a6c1ee)",
      borderRadius: "16px",
      p: 3,
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
    }}
  >
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Recent Transactions
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        Last 1 Week
      </Typography>
      {recurringTransactions.length > 0 ? (
        recurringTransactions.map((txn) => (
          <Box
            key={txn.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
              borderRadius: "12px",
              p: 1.5,
              mb: 1.5,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "500" }}>
              {txn.title}: ₹{txn.amount}
            </Typography>
            <Box>
              <IconButton size="small" onClick={() => handleEditRecurring(txn.id)}>
              <EditIcon fontSize="small" style={{ color: '#4caf50' }} />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteRecurring(txn.id)}>
              <DeleteIcon fontSize="small" style={{ color: '#ff5c5c' }} />
              </IconButton>
            </Box>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No recent transactions
        </Typography>
      )}
    </CardContent>
  </Card>
</Grid>

</Grid>

    </Box>
      </Box>
  );
}
