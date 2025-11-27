# ATS Frontend - Applicant Tracking System

A modern React TypeScript application for managing candidates in an ATS system.

## 🚀 Features

- **Modern Tech Stack**: React 18 + TypeScript + Material-UI
- **Form Handling**: React Hook Form with validation
- **API Integration**: Axios with comprehensive error handling
- **Notifications**: Toast notifications for user feedback
- **File Upload**: CV upload with validation
- **Responsive Design**: Material-UI components
- **Code Quality**: ESLint + Prettier configuration

## 📦 Dependencies Added

### Core Libraries
- **axios**: HTTP client for API communication
- **react-hook-form**: Efficient form handling with validation
- **@mui/material**: Material-UI components and styling
- **@mui/icons-material**: Material-UI icons
- **@emotion/react** & **@emotion/styled**: CSS-in-JS styling
- **react-toastify**: Toast notifications
- **react-router-dom**: Client-side routing

### Development Dependencies
- **prettier**: Code formatting
- **eslint-config-prettier**: ESLint + Prettier integration

## 🛠️ Available Scripts

### Development
```bash
npm start              # Start development server (port 3000)
npm run start:dev      # Start with API_URL=http://localhost:3010
npm run build          # Build for production
npm run build:dev      # Build for development with API_URL
```

### Testing & Quality
```bash
npm test               # Run tests once
npm run test:watch     # Run tests in watch mode
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

## ⚙️ Environment Configuration

### Development (.env.development)
- API URL: `http://localhost:3010`
- Debug mode enabled
- File upload: 10MB max, PDF/DOCX only

### Production (.env.production)
- API URL: Configure for your production backend
- Debug mode disabled
- Same file upload restrictions

## 📁 Project Structure

```
src/
├── types/
│   └── api.ts          # TypeScript interfaces and types
├── services/
│   └── api.ts          # API service layer with axios
├── components/         # React components (to be created)
├── pages/             # Page components (to be created)
└── utils/             # Utility functions (to be created)
```

## 🔧 API Integration

The frontend is configured to work with the backend API running on `http://localhost:3010`.

### Available API Services
- `candidateService.getCandidates()` - List all candidates
- `candidateService.getCandidateById(id)` - Get specific candidate
- `candidateService.createCandidate(data, cvFile)` - Create new candidate
- `candidateService.updateCandidate(id, data, cvFile)` - Update candidate
- `candidateService.deleteCandidate(id)` - Delete candidate
- `candidateService.downloadCV(id)` - Download candidate CV

### File Upload
- Supports PDF and DOCX files
- Maximum file size: 10MB
- Client-side validation included

## 🚦 Getting Started

1. **Install dependencies**: `npm install`
2. **Start backend**: Ensure Docker containers are running
3. **Start frontend**: `npm run start:dev`
4. **Open browser**: Navigate to `http://localhost:3000`

## 🔄 Integration with Backend

The frontend is designed to work with the backend API endpoints:
- Backend running at: `http://localhost:3010`
- Database: PostgreSQL with test candidates
- File storage: Local filesystem with Docker volumes

## 📋 Next Steps

Ready for implementing:
- **Candidate Dashboard**: List and search candidates
- **Add Candidate Form**: Multi-section form with validation
- **File Upload UI**: Drag & drop CV upload
- **Error Handling**: Comprehensive error states
- **Navigation**: React Router setup

## 🎨 UI Framework

Using Material-UI (MUI) for:
- Consistent design system
- Responsive components
- Built-in accessibility
- Theme customization
- Icon library