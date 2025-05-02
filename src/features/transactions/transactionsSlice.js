import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8000/transaction"

export const createTransaction=createAsyncThunk("transaction/createTransaction",async(transactionData,{rejectWithValue})=>{
    try{
        const token = localStorage.getItem("accessToken");
        const response=await axios.post(API_URL,transactionData,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }catch(error){
        return rejectWithValue(error.response?.data?.error?.message || "Failed to create transaction");
    }
});

export const fetchTransactions = createAsyncThunk(
    "transaction/fetchTransactions",
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
            return rejectWithValue(error.response?.data?.error?.message || "Failed to fetch transactions");
        }
    }
);

export const getByIDTransaction=createAsyncThunk("transaction/getByIDTransaction",async(id,{rejectWithValue})=>{
    try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_URL}/${id}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error?.message || "Transaction not found");
    }
})

export const updateTransaction = createAsyncThunk("transaction/updateTransaction", async ({ id, data }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.put(`${API_URL}/${id}`, data,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error?.message || "Failed to update transaction");
    }
});

export const deleteTransaction = createAsyncThunk("transaction/deleteTransaction", async (id, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("accessToken");
        await axios.delete(`${API_URL}/${id}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error?.message || "Failed to delete transaction");
    }
});

const transactionSlice=createSlice({
    name:"transaction",
    initialState:{transactions:[],selectedTransaction: null,status: "idle",error:null},
    reducers:{},
    extraReducers:(builder)=>{
        builder

            .addCase(createTransaction.fulfilled,(state,action)=>{
                if (!Array.isArray(state.transactions)) {
                    state.transactions = []; // Ensure transactions is always an array
                }
                state.transactions.push(action.payload.data);
                state.error = null;
            })
            .addCase(createTransaction.rejected,(state,action)=>{
                state.error=action.payload
            })

            // Fetch All transactions
            .addCase(fetchTransactions.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.transactions = action.payload.data;
                state.error = null;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Get transaction by ID
            .addCase(getByIDTransaction.fulfilled, (state, action) => {
                state.selectedTransaction = action.payload;
            })
            .addCase(getByIDTransaction.rejected, (state, action) => {
                state.error = action.payload;
            })


            // Update transaction
            .addCase(updateTransaction.fulfilled, (state, action) => {
                const updatedTransaction = action.payload.data;

                const index = state.transactions.findIndex(trans => trans.id === updatedTransaction.id);
                if (index !== -1) {
                    state.transactions[index] = updatedTransaction;
                }
                state.error = null;
            })
            .addCase(updateTransaction.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Delete transaction
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.transactions = state.transactions.filter(trans => trans.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteTransaction.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default transactionSlice.reducer;
