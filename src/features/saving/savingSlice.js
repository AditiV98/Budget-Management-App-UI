import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8000/savings"


export const fetchSavings = createAsyncThunk(
    "savings/fetchSavings",
    async (queryParams = {}, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await axios.get(API_URL, { params: queryParams,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error?.message || "Failed to fetch savings");
        }
    }
);

export const updateSavings = createAsyncThunk("savings/updateSavings", async ({ id, data }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.put(`${API_URL}/${id}`, data,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error?.message || "Failed to update savings");
    }
});

const savingsSlice=createSlice({
    name:"savings",
    initialState:{savings:[],selectedSavings: null,status: "idle",error:null},
    reducers:{},
    extraReducers:(builder)=>{
        builder

            // Fetch All savings
            .addCase(fetchSavings.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchSavings.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.savings = Array.isArray(action.payload.data) ? action.payload.data : [];
                state.error = null;
            })
            .addCase(fetchSavings.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Update savings
            .addCase(updateSavings.fulfilled, (state, action) => {
                const updatedSavings = action.payload.data;

                const index = state.savings.findIndex(trans => trans.id === updatedSavings.id);
                if (index !== -1) {
                    state.savings[index] = updatedSavings;
                }
                state.error = null;
            })
            .addCase(updateSavings.rejected, (state, action) => {
                state.error = action.payload;
            })
    },
});

export default savingsSlice.reducer;
