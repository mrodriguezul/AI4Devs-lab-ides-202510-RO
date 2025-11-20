# ATS API Documentation

## Base URL
`http://localhost:3010/api`

## Candidate Management Endpoints

### 1. Get All Candidates
- **URL:** `/candidates`
- **Method:** `GET`
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term for filtering candidates
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "address": "123 Main St, City, State",
      "cvFilePath": "/path/to/cv.pdf",
      "createdAt": "2025-11-20T08:00:00.000Z",
      "updatedAt": "2025-11-20T08:00:00.000Z",
      "education": [
        {
          "id": 1,
          "degree": "Bachelor of Computer Science",
          "institution": "University of Technology",
          "graduationYear": 2020,
          "candidateId": 1
        }
      ],
      "workExperience": [
        {
          "id": 1,
          "company": "Tech Corp",
          "position": "Software Developer",
          "startDate": "2020-06-01T00:00:00.000Z",
          "endDate": "2023-12-31T00:00:00.000Z",
          "description": "Developed web applications using React and Node.js",
          "candidateId": 1
        }
      ]
    }
  ],
  "message": "Candidates retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 2. Get Candidate by ID
- **URL:** `/candidates/:id`
- **Method:** `GET`
- **Parameters:**
  - `id`: Candidate ID
- **Response:** Same as individual candidate object above

### 3. Create New Candidate
- **URL:** `/candidates`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Body Parameters:**
  - `firstName` (required): Candidate's first name
  - `lastName` (required): Candidate's last name
  - `email` (required): Valid email address
  - `phone` (optional): Phone number
  - `address` (optional): Full address
  - `education` (optional): JSON string of education array
  - `workExperience` (optional): JSON string of work experience array
  - `cv` (optional): CV file (PDF or DOCX, max 10MB)

**Education Array Format:**
```json
[
  {
    "degree": "Bachelor of Computer Science",
    "institution": "University of Technology",
    "graduationYear": 2020
  }
]
```

**Work Experience Array Format:**
```json
[
  {
    "company": "Tech Corp",
    "position": "Software Developer",
    "startDate": "2020-06-01",
    "endDate": "2023-12-31",
    "description": "Developed web applications"
  }
]
```

- **Response:**
```json
{
  "success": true,
  "data": { /* candidate object */ },
  "message": "Candidate created successfully with CV upload"
}
```

### 4. Update Candidate
- **URL:** `/candidates/:id`
- **Method:** `PUT`
- **Content-Type:** `multipart/form-data`
- **Parameters:** Same as create, but all fields are optional
- **Response:** Updated candidate object

### 5. Delete Candidate
- **URL:** `/candidates/:id`
- **Method:** `DELETE`
- **Parameters:**
  - `id`: Candidate ID
- **Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Candidate deleted successfully"
}
```

### 6. Download CV
- **URL:** `/candidates/:id/cv`
- **Method:** `GET`
- **Parameters:**
  - `id`: Candidate ID
- **Response:** File download

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Please check the provided data",
  "data": [
    {
      "type": "field",
      "msg": "First name is required",
      "path": "firstName",
      "location": "body"
    }
  ]
}
```

### Not Found Error
```json
{
  "success": false,
  "error": "Candidate not found"
}
```

### File Upload Error
```json
{
  "success": false,
  "error": "File too large. Maximum size is 10MB."
}
```

## Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad request / Validation error
- `404` - Not found
- `409` - Conflict (duplicate email)
- `500` - Internal server error