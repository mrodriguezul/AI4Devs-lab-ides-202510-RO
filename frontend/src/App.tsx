import React from 'react';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TestAPI from './components/TestAPI';
import { APP_CONFIG } from './types/api';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {APP_CONFIG.name}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Version {APP_CONFIG.version}
          </Typography>
          
          {/* API Connection Test */}
          <TestAPI />
        </Box>
      </Container>
      
      {/* Toast Notifications */}
      {APP_CONFIG.enableToastNotifications && (
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      )}
    </ThemeProvider>
  );
}

export default App;
