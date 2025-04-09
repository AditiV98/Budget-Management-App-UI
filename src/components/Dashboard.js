import React, {useEffect,useState} from "react";
import { Box, Card, CardContent, Typography, Grid, MenuItem, Select  } from "@mui/material";
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

const drawerWidth = 240;
const pageBackground = "linear-gradient(to bottom, #E3F2FD, #FCE4EC)";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { dashboard, status, error } = useSelector((state) => state.dashboard || { dashboard: {} });

  const { selectedMonth, updateMonth } = useFilterContext(); // Call the hook directly
  const [showCustomFilter, setShowCustomFilter] = useState(false);

  useEffect(() => {
    if (selectedMonth?.startDate && selectedMonth?.endDate) {
      dispatch(fetchDashboard({ startDate: selectedMonth.startDate, endDate: selectedMonth.endDate }));
    }
  }, [dispatch, selectedMonth]);

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

      <Grid container spacing={3}>
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
    </Box>
      </Box>
  );
}
