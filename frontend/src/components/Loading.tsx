import React from 'react';
import { 
  Box, 
  CircularProgress, 
  LinearProgress, 
  Skeleton, 
  Typography, 
  Card, 
  CardContent,
  Backdrop 
} from '@mui/material';

// Loading overlay for entire pages
interface LoadingOverlayProps {
  open: boolean;
  message?: string;
  variant?: 'circular' | 'linear';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  open, 
  message = 'Loading...', 
  variant = 'circular' 
}) => (
  <Backdrop open={open} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }}>
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      {variant === 'circular' ? (
        <CircularProgress color="inherit" size={60} />
      ) : (
        <Box sx={{ width: '300px' }}>
          <LinearProgress />
        </Box>
      )}
      <Typography variant="h6">{message}</Typography>
    </Box>
  </Backdrop>
);

// Inline loading spinner
interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  color?: 'primary' | 'secondary' | 'inherit';
  variant?: 'indeterminate' | 'determinate';
  value?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40, 
  message, 
  color = 'primary',
  variant = 'indeterminate',
  value = 0
}) => (
  <Box display="flex" flexDirection="column" alignItems="center" gap={1} p={2}>
    <CircularProgress 
      size={size} 
      color={color} 
      variant={variant}
      value={variant === 'determinate' ? value : undefined}
    />
    {message && <Typography variant="body2" color="textSecondary">{message}</Typography>}
  </Box>
);

// Loading button that shows progress
interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  disabled?: boolean;
  onClick?: () => void;
  startIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ 
  loading, 
  children, 
  variant = 'contained',
  color = 'primary',
  disabled,
  onClick,
  startIcon,
  fullWidth = false
}) => (
  <Box position="relative" display={fullWidth ? 'block' : 'inline-block'} width={fullWidth ? '100%' : 'auto'}>
    <Box
      component="button"
      sx={{
        width: fullWidth ? '100%' : 'auto',
        height: '40px',
        padding: '8px 16px',
        border: variant === 'outlined' ? `1px solid ${color}` : 'none',
        borderRadius: '4px',
        backgroundColor: variant === 'contained' ? (theme) => theme.palette[color].main : 'transparent',
        color: variant === 'contained' ? 'white' : (theme) => theme.palette[color].main,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        '&:hover': {
          backgroundColor: variant === 'contained' ? (theme) => theme.palette[color].dark : (theme) => theme.palette[color].light,
        },
      }}
      disabled={loading || disabled}
      onClick={loading || disabled ? undefined : onClick}
    >
      {loading && (
        <CircularProgress
          size={16}
          sx={{
            color: variant === 'contained' ? 'white' : (theme) => theme.palette[color].main,
            mr: 1,
          }}
        />
      )}
      {!loading && startIcon && startIcon}
      {children}
    </Box>
  </Box>
);

// File upload progress indicator
interface UploadProgressProps {
  progress: number;
  fileName: string;
  status: 'uploading' | 'success' | 'error' | 'pending';
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ progress, fileName, status }) => (
  <Card variant="outlined" sx={{ mb: 1 }}>
    <CardContent sx={{ py: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
          {fileName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {status === 'uploading' ? `${Math.round(progress)}%` : 
           status === 'success' ? 'Complete' :
           status === 'error' ? 'Failed' : 'Pending'}
        </Typography>
      </Box>
      <LinearProgress
        variant={status === 'uploading' ? 'determinate' : 'indeterminate'}
        value={progress}
        color={status === 'error' ? 'error' : status === 'success' ? 'success' : 'primary'}
      />
    </CardContent>
  </Card>
);

// Skeleton loading for dashboard cards
export const DashboardCardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box ml={2} flex={1}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={16} />
        </Box>
      </Box>
      <Skeleton variant="rectangular" height={100} />
      <Box mt={2}>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </Box>
    </CardContent>
  </Card>
);

// Skeleton loading for candidate list
export const CandidateListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <Box>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center">
            <Skeleton variant="circular" width={56} height={56} />
            <Box ml={2} flex={1}>
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="30%" height={16} />
            </Box>
            <Box>
              <Skeleton variant="rectangular" width={80} height={32} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
);

// Skeleton loading for form
export const FormSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
    {Array.from({ length: 4 }).map((_, index) => (
      <Box key={index} mb={3}>
        <Skeleton variant="text" width="20%" height={16} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={56} />
      </Box>
    ))}
    <Box display="flex" justifyContent="space-between" mt={4}>
      <Skeleton variant="rectangular" width={100} height={40} />
      <Skeleton variant="rectangular" width={100} height={40} />
    </Box>
  </Box>
);

// Loading dots animation
export const LoadingDots: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => {
  const dotSize = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
  
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      gap={0.5}
      sx={{
        '& > div': {
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          animation: 'loadingDots 1.4s ease-in-out infinite both',
          '&:nth-of-type(1)': { animationDelay: '-0.32s' },
          '&:nth-of-type(2)': { animationDelay: '-0.16s' },
        },
        '@keyframes loadingDots': {
          '0%, 80%, 100%': {
            transform: 'scale(0)',
          },
          '40%': {
            transform: 'scale(1)',
          },
        },
      }}
    >
      <div />
      <div />
      <div />
    </Box>
  );
};

// Generic loading wrapper
interface LoadingWrapperProps {
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ 
  loading, 
  children, 
  fallback,
  delay = 200
}) => {
  const [showLoading, setShowLoading] = React.useState(false);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (loading) {
      timeoutId = setTimeout(() => setShowLoading(true), delay);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, delay]);

  if (showLoading) {
    return <>{fallback || <LoadingSpinner />}</>;
  }

  return <>{children}</>;
};

export default {
  LoadingOverlay,
  LoadingSpinner,
  LoadingButton,
  UploadProgress,
  DashboardCardSkeleton,
  CandidateListSkeleton,
  FormSkeleton,
  LoadingDots,
  LoadingWrapper,
};