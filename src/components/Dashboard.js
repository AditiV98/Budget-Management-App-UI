import React, {useEffect,useState} from "react";
import { Box, Card, CardContent, Typography, Grid, MenuItem, Select,IconButton,Button  } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import SavingsIcon from "@mui/icons-material/Savings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {LineChart,Line,XAxis,YAxis,PieChart, Pie, Cell, Tooltip, Legend,ResponsiveContainer } from "recharts";
import {useDispatch, useSelector} from "react-redux";
import {fetchDashboard} from "../features/dashboard/dashboardSlice";
import { useFilterContext } from "./FilterContext";
import dayjs from "dayjs";
import CustomDateFilter from "./CustomDateFilter";
import Sidebar from "./PermanentDrawerLeft";
import { fetchAccounts} from "../features/accounts/accountSlice";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchRecurringTransaction,deleteRecurringTransaction,updateRecurringTransaction,createRecurringTransaction,skipRecurringTransaction} from "../features/recurringTransactions/recurringTransactionsSlice";
import {fetchTransactions} from "../features/transactions/transactionsSlice";
import { ArrowUpward, ArrowDownward, Edit, Delete } from "@mui/icons-material";
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import PaymentIcon from '@mui/icons-material/Payment';
import { useTheme } from "@mui/material/styles";
import DateAndAccountFilter from "./DateAndAccountFilter";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const compactSelectSx = {
  width: 120,
  height: 36,
  background: 'linear-gradient(135deg, #fff, #fce4ec)',
  borderRadius: '6px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
  mr: 1,
  '& .MuiSelect-select': {
    padding: '6px 10px',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#333',
  },
};

