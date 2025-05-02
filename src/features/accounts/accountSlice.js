import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8000/account"

export const createAccount=createAsyncThunk("account/createAccount",async(accountData,{rejectWithValue})=>{
try{
  const token = localStorage.getItem("accessToken");
const response=await axios.post(API_URL,accountData,{
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
  return response.data;
}catch(error){
    return rejectWithValue(error.response?.data || "Failed to create account");
}
});

export const fetchAccounts = createAsyncThunk("account/fetchAccounts", async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(API_URL,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch accounts");
    }
  });
  
  // **3. Get Account by ID** (GET /account/{id})
  export const getAccountById = createAsyncThunk("account/getAccountById", async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_URL}/${id}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Account not found");
    }
  });
  
  // **4. Update Account** (PUT /account/{id})
  export const updateAccount = createAsyncThunk("account/updateAccount", async ({ id, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.put(`${API_URL}/${id}`, data,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update account");
    }
  });
  
  // **5. Delete Account** (DELETE /account/{id})
  export const deleteAccount = createAsyncThunk("account/deleteAccount", async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_URL}/${id}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id; // Return the deleted ID to remove from state
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete account");
    }
  });

const accountSlice = createSlice({
    name: "account",
    initialState: { accounts: [], selectedAccount: null, status: "idle", error: null },
    reducers: {}, // Using only async reducers for API calls
  extraReducers: (builder) => {
    builder
      // Create Account
      .addCase(createAccount.fulfilled, (state, action) => {
        if (!Array.isArray(state.accounts)) {
          state.accounts = []; // Ensure transactions is always an array
        }
          state.accounts.push(action.payload.data);
        state.error = null;
      })
        .addCase(createAccount.rejected,(state,action)=>{
          state.error=action.payload
        })

      // Fetch All Accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accounts = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Get Account by ID
      .addCase(getAccountById.fulfilled, (state, action) => {
        state.selectedAccount = action.payload;
      })
        .addCase(getAccountById.rejected, (state, action) => {
          state.error = action.payload;
        })


        // Update Account
        .addCase(updateAccount.fulfilled, (state, action) => {
          const updatedAccount = action.payload.data;

          const index = state.accounts.findIndex(acc => acc.id === updatedAccount.id);
          if (index !== -1) {
            state.accounts[index] = updatedAccount;
          }
          state.error = null;
        })
  .addCase(updateAccount.rejected, (state, action) => {
          state.error = action.payload;
        })

        // Delete Account
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter(acc => acc.id !== action.payload);
        state.error = null;
      })
  .addCase(deleteAccount.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export default accountSlice.reducer;
