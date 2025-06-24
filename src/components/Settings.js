import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Switch,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";
import Sidebar from "./PermanentDrawerLeft";
import { useThemeMode } from "../ThemeContext";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConfigs,
  createConfigs,
  updateConfigs,
  generateAuthURL,
  generateTokens
} from "../features/configs/configsSlice"; // adjust path accordingly
import {
  MenuItem,
  Select,
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";
import { fetchAccounts, updateAccount } from "../features/accounts/accountSlice"; // adjust paths



export default function Settings() {
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  const dispatch = useDispatch();
  const pageBackground = theme.palette.background.gradient;
  const [selectedAccountId, setSelectedAccountId] = useState("");
const [bankEmail, setBankEmail] = useState("");
const accounts = useSelector((state) => state.account?.accounts || []);

  const { config, status, error } = useSelector((state) => state.configs || {});
  
  useEffect(() => {
    if (config?.isAutoRead) {
      dispatch(fetchAccounts());
    }
  }, [config?.isAutoRead]);

  console.log(accounts)

  const handleAccountSubmit = () => {
    const account = accounts.find((acc) => acc.id === Number(selectedAccountId));
    if (!account) return;
  
    const updatedAccount = {
      ...account,
      bankEmailAddress: bankEmail,
    };
  
    dispatch(updateAccount({ id: updatedAccount.id, data: updatedAccount }));
  };

  // Fetch config on load
  useEffect(() => {
    dispatch(fetchConfigs())
      .unwrap()
      .catch((err) => {
        const message =
          typeof err === "string"
            ? err
            : err?.error?.message || err?.message || "";
  
        if (message === "no record found") {
          dispatch(createConfigs());
        }
      });
  }, [dispatch]);
  
  const handleAutoReadToggle = () => {
    if (!config) return;
  
    const updated = {
      ...config,
      isAutoRead: !config.isAutoRead,
    };
  
    console.log("Updating config:", updated);
  
    dispatch(updateConfigs(updated))
      .unwrap()
      .then((res) => {
        const newConfig = res.data;
  
        // Check if enabled and token missing
        if (
          newConfig.isAutoRead === true &&
          (!newConfig.refreshToken || !newConfig.refreshToken.mail?.access_token)
        ){
          dispatch(generateAuthURL())
            .unwrap()
            .then((authURL) => {
              if (authURL) {
                // Open auth URL in a new window
                const popup = window.open(authURL, "_blank", "width=600,height=700");
                 // 👂 Listen for the message back from popup
              window.addEventListener("message", (event) => {
                if (event.origin !== window.location.origin) return;

                const { code, scope } = event.data;
                if (code && scope) {
                  dispatch(
                    generateTokens({
                      exchangeCode: code,
                      scope: scope.split(" "),
                    })
                  )
                    .unwrap()
                    .then(() => {
                      console.log("Tokens successfully generated");
                    })
                    .catch((err) => {
                      console.error("Failed to generate tokens:", err);
                    });
                }
              });
              }
            })
            .catch((err) => {
              console.error("Failed to get auth URL:", err);
            });
        }
      })
      .catch((err) => {
        console.error("Failed to update config:", err);
      });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const scope = params.get("scope");

    if (code && window.opener) {
           window.opener.postMessage({ code, scope }, window.location.origin);

          window.close();
    }
  }, []);
  
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
          pt: 8,
        }}
      >
        <Grid container spacing={2}>
          {/* Appearance: Dark Mode */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 3,
              }}
            >
              <Typography variant="subtitle1">Dark Mode</Typography>
              <Switch
                checked={mode === "dark"}
                onChange={toggleMode}
                color="primary"
              />
            </Paper>
          </Grid>

          {/* Notifications Placeholder */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 3,
              }}
            >
              <Typography variant="subtitle1">Notifications</Typography>
              <Switch checked disabled />
            </Paper>
          </Grid>

          {/* Auto Read From Email Toggle */}
          <Grid item xs={12} sm={6} md={4}>
  <Paper
    elevation={2}
    sx={{
      p: 2,
      display: "flex",
      flexDirection: "column",
      gap: 2,
      borderRadius: 3,
    }}
  >
    {/* Auto Read Toggle */}
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="subtitle1">Auto Read From Email</Typography>
      {status === "loading" ? (
        <CircularProgress size={24} />
      ) : config ? (
        <Switch
          checked={config.isAutoRead}
          onChange={handleAutoReadToggle}
          color="primary"
        />
      ) : (
        <Typography variant="body2" color="textSecondary">
          Loading config...
        </Typography>
      )}
    </Box>

    {/* List of Accounts with Saved Emails */}
    {config?.isAutoRead && (
      <>
        <Select
          fullWidth
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Select Account
          </MenuItem>
          {accounts
            .map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.name}
              </MenuItem>
            ))}
        </Select>

        {selectedAccountId && (
          <>
            <TextField
              fullWidth
              label="Bank Email Address"
              value={bankEmail}
              onChange={(e) => setBankEmail(e.target.value)}
              placeholder="e.g. alerts@axisbank.com"
            />
            <Button variant="contained" onClick={handleAccountSubmit}>
              Save Email
            </Button>
          </>
        )}

        {/* Show Linked Accounts */}
        {accounts
          .filter((acc) => acc.bankEmailAddress)
          .map((account) => (
            <Box
              key={account.id}
              sx={{
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
              }}
            >
              <Typography variant="body1" fontWeight="bold">
                {account.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {account.bankEmailAddress}
              </Typography>
            </Box>
          ))}
      </>
    )}
  </Paper>
</Grid>
        </Grid>
      </Box>
    </Box>
  );
}
