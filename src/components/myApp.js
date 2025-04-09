import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { refreshAccessToken } from "../features/auth/authSlice";

import PermanentDrawerLeft from "./PermanentDrawerLeft";
import Dashboard from "./Dashboard";
import Transactions from "./Transactions";
import Expenses from "./Expenses";
import Savings from "./Savings";
import MyAccount from "./MyAccount";
import Settings from "./Settings";
import Home from "./Home";

const GOOGLE_CLIENT_ID = "634540330926-tpucuji65r3b5nlkgpq54arggqqcret7.apps.googleusercontent.com";
const REFRESH_INTERVAL = 4.5 * 60 * 1000; // 4.5 minutes

function MyApp() {
    const dispatch = useDispatch();
    const refreshTimerRef = useRef(null);

    useEffect(() => {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
            // Immediate refresh on load
            dispatch(refreshAccessToken({ refreshToken }));

            // Set up interval
            refreshTimerRef.current = setInterval(() => {
                dispatch(refreshAccessToken({ refreshToken }));
            }, REFRESH_INTERVAL);
        }

        // Cleanup on unmount
        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [dispatch]);

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/savings" element={<Savings />} />
                    <Route path="/my-account" element={<MyAccount />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default MyApp;