export default function Dashboard() {
  const theme = useTheme();
  const pageBackground = theme.palette.background.gradient;
  const isDark = theme.palette.mode === 'dark';
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
const transactions = useSelector((state) => state.transaction?.transactions) || [];

  useEffect(() => {
  if (selectedAccount && selectedMonth?.startDate && selectedMonth?.endDate) {
    dispatch(fetchDashboard({ 
      accountId: selectedAccount,
      startDate: selectedMonth.startDate,
      endDate: selectedMonth.endDate 
    }));
  }
}, [dispatch, selectedAccount, selectedMonth]);

useEffect(() => {
  const now = new Date();
  
  // Current date formatted as 'YYYY-MM-DD'
  const startDateFormatted = now.toISOString().split('T')[0];
  
  // End of the current month (set time to the last moment of the month)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const endDateFormatted = endDate.toISOString().split('T')[0];

    dispatch(fetchRecurringTransaction({
      startDate: startDateFormatted,
      endDate: endDateFormatted
    }));
}, [dispatch]);

useEffect(() => {
  if (selectedMonth?.startDate && selectedMonth?.endDate) {
    const params = new URLSearchParams({
      startDate: selectedMonth.startDate,
      endDate: selectedMonth.endDate,
    });

    dispatch(fetchTransactions(params));
  }
}, [dispatch,selectedMonth,]);

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
    totalInterest=0,
    remainingBalance = 0,
    expenseBreakdown = [],
    savingsBreakdown = [],
    incomeBreakdown = [],
    interestBreakdown=[],
  } = dashboard || {};

  const cardData = [
    { 
      title: "Total Income", 
      value: totalIncome,
      icon: <AttachMoneyIcon fontSize="large" sx={{ color: isDark ? "#1976D2" : "#0D47A1" }}  />, 
      gradient: isDark 
      ? "linear-gradient(135deg, #1b2a3a, #243849)" 
      : "linear-gradient(135deg, #D4E5FF, #A9C5FF)" 
    },
    { 
      title: "Total Expense", 
      value: totalExpense, 
      icon: <MoneyOffIcon fontSize="large" sx={{ color: isDark ? "#C62828" : "#D50000" }} />, 
      gradient:isDark 
      ? "linear-gradient(135deg, #3a1b1b, #522121)" 
      : "linear-gradient(135deg, #FFC1C1, #FF8A80)" 
    },
    { 
      title: "Total Savings", 
      value: totalSavings, 
      icon: <SavingsIcon fontSize="large" sx={{ color: isDark ? "#1B5E20" : "#2E7D32" }} />, 
      gradient: isDark 
      ? "linear-gradient(135deg, #1b3a2b, #2e4d3b)" 
      : "linear-gradient(135deg, #C8E6C9, #A5D6A7)"  
    },
    { 
      title: "Total Interest", 
      value: totalInterest, 
      icon: <PaymentIcon fontSize="large" sx={{ color: isDark ? "#00897B" : "#00695C" }}  />, 
      gradient:isDark 
      ? "linear-gradient(135deg, #254742, #2f5e57)" 
      : "linear-gradient(135deg, #B2DFDB, #80CBC4)" 
    },
    { 
      title: "Remaining Balance", 
      value: remainingBalance, 
      icon: <AccountBalanceIcon fontSize="large" sx={{ color: isDark ? "#F57C00" : "#FF8F00" }}  />, 
      gradient: isDark 
      ? "linear-gradient(135deg, #3a2f1b, #524227)" 
      : "linear-gradient(135deg, #FFECB3, #FFD54F)"  
    },    
  ];
  
  const minDisplayValue = 0; // Ensure at least some value
  const pieCharts = [
    { title: "Income Breakdown", data: incomeBreakdown },
     { title: "Expense Breakdown", data: expenseBreakdown },
    { title: "Savings Breakdown", data: savingsBreakdown },
    { title: "Interest Breakdown", data: interestBreakdown },
  {title: "Expense vs Savings",
        data: [
    { name: "Expenses", value: Math.max(totalExpense, minDisplayValue), color: "#F770E5" },
    { name: "Savings", value: Math.max(totalSavings, minDisplayValue), color: "#B795E4" },
    { name: "Remaining", value: Math.max(remainingBalance, minDisplayValue), color: "#F8B1D3" }
  ]
  }];

  const handleSkipRecurring = (id) => {
    dispatch(skipRecurringTransaction(id))

    const now = new Date();
  
  // Current date formatted as 'YYYY-MM-DD'
  const startDateFormatted = now.toISOString().split('T')[0];
  
  // End of the current month (set time to the last moment of the month)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const endDateFormatted = endDate.toISOString().split('T')[0];

    dispatch(fetchRecurringTransaction({
      startDate: startDateFormatted,
      endDate: endDateFormatted
    }));
  };

  const getSpendingTrendData = () => {
    if (
      !transactions ||
      transactions.length === 0 ||
      !selectedMonth?.startDate ||
      !selectedMonth?.endDate
    ) {
      return [];
    }
  
    const start = dayjs(selectedMonth.startDate);
    const end = dayjs(selectedMonth.endDate);
    const daysInMonth = end.diff(start, "day") + 1;
  
    const dateMap = {};
  
    for (let i = 0; i < daysInMonth; i++) {
      const date = start.clone().add(i, "day").format("YYYY-MM-DD");
      dateMap[date] = { income: 0, expense: 0 };
    }
  
    transactions.forEach((txn) => {
      const txnDate = dayjs(txn.transactionDate);
      const formattedDate = txnDate.format("YYYY-MM-DD");
  
      const isWithinRange = txnDate.isSameOrAfter(start, "day") && txnDate.isSameOrBefore(end, "day");
      const isAccountMatch = !selectedAccount || txn.account?.id === selectedAccount;
  
      if (isWithinRange && isAccountMatch) {
        const type = txn.type;
        const amount = Math.abs(txn.amount);
  
        if (type === "EXPENSE") {
          dateMap[formattedDate].expense += amount;
        } else if (type === "INCOME") {
          dateMap[formattedDate].income += amount;
        }
      }
    });
  
    return Object.entries(dateMap).map(([date, { income, expense }]) => ({
      date: dayjs(date).format("DD MMM"),
      income,
      expense,
    }));
  };
  
  const getRecentTransactions = (transactions) => {
    const oneWeekAgo = dayjs().subtract(1, 'week'); // Get the date for one week ago
    return transactions
      .filter((txn) => dayjs(txn.transactionDate).isAfter(oneWeekAgo)) // Filter for transactions in the last week
      .sort((a, b) => dayjs(b.transactionDate).isBefore(dayjs(a.transactionDate)) ? -1 : 1); // Sort by most recent
  };

  const recentTransactions = getRecentTransactions(transactions);

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

            <DateAndAccountFilter
            accounts={accounts}
            selectedAccount={selectedAccount}
            handleAccountChange={handleAccountChange}
            selectedMonthNum={selectedMonthNum}
            setSelectedMonthNum={setSelectedMonthNum}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            isCustomMode={isCustomMode}
            setIsCustomMode={setIsCustomMode}
            showCustomFilter={showCustomFilter}
            setShowCustomFilter={setShowCustomFilter}
            updateMonth={updateMonth}
            theme={theme}
          />

    <Grid container spacing={2}>
  {/* Main Left Content */}
  <Grid item xs={12} md={10}>
    {/* Cards - 4 in a row */}
    <Grid container spacing={2}>
  {cardData.map(({ title, value, icon, gradient }, index) => (
   <Grid item xs={6} sm={6} md={2.4} key={index}>
      <Card
        sx={{
          background: gradient,
          color: theme.palette.filters.dropdownColor,
          height: 100,
          textAlign: "center",
          borderRadius: "12px",
          boxShadow: theme.palette.background.boxShadow, 
          transition: "transform 0.3s",
          "&:hover": { transform: "scale(1.05)" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: 1,
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box sx={{ fontSize: 1 }}>{icon}</Box> {/* Smaller icon */}
          <Typography variant="caption" sx={{ mt: 0.5 }}>
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", fontSize: 12 }}
          >
            ₹{value.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>

    <Grid container spacing={2} sx={{ mt: 1 }}>
  {pieCharts.map((chart, index) => (
    <Grid item xs={12} sm={6} md={2.4} key={index}>
      <Card
         sx={{
          background: isDark ? 'linear-gradient(180deg, #1E1A2F, #2C2540)' : "rgba(255, 255, 255, 0.8)",
          borderRadius: "16px",
          boxShadow: theme.palette.background.boxShadow, 
          textAlign: "center",
          p: 1,
          height: "95%",
        }}
      >
        <CardContent
          sx={{
            p: 1,
            "&:last-child": { pb: 1 },
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 500, fontSize: "0.75rem", mb: 1 }}
          >
            {chart.title}
          </Typography>

          {Array.isArray(chart.data) &&
          chart.data.some((entry) => entry.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chart.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  innerRadius="50%"
                  paddingAngle={3}
                  label={false}
                  labelLine={false}
                >
                  {chart.data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
  content={({ payload }) => {
    if (payload && payload.length) {
      const data = payload[0];
      return (
        <div
        style={{
          background: isDark ? "#333" : "#fff",
          border: `1px solid ${isDark ? "#555" : "#ccc"}`,
          color: isDark ? "#eee" : "#333",
          padding: "8px",
          fontSize: "0.75rem",
          borderRadius: "6px",
        }}
        >
          <div><strong>{data.payload.name}</strong>: ₹{data.payload.value.toLocaleString()}</div>
        </div>
      );
    }
    return null;
  }}
/>

                {/* <Legend
                  wrapperStyle={{ fontSize: "0.6rem", paddingTop: 4 }}
                  iconSize={8}
                /> */}
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


    <Grid item xs={12} md={12} sx={{ mt: 1 }}>
  <Card
    sx={{
      p: 2,
      borderRadius: "16px",
     background: isDark
  ? "linear-gradient(180deg, #1E1A2F, #382E56);"
  : "linear-gradient(145deg, #fdfbff, #f3f1f9)",
  boxShadow: theme.palette.background.boxShadow, 
      backdropFilter: "blur(10px)",
      transition: "none",
    }}
  >
    <Typography
            variant="caption"
            sx={{ fontWeight: 500, fontSize: "0.75rem", mb: 1 }}
          >
      Spending Trend - {dayjs(selectedMonth?.startDate).format("MMMM YYYY")}
    </Typography>

    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={getSpendingTrendData().filter(
          (d) => d.income !== 0 || d.expense !== 0
        )}
      >
        <XAxis
          dataKey="date"
          stroke="#8884d8"
          tick={{ fontSize: 10, fill: isDark ? "#bbb" : "#555" }}
        />
        <YAxis
          stroke="#8884d8"
          domain={['auto', 'auto']}
          tick={{ fontSize: 10, fill: isDark ? "#bbb" : "#555" }}
          tickFormatter={(value) => `₹${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#222" : "white",
            borderRadius: "12px",
            border: `1px solid ${isDark ? "#444" : "#ccc"}`,
            boxShadow: isDark
              ? "0 2px 10px rgba(255,255,255,0.1)"
              : "0 2px 10px rgba(0,0,0,0.1)",
            color: isDark ? "#eee" : "#333",
          }}          
          formatter={(value) => `₹${value.toLocaleString()}`}
        />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ color: isDark ? "#bbb" : "#4B4B7C", fontSize: "0.75rem" }}
        />

        {/* Expense Line */}
        <Line
          type="monotone"
          dataKey="expense"
          name="Expense"
          stroke="#FF6B6B"
          strokeWidth={2}
          dot={(props) =>
            props.payload.expense === 0 ? null : (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={4}
                stroke="#FF6B6B"
                strokeWidth={2}
                fill="white"
              />
            )
          }
          activeDot={{ r: 6 }}
        />

        {/* Income Line */}
        <Line
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#4CAF50"
          strokeWidth={2}
          dot={(props) =>
            props.payload.income === 0 ? null : (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={4}
                stroke="#4CAF50"
                strokeWidth={2}
                fill="white"
              />
            )
          }
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>
</Grid>


  </Grid>

  {/* Right Sidebar Content */}
  <Grid item xs={12} md={2}>
  {/* Recurring Transactions */}
  <Card
  sx={{
    background: isDark
  ? "linear-gradient(135deg, #171322, #2A2340, #3C325A)"  // darker gradient for dark mode
  : "linear-gradient(135deg, #c1f1fc, #e0c3fc)",
    borderRadius: "12px",
    mb: 2,
    boxShadow: theme.palette.background.boxShadow, 
    textAlign: 'center',
  }}
>
  <CardContent>
    <Typography variant="body2" sx={{ fontWeight: "bold"}}>
      Scheduled Transactions
    </Typography>
    <Typography variant="caption" sx={{ mb: 2, color: "text.secondary" }}>
      {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
    </Typography>
    {recurringTransactions.length > 0 ? (
      recurringTransactions.map((txn) => {
        const isExpense = txn.type === "EXPENSE";
        return (
          <Box
            key={txn.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: isDark ? "#333" : "#fff",
              borderRadius: "8px",
              p: 1,
              mb: 1,
              boxShadow: isDark
  ? "0 2px 6px rgba(255, 255, 255, 0.1)"
  : "0 2px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isExpense ? (
                <NorthEastIcon sx={{ color: "red", fontSize: 18 }} />
              ) : (
                <SouthWestIcon sx={{ color: "green", fontSize: 18 }} />
              )}
              <Box>
                <Typography variant="caption" sx={{fontSize: "0.6rem", fontWeight: 500, mr: 2 }}>
                  {txn.category}: ₹{txn.amount}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5,fontSize: "0.5rem" }}>
                  {new Date(txn.nextRun).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Typography>
              </Box>
            </Box>
            <IconButton
  size="small"
  onClick={() => handleSkipRecurring(txn.id)}
  title="Skip this run"
>
<SkipNextIcon style={{ color: "#ffa726", fontSize: "15px" }} />
</IconButton>
          </Box>
        );
      })
    ) : (
      <Typography variant="body2" color="text.secondary">
        No transactions
      </Typography>
    )}
  </CardContent>
</Card>


  {/* Recent Transactions */}
  <Card
  sx={{
    background: isDark
  ? "linear-gradient(135deg, #171322, #2A2340, #3C325A)"  // darker gradient for dark mode
  : "linear-gradient(135deg, #c1f1fc, #e0c3fc)",
    borderRadius: "12px",
    mb: 2,
    boxShadow: theme.palette.background.boxShadow, 
    textAlign: 'center',
  }}
>
  <CardContent>
    <Typography variant="body2" sx={{ fontWeight: "bold"}}>
      Recent Transactions
    </Typography>
    <Typography variant="caption" sx={{ mb: 2, color: "text.secondary" }}>
      Last 1 Week
    </Typography>
    {recentTransactions.length > 0 ? (
      recentTransactions.map((txn) => {
        const isExpense = txn.type === "EXPENSE";
        return (
          <Box
            key={txn.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: isDark ? "#333" : "#fff",
              borderRadius: "8px",
              p: 1,
              mb: 1,
              boxShadow: isDark
  ? "0 2px 6px rgba(255, 255, 255, 0.1)"
  : "0 2px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isExpense ? (
                <NorthEastIcon sx={{ color: "red", fontSize: 18 }} />
              ) : (
                <SouthWestIcon sx={{ color: "green", fontSize: 18 }} />
              )}
               <Typography variant="caption" sx={{fontSize: "0.6rem", fontWeight: 500, mr: 2  }}>
    {txn.category}: ₹{txn.amount}
  </Typography>
  <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5,fontSize: "0.5rem", }}>
    {new Date(txn.transactionDate).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}
  </Typography>
            </Box>
          </Box>
        );
      })
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
