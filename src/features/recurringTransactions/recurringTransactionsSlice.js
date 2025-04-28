import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8000/recurring-transaction"

export const createRecurringTransaction= createAsyncThunk("recurringTransaction/createTransaction",async(transactionData,{rejectWithValue})=>{
    try{
        const token = localStorage.getItem("accessToken");
        const response = await axios.post(API_URL,transactionData,{
            headers:{
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;

    }catch(error){
        return rejectWithValue(error.response?.data?.error?.message || "Failed to create recurring transaction");
    }
});

export const fetchRecurringTransaction= createAsyncThunk("recurringTransaction/fetchtransactions", async(queryParams={},{rejectWithValue})=>{
    try{
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(API_URL, { params: queryParams,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }catch(error){
        return rejectWithValue(error.response?.data?.error?.message || "Failed to fetch recurring transactions");
    }
});

export const getByIDRecurringTransaction=createAsyncThunk("recurringTransaction/getByIDTransaction",async(id,{rejectWithValue})=>{
    try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_URL}/${id}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error?.message || "Recurring Transaction not found");
    }
})

export const updateRecurringTransaction = createAsyncThunk("recurringTransaction/updateTransaction", async ({ id, data }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.put(`${API_URL}/${id}`, data,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error?.message || "Failed to update recurring transaction");
    }
});

export const deleteRecurringTransaction = createAsyncThunk("recurringTransaction/deleteTransaction", async (id, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("accessToken");
        await axios.delete(`${API_URL}/${id}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error?.message || "Failed to delete recurring transaction");
    }
});

const recurringTransactionSlice = createSlice({
    name:"recurringTransactions",
    initialState:{recurringTransactions:[],selectedRecurringTransaction: null,status: "idle",error:null},
    reducers:{},
    extraReducers:(builder)=>{
        builder

        .addCase(createRecurringTransaction.fulfilled,(state,action)=>{
            if (!Array.isArray(state.recurringTransactions)) {
                state.recurringTransactions = []; // Ensure transactions is always an array
            }
            state.recurringTransactions.push(action.payload.data);
            state.error = null;
        })
        .addCase(createRecurringTransaction.rejected,(state,action)=>{
            state.error=action.payload
        })

        // Fetch All transactions
        .addCase(fetchRecurringTransaction.pending, (state) => {
            state.status = "loading";
        })
        .addCase(fetchRecurringTransaction.fulfilled, (state, action) => {
            console.log("Payload:", action.payload.data);
            state.status = "succeeded";
            state.recurringTransactions = action.payload.data;
            state.error = null;
        })
        .addCase(fetchRecurringTransaction.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload;
        })

        // Get transaction by ID
        .addCase(getByIDRecurringTransaction.fulfilled, (state, action) => {
            state.selectedRecurringTransaction = action.payload;
        })
        .addCase(getByIDRecurringTransaction.rejected, (state, action) => {
            state.error = action.payload;
        })


        // Update transaction
        .addCase(updateRecurringTransaction.fulfilled, (state, action) => {
            const updatedTransaction = action.payload.data;

            const index = state.recurringTransactions.findIndex(trans => trans.id === updatedTransaction.id);
            if (index !== -1) {
                state.recurringTransactions[index] = updatedTransaction;
            }
            state.error = null;
        })
        .addCase(updateRecurringTransaction.rejected, (state, action) => {
            state.error = action.payload;
        })

        // Delete transaction
        .addCase(deleteRecurringTransaction.fulfilled, (state, action) => {
            state.recurringTransactions = state.recurringTransactions.filter(trans => trans.id !== action.payload);
            state.error = null;
        })
        .addCase(deleteRecurringTransaction.rejected, (state, action) => {
            state.error = action.payload;
        });
    },
});

export default recurringTransactionSlice.reducer;