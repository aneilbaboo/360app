# 360 Review Platform with AI-Powered Feedback Synthesis

A comprehensive platform that enables users to request anonymized 360-degree reviews from peers, with AI-powered analysis and synthesis of feedback. The system processes responses through configurable LLM providers (Claude, OpenAI, or Perplexity) to generate anonymized summaries with thematic analysis.

## Features

- **Anonymous Feedback Collection**: Reviewers can provide honest feedback without creating an account
- **AI-Powered Synthesis**: Automatic analysis of feedback using Claude, OpenAI, or Perplexity
- **Comprehensive Insights**: Sentiment analysis, theme extraction, skill categorization, and actionable recommendations
- **Flexible Authentication**: Email/password and OAuth (Google, Facebook) support
- **Smart Notifications**: Email and in-app notifications for key events
- **Secure & Private**: Industry-standard security with HTTPS, JWT, rate limiting, and data encryption

## Technology Stack

- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT, Passport (OAuth)
- **AI Providers**: Claude (Anthropic), OpenAI, Perplexity
- **Email**: Nodemailer with SendGrid support
- **Security**: Helmet, CORS, bcrypt, rate limiting

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- API keys for at least one AI provider (Claude, OpenAI, or Perplexity)
- SendGrid API key (optional, for email notifications)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd 360app
npm install
```

### 2. Configure Environment

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/360_review_db"

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI Provider (choose one: claude, openai, perplexity)
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your-anthropic-api-key

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (optional)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view your database
npm run prisma:studio
```

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

#### OAuth
```http
GET /auth/oauth/google
GET /auth/oauth/facebook
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <access_token>
```

### Review Request Endpoints

#### Create Review Request
```http
POST /reviews/requests
Authorization: Bearer <access_token>
Content-Type: application/json

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
    }
  ],
  "minRespondents": 10,
  "deadline": "2024-12-31T23:59:59Z"
}
```

#### List Review Requests
```http
GET /reviews/requests
Authorization: Bearer <access_token>
```

#### Get Review Request
```http
GET /reviews/requests/:id
Authorization: Bearer <access_token>
```

#### Update Review Request
```http
PUT /reviews/requests/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "minRespondents": 15
}
```

#### Close Review Request
```http
POST /reviews/requests/:id/close
Authorization: Bearer <access_token>
```

#### Delete Review Request
```http
DELETE /reviews/requests/:id
Authorization: Bearer <access_token>
```

### Invitation Endpoints

#### Create Invitations
```http
POST /reviews/requests/:id/invitations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "invitations": [
    { "email": "reviewer1@example.com" },
    { "email": "reviewer2@example.com" },
    { "userId": "existing-user-id" }
  ]
}
```

#### List Invitations
```http
GET /reviews/requests/:id/invitations
Authorization: Bearer <access_token>
```

#### Validate Invitation
```http
GET /invitations/:token
```

### Review Submission Endpoints

#### Submit Review (Anonymous or Authenticated)
```http
POST /reviews/submissions
Content-Type: application/json
Authorization: Bearer <access_token> (optional)

{
  "invitationToken": "invitation-token-uuid",
  "responses": {
    "q1": "Great leadership and communication skills",
    "q2": "Could improve time management"
  }
}
```

#### Get Submission Stats
```http
GET /reviews/submissions/requests/:id/stats
Authorization: Bearer <access_token>
```

### Results Endpoints

#### Get Results
```http
GET /reviews/requests/:id/results
Authorization: Bearer <access_token>
```

#### Get Processing Status
```http
GET /reviews/requests/:id/status
Authorization: Bearer <access_token>
```

### Notification Endpoints

#### Get User Notifications
```http
GET /notifications?unreadOnly=true
Authorization: Bearer <access_token>
```

#### Mark Notification as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <access_token>
```

#### Mark All as Read
```http
PUT /notifications/read-all
Authorization: Bearer <access_token>
```

## Error Responses

All errors follow this standard format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `422`: Unprocessable entity
- `429`: Rate limit exceeded
- `500`: Internal server error
- `503`: Service unavailable (AI provider down)

## Development

### Project Structure

```
360app/
├── src/
│   ├── config/           # Configuration files (Passport)
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   │   └── ai/          # AI provider integrations
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env.example         # Environment variables template
├── package.json
└── tsconfig.json
```

### Running Tests

```bash
npm test
```

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name migration-name

# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npm run prisma:studio
```

## AI Provider Configuration

### Claude (Anthropic)

1. Get API key from https://console.anthropic.com/
2. Set in `.env`:
```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-xxx
```

### OpenAI

1. Get API key from https://platform.openai.com/
2. Set in `.env`:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
```

### Perplexity

1. Get API key from https://www.perplexity.ai/
2. Set in `.env`:
```env
AI_PROVIDER=perplexity
PERPLEXITY_API_KEY=pplx-xxx
```

## Security Considerations

- **HTTPS Only**: Always use HTTPS in production
- **JWT Secret**: Use a strong, randomly generated secret
- **Password Policy**: Minimum 8 characters with uppercase, lowercase, and numbers
- **Rate Limiting**: Configured to prevent abuse
- **SQL Injection**: Protected via Prisma ORM
- **XSS Protection**: Helmet middleware enabled
- **CORS**: Configured for allowed origins only

## Production Deployment

### Environment Variables

Ensure all required environment variables are set:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-secret>
AI_PROVIDER=<provider>
ANTHROPIC_API_KEY=<key>
FRONTEND_URL=<production-frontend-url>
ALLOWED_ORIGINS=<comma-separated-origins>
```

### Database

```bash
# Run migrations in production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Build and Start

```bash
npm run build
npm start
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
