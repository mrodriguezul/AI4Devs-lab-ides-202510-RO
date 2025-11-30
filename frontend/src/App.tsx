import React from 'react';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Box } from '@mui/material';
import CandidateDashboard from './components/CandidateDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { NetworkProvider, NetworkIndicator } from './contexts/NetworkContext';
import { APP_CONFIG } from './types/api';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#dc2626',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    h3: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          borderRadius: '8px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    // Enhanced toast styles
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .Toastify__toast': {
            borderRadius: '12px',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontSize: '14px',
          },
          '& .Toastify__toast--success': {
            backgroundColor: '#22c55e',
          },
          '& .Toastify__toast--error': {
            backgroundColor: '#ef4444',
          },
          '& .Toastify__toast--warning': {
            backgroundColor: '#f59e0b',
          },
          '& .Toastify__toast--info': {
            backgroundColor: '#3b82f6',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <NetworkProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          
          {/* App Bar with Network Status */}
          <AppBar position="static" elevation={1} sx={{ bgcolor: 'primary.main' }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                ATS - Applicant Tracking System
              </Typography>
              <Box sx={{ ml: 2 }}>
                <NetworkIndicator showText={true} variant="chip" />
              </Box>
            </Toolbar>
          </AppBar>
          
          {/* Main Application */}
          <CandidateDashboard />
          
          {/* Enhanced Toast Notifications */}
          {APP_CONFIG.enableToastNotifications && (
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              limit={5}
              className="custom-toast"
              style={{
                fontSize: '14px',
              }}
              toastStyle={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              }}
            />
          )}
        </ThemeProvider>
      </NetworkProvider>
    </ErrorBoundary>
  );
}

export default App;
