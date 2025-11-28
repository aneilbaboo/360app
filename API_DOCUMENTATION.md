# API Documentation - 360 Review Platform

## Overview

This document provides detailed documentation for all API endpoints in the 360 Review Platform.

**Base URL**: `http://localhost:3000/api/v1`

**Content Type**: `application/json`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Rate Limiting

- General endpoints: 100 requests/minute
- Authentication endpoints: 5 requests/minute
- Submission endpoints: 10 requests/minute

## Endpoints

### Authentication

#### POST /auth/register

Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Validation**:
- Email must be valid format
- Password minimum 8 characters with uppercase, lowercase, and number

**Response** (201):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token"
}
```

**Errors**:
- 400: Validation error
- 409: Email already exists

---

#### POST /auth/login

Login with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token"
}
```

**Errors**:
- 401: Invalid credentials

---

#### GET /auth/oauth/google

Initiate Google OAuth flow.

**Response**: Redirects to Google OAuth consent screen

---

#### GET /auth/oauth/google/callback

Google OAuth callback endpoint.

**Response**: Redirects to frontend with access token

---

#### GET /auth/oauth/facebook

Initiate Facebook OAuth flow.

**Response**: Redirects to Facebook OAuth consent screen

---

#### GET /auth/oauth/facebook/callback

Facebook OAuth callback endpoint.

**Response**: Redirects to frontend with access token

---

#### POST /auth/refresh

Refresh access token.

**Headers**: `Authorization: Bearer <access_token>`

**Response** (200):
```json
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-jwt-refresh-token"
}
```

**Errors**:
- 401: Invalid or expired token

---

#### POST /auth/logout

Logout (client-side token removal in stateless JWT system).

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

### Review Requests

#### POST /reviews/requests

Create a new review request.

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "title": "Q4 2024 Performance Review",
  "questions": [
    {
      "id": "q1",
      "question": "What are my key strengths?",
      "type": "text",
      "required": true
    },
    {
      "id": "q2",
      "question": "What areas should I focus on improving?",
      "type": "text",
      "required": true
    },
    {
      "id": "q3",
      "question": "Rate my communication skills (1-5)",
      "type": "rating",
      "required": false
    }
  ],
  "minRespondents": 10,
  "deadline": "2024-12-31T23:59:59Z"
}
```

**Validation**:
- Title: 3-200 characters
- Questions: Array with at least 1 question
- Each question must have: id, question, type (text|rating|multipleChoice), required
- minRespondents: 1-50
- deadline: ISO 8601 format (optional)

**Response** (201):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "Q4 2024 Performance Review",
  "questions": [...],
  "minRespondents": 10,
  "deadline": "2024-12-31T23:59:59.000Z",
  "status": "OPEN",
  "shareableToken": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "closedAt": null,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Errors**:
- 400: Validation error
- 401: Unauthorized

---

#### GET /reviews/requests

List all review requests for authenticated user.

**Headers**: `Authorization: Bearer <access_token>`

**Response** (200):
```json
[
  {
    "id": "uuid",
    "title": "Q4 2024 Performance Review",
    "status": "OPEN",
    "minRespondents": 10,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "invitations": 15,
      "submissions": 8
    },
    "result": {
      "processingStatus": "PENDING"
    }
  }
]
```

---

#### GET /reviews/requests/:id

Get a specific review request.

**Headers**: `Authorization: Bearer <access_token>`

**Parameters**:
- `id` (path): UUID of review request

**Response** (200):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "Q4 2024 Performance Review",
  "questions": [...],
  "minRespondents": 10,
  "deadline": "2024-12-31T23:59:59.000Z",
  "status": "OPEN",
  "shareableToken": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "closedAt": null,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "_count": {
    "invitations": 15,
    "submissions": 8
  },
  "result": null
}
```

**Errors**:
- 401: Unauthorized
- 403: Not the owner
- 404: Review request not found

---

#### PUT /reviews/requests/:id

