import { Box, Typography, Paper, Button } from "@mui/material";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from "@mui/icons-material/Google";
import { useDispatch, useSelector } from "react-redux";
import { createGoogleToken, createLogin,refreshAccessToken } from "../features/auth/authSlice";
import {useNavigate} from "react-router-dom"; // make sure createLogin is also imported

const drawerWidth = 240;
const pageBackground = "linear-gradient(to bottom, #E3F2FD, #FCE4EC)";

export default function Home() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth); // optional for UI feedback

    const login = useGoogleLogin({
        flow: "auth-code",
        scope: "openid email profile",
        onSuccess: async (codeResponse) => {
            const { code } = codeResponse;
            console.log("Auth Code:", code);

            if (code) {
                try {
                    // Step 1: Get Google ID token
                    const resultAction = await dispatch(createGoogleToken({ code }));
                    const idToken = resultAction.payload?.id_token;
                    console.log("Google ID Token:", idToken);

                    if (idToken) {
                        // Step 2: Login with backend to get refreshToken
                        const loginAction = await dispatch(
                            createLogin({
                                provider: "GOOGLE",
                                platform: "WEB",
                                providerData: { token: idToken },
                            })
                        );

                        const refreshToken = loginAction.payload?.refreshToken;
                        console.log("Refresh Token:", refreshToken);

                        if (refreshToken) {
                            const accessAction = await dispatch(
                                refreshAccessToken({ refreshToken })
                            );

                            const accessToken = accessAction.payload?.accessToken;

                            if (accessToken) {
                                // ✅ Navigate to dashboard on frontend
                                navigate("/dashboard");
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error during login chain:", error);
                }
            }
        },
        onError: () => console.log("Google Login Failed"),
    });


    return (
        <Box
            sx={{
                p: 3,
                minHeight: "100vh",
                background: pageBackground,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    padding: 5,
                    maxWidth: 600,
                    textAlign: "center",
                    borderRadius: "20px",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Your Smart Budget Manager
                </Typography>
                <Typography variant="body1" color="textSecondary" mb={4}>
                    Manage your expenses, savings, and financial goals with ease.
                    A single place to track and grow your money smarter.
                </Typography>

                <Button
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={() => login()}
                    sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        borderColor: "#4285F4",
                        color: "#4285F4",
                        "&:hover": {
                            backgroundColor: "#e3f2fd",
                            borderColor: "#4285F4",
                        },
                    }}
                >
                    {loading ? "Signing in..." : "Sign in with Google"}
                </Button>

                {error && (
                    <Typography color="error" mt={2}>
                        {error}
                    </Typography>
                )}
            </Paper>
        </Box>
    );
}
