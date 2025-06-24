import {
    Box,
    Typography,
    Button,
    Grid,
    Stack,
    useMediaQuery,
    useTheme,
    Container,
    Card,
    CardContent,
    CardMedia,
  } from "@mui/material";
  import { useGoogleLogin } from "@react-oauth/google";
  import GoogleIcon from "@mui/icons-material/Google";
  import { useDispatch, useSelector } from "react-redux";
  import {
    createGoogleToken,
    createLogin,
    refreshAccessToken,
  } from "../features/auth/authSlice";
  import { useNavigate } from "react-router-dom";
  import heroImage from "../assets/dashboard.png"; // Your hero image
  import accountsImage from "../assets/accounts.png"; 
  
  // Feature data
  const features = [
    {
      title: "Smart Transaction Categorization",
      description: "Group your spending into various categories.",
      image: heroImage,
    },
    {
      title: "Visual Expense & Savings Insights",
      description: "Graphs that help you understand where your money goes.",
      image: heroImage,
    },
    {
      title: "Recurring Payment Tracking",
      description: "Never miss a subscription or recurring charge.",
      image: heroImage,
    },
    {
      title: "Multi-Account Management",
      description: "Link and manage all your bank accounts from one place.",
      image: accountsImage,
    },
  ];
  
  export default function Home() {
    const CARD_HEIGHT = 300; // Adjust based on design preference
  const VISIBLE_CARDS = 2;
  const SCROLL_HEIGHT = CARD_HEIGHT * VISIBLE_CARDS + 32; // includes spacing
  
    const theme = useTheme();
  const pageBackground = theme.palette.background.gradient;
  const isDark = theme.palette.mode === 'dark';

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);
  
    const login = useGoogleLogin({
      flow: "auth-code",
      scope: "openid email profile",
      onSuccess: async ({ code }) => {
        if (!code) return;
        try {
          const result = await dispatch(createGoogleToken({ code }));
          const idToken = result.payload?.id_token;
          if (!idToken) return;
          const loginResult = await dispatch(
            createLogin({
              provider: "GOOGLE",
              platform: "WEB",
              providerData: { token: idToken },
            })
          );
          const refreshToken = loginResult.payload?.refreshToken;
          if (!refreshToken) return;
          const accessTokenResult = await dispatch(
            refreshAccessToken({ refreshToken })
          );
          if (accessTokenResult.payload?.accessToken) {
            navigate("/dashboard");
          }
        } catch (err) {
          console.error("Login error:", err);
        }
      },
      onError: () => console.log("Google Login Failed"),
    });
  
    return (
      <Box sx={{ background: theme.palette.background.gradient, minHeight: "100vh", overflowX: "hidden" }}>
        {/* Hero Section */}
        <Box
          sx={{
            py: { xs: 6, md: 10 },
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={8} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h3" fontWeight={700} gutterBottom  sx={{ color: theme.palette.text.primary}}>
                  Your Smart Budget Manager
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ maxWidth: 520, mb: 3 }}
                >
                  Track income, expenses, and savings — reach your financial goals with ease.
                </Typography>
                
                
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={() => login()}
          size="large"
          sx={{
            mt: 4,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            backgroundColor: "#4285F4",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(66, 133, 244, 0.4)",
            "&:hover": {
              backgroundColor: "#3367D6",
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
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
                  <Box
              component="img"
              src={heroImage}
              alt="App Dashboard"
              sx={{
                width: "100%",
                maxWidth: "700px",
                borderRadius: 3,
                boxShadow: theme.palette.mode === "light"
                  ? "0 12px 30px rgba(0,0,0,0.1)"
                  : "0 12px 30px rgba(0,0,0,0.7)",
                transition: "transform 0.4s ease-in-out, box-shadow 0.3s",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: theme.palette.mode === "light"
                    ? "0 16px 40px rgba(0,0,0,0.15)"
                    : "0 16px 40px rgba(0,0,0,0.85)",
                },
              }}
            />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
  
      {/* Features Section */}
<Box
  sx={{
    py: 10,
  }}
>
  <Container maxWidth="md" sx={{boxShadow: theme.palette.background.boxShadow, }}>
    <Typography
      variant="h4"
      fontWeight="bold"
      textAlign="center"
      gutterBottom
      sx={{ mb: 6, color: theme.palette.text.primary }}
    >
      Key Features
    </Typography>

    <Box
      sx={{
        height: `${SCROLL_HEIGHT}px`, // Show only 2 cards
        overflowY: 'auto',
        borderRadius: 3,
      
        scrollbarWidth: "thin",
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'light' ? '#bbb' : '#555',
          borderRadius: '4px',
        },
        '&:hover': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'light' ? '#999' : '#777',
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {features.map((feature, idx) => (
          <Card
            key={idx}
            sx={{
              display: "flex",
              flexDirection: "row",
              height: `${CARD_HEIGHT}px`,
              borderRadius: 3,
              boxShadow: 3,
              transition: "all 0.3s ease",
              background: isDark ? "linear-gradient(145deg, #2a2a3d, #232332)" : "rgba(255, 255, 255, 0.8)",
              "&:hover": {
                transform: "scale(1.01)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{
    p: 3,
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // Center content vertically
  }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: theme.palette.text.primary }}
                gutterBottom
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {feature.description}
              </Typography>
              {/* <Button size="small" variant="contained">Learn More</Button> */}
            </CardContent>
            <CardMedia
              component="img"
              image={feature.image}
              alt={feature.title}
              sx={{
                width: '60%',
                height: "100%",
                objectFit: "cover",
                borderRadius:2,
                p:1
              }}
            />
            
          </Card>
        ))}
      </Box>
    </Box>
  </Container>
</Box>


  
        {/* Footer */}
        <Box sx={{ py: 5, textAlign: "center", backgroundColor: theme.palette.background.paper }}>
    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
      © {new Date().getFullYear()} SmartBudgetApp — Need help? Contact{" "}
      <a
        href="mailto:support@smartbudgetapp.com"
        style={{ color: theme.palette.primary.main }}
      >
        support@smartbudgetapp.com
      </a>
    </Typography>
  </Box>
      </Box>
    );
  }
  