Update a review request (only if no submissions yet).

**Headers**: `Authorization: Bearer <access_token>`

**Parameters**:
- `id` (path): UUID of review request

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "questions": [...],
  "minRespondents": 15,
  "deadline": "2024-12-31T23:59:59Z"
}
```

**Response** (200): Updated review request object

**Errors**:
- 401: Unauthorized
- 403: Not the owner
- 404: Review request not found
- 422: Already has submissions or not OPEN

---

#### POST /reviews/requests/:id/close

Manually close a review request and trigger AI processing.

**Headers**: `Authorization: Bearer <access_token>`

**Parameters**:
- `id` (path): UUID of review request

**Response** (200):
```json
{
  "id": "uuid",
  "status": "CLOSED",
  "closedAt": "2024-01-01T00:00:00.000Z",
  ...
}
```

**Errors**:
- 401: Unauthorized
- 403: Not the owner
- 404: Review request not found
- 422: Not enough submissions or already closed

---

#### DELETE /reviews/requests/:id

Delete a review request.

**Headers**: `Authorization: Bearer <access_token>`

**Parameters**:
- `id` (path): UUID of review request

**Response** (200):
```json
{
  "message": "Review request deleted successfully"
}
```

**Errors**:
- 401: Unauthorized
- 403: Not the owner
- 404: Review request not found

---

### Invitations

#### POST /reviews/requests/:id/invitations

Create invitations for a review request.

**Headers**: `Authorization: Bearer <access_token>`

**Parameters**:
- `id` (path): UUID of review request

**Request Body**:
```json
{
  "invitations": [
    { "email": "reviewer1@example.com" },
    { "email": "reviewer2@example.com" },
    { "userId": "existing-user-uuid" }
  ]
}
```

**Validation**:
- Array must have at least 1 invitation
- Each invitation must have either email or userId

**Response** (201):
```json
[
  {
    "id": "uuid",
    "requestId": "uuid",
    "inviteeEmail": "reviewer1@example.com",
    "invitationToken": "uuid",
    "status": "PENDING",
    "sentAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Errors**:
- 401: Unauthorized
- 403: Not the owner
- 404: Review request not found
- 422: Review request not OPEN

---

#### GET /reviews/requests/:id/invitations

List all invitations for a review request.

**Headers**: `Authorization: Bearer <access_token>`

**Parameters**:
- `id` (path): UUID of review request

**Response** (200):
```json
[
  {
    "id": "uuid",
    "requestId": "uuid",
    "inviteeEmail": "reviewer@example.com",
    "invitationToken": "uuid",
    "status": "SUBMITTED",
    "sentAt": "2024-01-01T00:00:00.000Z",
    "submittedAt": "2024-01-02T00:00:00.000Z",
    "inviteeUser": null,
    "submission": {
      "id": "uuid",
      "submittedAt": "2024-01-02T00:00:00.000Z"
    }
  }
]
```

---

#### GET /invitations/:token

Validate an invitation token (public endpoint).

**Parameters**:
- `token` (path): UUID of invitation token

**Response** (200):
```json
{
  "invitationId": "uuid",
  "requestId": "uuid",
  "title": "Q4 2024 Performance Review",
  "questions": [...]
}
```

**Errors**:
- 404: Invitation not found
- 422: Invitation expired, already used, or request closed

---

### Review Submissions

#### POST /reviews/submissions

Submit a review (anonymous or authenticated).

**Headers** (optional): `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "invitationToken": "uuid",
  "responses": {
    "q1": "Great leadership and communication skills",
    "q2": "Could improve time management",
    "q3": 5
  }
}
```

**Validation**:
- All required questions must be answered
- Invitation token must be valid

**Response** (201):
```json
{
  "submissionId": "uuid",
  "message": "Review submitted successfully",
  "submittedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors**:
- 404: Invitation not found
- 409: Invitation already used
- 422: Invitation expired, required questions missing, or request closed

---

#### GET /reviews/submissions/requests/:id/stats

Get submission statistics for a review request.

**Headers**: `Authorization: Bearer <access_token>`

**Parameters**:
- `id` (path): UUID of review request

**Response** (200):
```json
{
  "totalInvitations": 15,
  "submitted": 8,
  "pending": 7,
  "minRespondents": 10,
  "canClose": false,
  "status": "OPEN"
}
```

---

### Results

#### GET /reviews/requests/:id/results

Get AI-synthesized results for a review request.

**Headers**: `Authorization: Bearer <access_token>`

**Parameters**:
- `id` (path): UUID of review request

**Response** (200) - Available:
```json
{
  "available": true,
  "result": {
    "anonymizedSummary": "Overall, feedback highlights strong leadership...",
    "themes": {
      "communication": {
        "frequency": 12,
        "examples": ["Great communicator", "Clear in meetings"]
      },
      "leadership": {
        "frequency": 10,
        "examples": ["Strong leader", "Inspires the team"]
      }
    },
    "sentimentAnalysis": {
      "positive": 75,
      "negative": 10,
      "neutral": 15,
      "distribution": {
        "very_positive": 5,
        "positive": 10,
        "neutral": 3,
        "negative": 2,
        "very_negative": 0
      }
    },
    "skillCategories": {
      "leadership": ["Strong vision", "Team motivation"],
      "communication": ["Clear communication", "Active listening"],
      "technical": ["Strong technical knowledge"],
      "collaboration": ["Works well with others"],
      "other": ["Time management needs improvement"]
    },
    "actionableItems": [
      {
        "category": "time_management",
        "item": "Improve prioritization of tasks",
        "priority": "high"
      }
    ],
    "strengthsVsImprovements": {
      "strengths": ["Leadership", "Communication", "Technical skills"],
      "improvements": ["Time management", "Delegation"]
    }
  }
}
```

**Response** (200) - Not Available:
```json
{
  "available": false,
  "status": "OPEN",
  "message": "Waiting for more responses. 8 of 15 submitted."
}
```

**Errors**:
- 401: Unauthorized
- 403: Not the owner
- 404: Review request not found

---

#### GET /reviews/requests/:id/status

Get processing status for a review request.

**Headers**: `Authorization: Bearer <access_token>`

**Parameters**:
- `id` (path): UUID of review request

**Response** (200):
```json
{
  "status": "completed",
  "message": "Results ready"
}
```

---

### Notifications

#### GET /notifications

Get user notifications.

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters**:
- `unreadOnly` (optional): `true` to get only unread notifications

**Response** (200):
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "RESULTS_READY",
    "requestId": "uuid",
    "message": "Your 360 review results are ready!",
    "read": false,
    "sentAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

#### PUT /notifications/:id/read

Mark a notification as read.

**Headers**: `Authorization: Bearer <access_token>`

**Parameters**:
- `id` (path): UUID of notification

**Response** (200):
```json
{
  "message": "Notification marked as read"
}
```

---

#### PUT /notifications/read-all

Mark all notifications as read.

**Headers**: `Authorization: Bearer <access_token>`

**Response** (200):
```json
{
  "message": "All notifications marked as read"
}
```

---

## Webhook Events (Future)

Webhooks for external integrations (not yet implemented):

- `review.created`
- `review.closed`
- `submission.received`
- `results.ready`

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required or failed |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict (duplicate) |
| `UNPROCESSABLE_ENTITY` | Cannot process request |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVICE_UNAVAILABLE` | AI provider or service unavailable |
| `INTERNAL_SERVER_ERROR` | Unexpected server error |

## Best Practices

1. **Token Management**: Store tokens securely, refresh before expiration
2. **Error Handling**: Always check error responses and handle appropriately
3. **Rate Limiting**: Implement exponential backoff for rate limit errors
4. **Idempotency**: Avoid duplicate submissions using invitation tokens
5. **Validation**: Validate data client-side before sending to API
