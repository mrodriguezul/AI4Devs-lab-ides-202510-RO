import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Wifi, WifiOff, SignalWifi1Bar, SignalWifi2Bar, SignalWifi3Bar, SignalWifi4Bar } from '@mui/icons-material';
import { NetworkStatus } from '../types/notifications';
import { notifyOffline, notifyOnline, notifySlowConnection } from '../utils/notifications';

interface NetworkContextType {
  networkStatus: NetworkStatus;
  refreshNetworkStatus: () => void;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    lastConnected: navigator.onLine ? new Date() : null,
    connectionType: 'unknown',
  });

  const [previousOnlineStatus, setPreviousOnlineStatus] = useState(navigator.onLine);

  const getConnectionType = (): NetworkStatus['connectionType'] => {
    // @ts-ignore - navigator.connection is not in all TypeScript definitions
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return 'unknown';

    const type = connection.effectiveType;
    switch (type) {
      case 'slow-2g':
      case '2g':
        return '3g';
      case '3g':
        return '3g';
      case '4g':
        return '4g';
      default:
        return connection.type === 'wifi' ? 'wifi' : 'unknown';
    }
  };

  const checkConnectionSpeed = (): boolean => {
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return false;

    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink;

    // Consider connection slow if it's 2g/3g or downlink is very low
    return effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5;
  };

  const updateNetworkStatus = () => {
    const isOnline = navigator.onLine;
    const isSlowConnection = checkConnectionSpeed();
    const connectionType = getConnectionType();

    setNetworkStatus(prevStatus => ({
      ...prevStatus,
      isOnline,
      isSlowConnection,
      lastConnected: isOnline ? new Date() : prevStatus.lastConnected,
      connectionType,
    }));

    // Show notifications for status changes
    if (previousOnlineStatus !== isOnline) {
      if (isOnline) {
        notifyOnline();
      } else {
        notifyOffline();
      }
      setPreviousOnlineStatus(isOnline);
    }

    // Show slow connection warning
    if (isOnline && isSlowConnection) {
      notifySlowConnection();
    }
  };

  const refreshNetworkStatus = () => {
    updateNetworkStatus();
  };

  useEffect(() => {
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    // Initial status check
    updateNetworkStatus();

    // Periodic status checks
    const intervalId = setInterval(updateNetworkStatus, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
      clearInterval(intervalId);
    };
  }, [previousOnlineStatus]);

  return (
    <NetworkContext.Provider value={{ networkStatus, refreshNetworkStatus }}>
      {children}
    </NetworkContext.Provider>
  );
};

// Network status indicator component
interface NetworkIndicatorProps {
  showText?: boolean;
  variant?: 'chip' | 'icon' | 'full';
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({ 
  showText = true, 
  variant = 'chip' 
}) => {
  const { networkStatus } = useNetwork();

  const getConnectionIcon = () => {
    if (!networkStatus.isOnline) {
      return <WifiOff color="error" />;
    }

    if (networkStatus.connectionType === 'wifi') {
      return <Wifi color="success" />;
    }

    // Show signal strength for mobile connections
    if (networkStatus.isSlowConnection) {
      return <SignalWifi1Bar color="warning" />;
    }

    switch (networkStatus.connectionType) {
      case '4g':
        return <SignalWifi4Bar color="success" />;
      case '3g':
        return <SignalWifi2Bar color="primary" />;
      default:
        return <SignalWifi3Bar color="primary" />;
    }
  };

  const getStatusText = () => {
    if (!networkStatus.isOnline) {
      return 'Offline';
    }

    if (networkStatus.isSlowConnection) {
      return 'Slow Connection';
    }

    return networkStatus.connectionType === 'wifi' ? 'WiFi' : 'Online';
  };

  const getStatusColor = (): 'success' | 'warning' | 'error' | 'info' => {
    if (!networkStatus.isOnline) return 'error';
    if (networkStatus.isSlowConnection) return 'warning';
    return 'success';
  };

  if (variant === 'icon') {
    return <Box>{getConnectionIcon()}</Box>;
  }

  if (variant === 'chip') {
    return (
      <Chip
        icon={getConnectionIcon()}
        label={showText ? getStatusText() : undefined}
        color={getStatusColor()}
        variant="outlined"
        size="small"
      />
    );
  }

  // Full variant
  return (
    <Box display="flex" alignItems="center" gap={1}>
      {getConnectionIcon()}
      {showText && (
        <Typography variant="body2" color={getStatusColor()}>
          {getStatusText()}
          {networkStatus.connectionType && networkStatus.connectionType !== 'unknown' && ` (${networkStatus.connectionType.toUpperCase()})`}
        </Typography>
      )}
    </Box>
  );
};

export default NetworkProvider;