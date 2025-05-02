import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const GOOGLE_TOKEN_URL = "http://localhost:8000/google-token";
const LOGIN_URL = "http://localhost:8000/login";
const REFRESH_URL = "http://localhost:8000/refresh";

export const createGoogleToken = createAsyncThunk(
    "auth/googleToken",
    async (loginData, { rejectWithValue }) => {
        try {
            const response = await axios.post(GOOGLE_TOKEN_URL, loginData, {
                withCredentials: true, // allows server to set HttpOnly cookie
            });

            return {
                id_token: response.data.data.id_token,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Login failed");
        }
    }
);


// Thunk: Login with Google ID token and receive refresh_token
export const createLogin = createAsyncThunk(
    "auth/login",
    async (loginData, { rejectWithValue }) => {
        try {
            const response = await axios.post(LOGIN_URL, loginData, {
                withCredentials: true, // allows server to set HttpOnly cookie
            });

            return {
                refreshToken: response.data.data.refreshToken,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Login failed");
        }
    }
);

// Thunk: Use refresh_token to get access_token
export const refreshAccessToken = createAsyncThunk(
    "auth/refresh",
    async (refreshData, { rejectWithValue }) => {
        try {
            const response = await axios.post(REFRESH_URL, refreshData, {
                withCredentials: true, // if your refresh_token is in cookie
            });

            return {
                accessToken: response.data.data.accessToken,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to refresh token");
        }
    }
);

// Initial state
const initialState = {
    loading: false,
    idToken: localStorage.getItem("idToken") || null,
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    error: null,
};

// Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.error = null;
            localStorage.removeItem("idToken");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        },
    },
    extraReducers: (builder) => {
        builder
            // Google Token
            .addCase(createGoogleToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGoogleToken.fulfilled, (state, action) => {
                state.loading = false;
                // Optionally store idToken and refreshToken in state
                state.idToken = action.payload?.id_token || null;
                localStorage.setItem("idToken", action.payload?.id_token || "");
                state.error = null;
            })
            .addCase(createGoogleToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(createLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.refreshToken = action.payload.refreshToken;
                localStorage.setItem("refreshToken", action.payload.refreshToken || "");
                state.error = null;
            })
            .addCase(createLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Refresh
            .addCase(refreshAccessToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.loading = false;
                state.accessToken = action.payload.accessToken;
                localStorage.setItem("accessToken", action.payload.accessToken || "");
                state.error = null;
            })
            .addCase(refreshAccessToken.rejected, (state, action) => {
                state.loading = false;
                state.accessToken = null;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
