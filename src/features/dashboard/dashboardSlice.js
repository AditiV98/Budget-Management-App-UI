import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8000/dashboard"

export const fetchDashboard = createAsyncThunk("dashboard/fetchDashboard", async ({accountId, startDate, endDate }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("accessToken");

        const response = await axios.get(`${API_URL}`, {
            params: { accountId,startDate, endDate }, // ✅ Correctly formatted query params
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to fetch dashboard");
    }
});

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: {
        dashboard: {
            totalIncome: 0,
            totalExpense: 0,
            totalSavings: 0,
            remainingBalance: 0,
            expenseBreakdown: [],
            savingsBreakdown: [],
            incomeBreakdown: []
        },
        status: "idle",
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.dashboard = action.payload?.data || {};
                state.error = null;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export default dashboardSlice.reducer;