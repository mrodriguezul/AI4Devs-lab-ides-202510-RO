import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Alert,
  IconButton,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import { candidateService } from '../services/api';
import { 
  notifications, 
  notifyFormSuccess, 
  notifyFormError, 
  notifyValidationError,
  notifyUploadStart,
  notifyUploadSuccess,
  notifyUploadError,
  dismissLoading
} from '../utils/notifications';
import { LoadingButton, UploadProgress } from './Loading';

// Types for form data
interface EducationEntry {
  degree: string;
  institution: string;
  graduationYear: number | null;
}

interface WorkExperienceEntry {
  company: string;
  position: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string;
}

interface CandidateFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: EducationEntry[];
  workExperience: WorkExperienceEntry[];
  cvFile: File | null;
}

interface AddCandidateFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const steps = ['Personal Information', 'Education', 'Work Experience', 'Documents'];

const AddCandidateForm: React.FC<AddCandidateFormProps> = ({ onBack, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'uploading' | 'success' | 'error' | 'pending' }>({});

  const [formData, setFormData] = useState<CandidateFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    education: [{ degree: '', institution: '', graduationYear: null }],
    workExperience: [{ 
      company: '', 
      position: '', 
      startDate: null, 
      endDate: null, 
      description: '' 
    }],
    cvFile: null
  });

  // Validation functions
  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.phone && !/^[+]?[\d\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEducation = () => {
    const newErrors: Record<string, string> = {};
    
    formData.education.forEach((edu, index) => {
      if (edu.degree.trim() || edu.institution.trim() || edu.graduationYear) {
        if (!edu.degree.trim()) newErrors[`education.${index}.degree`] = 'Degree is required';
        if (!edu.institution.trim()) newErrors[`education.${index}.institution`] = 'Institution is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateWorkExperience = () => {
    const newErrors: Record<string, string> = {};
    
    formData.workExperience.forEach((work, index) => {
      if (work.company.trim() || work.position.trim() || work.startDate || work.endDate || work.description.trim()) {
        if (!work.company.trim()) newErrors[`work.${index}.company`] = 'Company is required';
        if (!work.position.trim()) newErrors[`work.${index}.position`] = 'Position is required';
        if (!work.startDate) newErrors[`work.${index}.startDate`] = 'Start date is required';
        if (work.endDate && work.startDate && work.endDate < work.startDate) {
          newErrors[`work.${index}.endDate`] = 'End date must be after start date';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form navigation
  const handleNext = () => {
    let isValid = false;
    
    switch (activeStep) {
      case 0:
        isValid = validatePersonalInfo();
        break;
      case 1:
        isValid = validateEducation();
        break;
      case 2:
        isValid = validateWorkExperience();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle form data changes
  const handlePersonalInfoChange = (field: keyof Pick<CandidateFormData, 'firstName' | 'lastName' | 'email' | 'phone' | 'address'>) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEducationChange = (index: number, field: keyof EducationEntry, inputValue: string) => {
    const value = field === 'graduationYear' ? parseInt(inputValue) || null : inputValue;
    
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));

    // Clear error when user starts typing
    const errorKey = `education.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleWorkExperienceChange = (index: number, field: keyof WorkExperienceEntry, value: any) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((work, i) => 
        i === index ? { ...work, [field]: value } : work
      )
    }));

    // Clear error when user starts typing
    const errorKey = `work.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Add/Remove entries
  const addEducationEntry = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', graduationYear: null }]
    }));
  };

  const removeEducationEntry = (index: number) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  const addWorkExperienceEntry = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { 
        company: '', 
        position: '', 
        startDate: null, 
        endDate: null, 
        description: '' 
      }]
    }));
  };

  const removeWorkExperienceEntry = (index: number) => {
    if (formData.workExperience.length > 1) {
      setFormData(prev => ({
        ...prev,
        workExperience: prev.workExperience.filter((_, i) => i !== index)
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        cvFile: file
      }));
    }
  };

  // Submit form
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Show loading notification
      notifications.loading('Creating candidate profile...');

      // Client-side validation
      const validationErrors: Record<string, string> = {};
      
      if (!formData.firstName.trim()) validationErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) validationErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) validationErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) validationErrors.email = 'Invalid email format';
      if (!formData.phone.trim()) validationErrors.phone = 'Phone number is required';

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        dismissLoading();
        notifyValidationError('Please fill in all required fields');
        return;
      }

      // Filter out empty education entries
      const validEducation = formData.education.filter(edu => 
        edu.degree.trim() || edu.institution.trim() || edu.graduationYear
      );

      // Filter out empty work experience entries
      const validWorkExperience = formData.workExperience.filter(work => 
        work.company.trim() || work.position.trim() || work.startDate || work.endDate || work.description.trim()
      );

      // Prepare form data for submission
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);
      
      if (validEducation.length > 0) {
        submitData.append('education', JSON.stringify(validEducation));
      }
      
      if (validWorkExperience.length > 0) {
        // Format dates for backend
        const formattedWorkExperience = validWorkExperience.map(work => ({
          ...work,
          startDate: work.startDate ? work.startDate.toISOString() : null,
          endDate: work.endDate ? work.endDate.toISOString() : null
        }));
        submitData.append('workExperience', JSON.stringify(formattedWorkExperience));
      }

      if (formData.cvFile) {
        notifyUploadStart(formData.cvFile.name);
        setUploadStatus({ [formData.cvFile.name]: 'uploading' });
        submitData.append('cv', formData.cvFile);
      }

      // Add small delay to avoid potential browser extension interference
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await candidateService.createCandidate(submitData);
      
      // Success notifications
      dismissLoading();
      if (formData.cvFile) {
        setUploadStatus({ [formData.cvFile.name]: 'success' });
        notifyUploadSuccess(formData.cvFile.name);
      }
      notifyFormSuccess('Candidate profile created');
      onSuccess();

    } catch (error: any) {
      console.error('Error creating candidate:', error);
      dismissLoading();
      
      // Handle file upload errors
      if (formData.cvFile) {
        setUploadStatus({ [formData.cvFile.name]: 'error' });
        notifyUploadError(formData.cvFile.name, error.message || 'Upload failed');
      }
      
      // Check if this is a MetaMask related error
      if (error.message?.includes('MetaMask') || error.message?.includes('ethereum')) {
        console.warn('MetaMask interference detected. This is likely a browser extension conflict.');
        notifications.warning('Browser extension conflict detected. Please try disabling MetaMask temporarily or use a different browser.');
        return;
      }
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const backendErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.path || err.param || 'general'] = err.msg || err.message;
        });
        setErrors(backendErrors);
        notifyValidationError('Please fix the validation errors');
      } else {
        notifyFormError(error.response?.data?.message || 'Failed to create candidate');
      }
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Personal Information
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 3,
              '& > :nth-of-type(5)': { gridColumn: { xs: '1', md: '1 / -1' } }
            }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handlePersonalInfoChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
              />
              
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handlePersonalInfoChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
              />
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handlePersonalInfoChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
              
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handlePersonalInfoChange('phone')}
                error={!!errors.phone}
                helperText={errors.phone}
              />
              
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handlePersonalInfoChange('address')}
              />
            </Box>
          </Paper>
        );

      case 1:
        return (
          <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon color="primary" />
              Education
            </Typography>
            
            {formData.education.map((edu, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      Education {index + 1}
                    </Typography>
                    {formData.education.length > 1 && (
                      <IconButton 
                        onClick={() => removeEducationEntry(index)}
                        color="error"
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Stack>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                    gap: 2 
                  }}>
                    <TextField
                      fullWidth
                      label="Degree"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      error={!!errors[`education.${index}.degree`]}
                      helperText={errors[`education.${index}.degree`]}
                    />
                    
                    <TextField
                      fullWidth
                      label="Institution"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      error={!!errors[`education.${index}.institution`]}
                      helperText={errors[`education.${index}.institution`]}
                    />
                    
                    <TextField
                      fullWidth
                      label="Graduation Year"
                      type="number"
                      value={edu.graduationYear || ''}
                      onChange={(e) => handleEducationChange(index, 'graduationYear', e.target.value)}
                      inputProps={{ min: 1950, max: new Date().getFullYear() + 10 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={addEducationEntry}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Add Education
            </Button>
          </Paper>
        );

      case 2:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon color="primary" />
                Work Experience
              </Typography>
              
              {formData.workExperience.map((work, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        Experience {index + 1}
                      </Typography>
                      {formData.workExperience.length > 1 && (
                        <IconButton 
                          onClick={() => removeWorkExperienceEntry(index)}
                          color="error"
                          size="small"
                        >
                          <RemoveIcon />
                        </IconButton>
                      )}
                    </Stack>
                    
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                      gap: 2,
                      '& > :nth-of-type(5)': { gridColumn: { xs: '1', md: '1 / -1' } }
                    }}>
                      <TextField
                        fullWidth
                        label="Company"
                        value={work.company}
                        onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                        error={!!errors[`work.${index}.company`]}
                        helperText={errors[`work.${index}.company`]}
                      />
                      
                      <TextField
                        fullWidth
                        label="Position"
                        value={work.position}
                        onChange={(e) => handleWorkExperienceChange(index, 'position', e.target.value)}
                        error={!!errors[`work.${index}.position`]}
                        helperText={errors[`work.${index}.position`]}
                      />
                      
                      <DatePicker
                        label="Start Date"
                        value={work.startDate}
                        onChange={(date) => handleWorkExperienceChange(index, 'startDate', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors[`work.${index}.startDate`],
                            helperText: errors[`work.${index}.startDate`]
                          }
                        }}
                      />
                      
                      <DatePicker
                        label="End Date (Optional)"
                        value={work.endDate}
                        onChange={(date) => handleWorkExperienceChange(index, 'endDate', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors[`work.${index}.endDate`],
                            helperText: errors[`work.${index}.endDate`]
                          }
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        value={work.description}
                        onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addWorkExperienceEntry}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Work Experience
              </Button>
            </Paper>
          </LocalizationProvider>
        );

      case 3:
        return (
          <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon color="primary" />
              Documents
            </Typography>
            
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <input
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                id="cv-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="cv-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  size="large"
                  sx={{ mb: 2 }}
                >
                  Upload CV (Optional)
                </Button>
              </label>
              
              {formData.cvFile && (
                <Box sx={{ mt: 2 }}>
                  {uploadStatus[formData.cvFile.name] ? (
                    <UploadProgress
                      progress={75}
                      fileName={formData.cvFile.name}
                      status={uploadStatus[formData.cvFile.name]}
                    />
                  ) : (
                    <Chip
                      label={formData.cvFile.name}
                      onDelete={() => setFormData(prev => ({ ...prev, cvFile: null }))}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Supported formats: PDF, DOC, DOCX (Max 5MB)
              </Typography>
            </Box>
            
            {Object.keys(errors).length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Please fix the errors in previous steps before submitting.
              </Alert>
            )}
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        <Typography variant="h4" sx={{ mb: 1 }}>
          Add New Candidate
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fill out the candidate information step by step
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ py: 3, px: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {renderStepContent()}

      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={activeStep === 0 ? onBack : handleBack}
            disabled={loading}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {activeStep === steps.length - 1 ? (
              <LoadingButton
                loading={loading}
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Create Candidate
              </LoadingButton>
            ) : (
              <LoadingButton
                loading={loading}
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </LoadingButton>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddCandidateForm;