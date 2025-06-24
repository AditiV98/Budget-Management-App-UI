import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL ;

// Create Config — doesn't take any data
export const createConfigs = createAsyncThunk(
  "configs/createConfigs",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(API_URL+"/configs", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create config");
    }
  }
);

// Fetch Config
export const fetchConfigs = createAsyncThunk(
  "configs/fetchConfigs",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(API_URL+"/configs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch configs");
    }
  }
);

// Update Config
export const updateConfigs = createAsyncThunk(
  "configs/updateConfigs",
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.put(API_URL+"/configs", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update configs");
    }
  }
);

export const generateAuthURL = createAsyncThunk(
    "configs/generateAuthURL",
    async (_, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.post(API_URL + "/generate-auth-token", {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to generate auth URL");
      }
    }
  );

  export const generateTokens = createAsyncThunk(
    "configs/generateTokens",
    async (codeObj, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.put(API_URL + "/refresh-token", codeObj, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to generate tokens");
      }
    }
  );

const configSlice = createSlice({
  name: "configs",
  initialState: {
    config: null,
    authURL: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Config
      .addCase(createConfigs.fulfilled, (state, action) => {
        state.config = action.payload.data;
        state.error = null;
      })
      .addCase(createConfigs.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch Config
      .addCase(fetchConfigs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchConfigs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.config = action.payload.data;
        state.error = null;
      })
      .addCase(fetchConfigs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update Config
      .addCase(updateConfigs.fulfilled, (state, action) => {
        state.config = action.payload.data;
        state.error = null;
      })
      .addCase(updateConfigs.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Generate Auth URL
      .addCase(generateAuthURL.fulfilled, (state, action) => {
        state.authURL = action.payload.data;
        state.error = null;
      })
      .addCase(generateAuthURL.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Generate Tokens
      .addCase(generateTokens.fulfilled, (state, action) => {
        if (state.config) {
          state.config.refreshToken = action.payload.data;
        }
        state.error = null;
      })
      .addCase(generateTokens.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default configSlice.reducer;
