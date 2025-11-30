import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Pagination,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { candidateService } from '../services/api';
import { Candidate } from '../types/api';
import { toast } from 'react-toastify';
import AddCandidateForm from './AddCandidateForm';

const CANDIDATES_PER_PAGE = 6;

const CandidateDashboard: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-candidate'>('dashboard');

  const fetchCandidates = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await candidateService.getCandidates({
        page,
        limit: CANDIDATES_PER_PAGE,
        search: search.trim() || undefined
      });

      setCandidates(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalCandidates(response.meta.total);
    } catch (err) {
      const errorMessage = 'Failed to fetch candidates. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCandidates(1, searchTerm);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleAddCandidate = () => {
    setCurrentView('add-candidate');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleCandidateCreated = () => {
    setCurrentView('dashboard');
    // Refresh candidates list
    fetchCandidates(1, searchTerm);
  };

  const handleViewCandidate = (candidateId: number) => {
    toast.info(`Viewing candidate ${candidateId} - Full view to be implemented`);
  };

  // Show Add Candidate Form
  if (currentView === 'add-candidate') {
    return (
      <AddCandidateForm 
        onBack={handleBackToDashboard}
        onSuccess={handleCandidateCreated}
      />
    );
  }

  if (loading && candidates.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Candidate Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage your recruitment pipeline
            </Typography>
            <Chip 
              label={`${totalCandidates} Total Candidates`} 
              color="primary" 
              sx={{ mt: 1 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={handleAddCandidate}
            sx={{ mt: 2 }}
          >
            Add Candidate
          </Button>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search candidates by name, email, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    Search
                  </Button>
                </InputAdornment>
              )
            }}
            sx={{ maxWidth: 600 }}
          />
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Candidates Grid */}
        {candidates.length > 0 ? (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)'
                },
                gap: 3
              }}
            >
              {candidates.map((candidate) => (
                <Card key={candidate.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getInitials(candidate.firstName, candidate.lastName)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3">
                          {candidate.firstName} {candidate.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Added {formatDate(candidate.createdAt)}
                        </Typography>
                      </Box>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => handleViewCandidate(candidate.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap>
                          {candidate.email}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {candidate.phone}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap>
                          {candidate.address}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Chip 
                          label={`${candidate.education.length} Education${candidate.education.length !== 1 ? 's' : ''}`}
                          size="small"
                          variant="outlined"
                        />
                        <WorkIcon fontSize="small" sx={{ ml: 2, mr: 1, color: 'text.secondary' }} />
                        <Chip 
                          label={`${candidate.workExperience.length} Job${candidate.workExperience.length !== 1 ? 's' : ''}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        ) : (
          !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No candidates found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm 
                  ? `No candidates match your search for "${searchTerm}"`
                  : "Get started by adding your first candidate"
                }
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCandidate}
                size="large"
              >
                Add First Candidate
              </Button>
            </Box>
          )
        )}
      </Box>
    </Container>
  );
};

export default CandidateDashboard;