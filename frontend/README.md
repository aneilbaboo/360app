# 360 Review Platform - Frontend

React + TypeScript frontend for the 360 Review Platform with AI-powered feedback synthesis.

## Features

- User authentication (login/register)
- Create and manage 360 review requests
- Send invitations to reviewers
- Anonymous review submission
- AI-powered results dashboard with:
  - Executive summary
  - Sentiment analysis
  - Key strengths and improvement areas
  - Identified themes
  - Skill assessments
  - Actionable recommendations

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/           # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CreateReviewRequest.tsx
│   │   ├── ReviewRequestDetail.tsx
│   │   ├── SubmitReview.tsx
│   │   └── Results.tsx
│   ├── services/        # API client
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app component with routing
│   └── main.tsx         # Entry point
├── index.html
├── vite.config.ts
└── package.json
```

## API Integration

The frontend connects to the backend API via a proxy configured in `vite.config.ts`. All `/api` requests are forwarded to `http://localhost:3000`.

### Authentication

JWT tokens are stored in localStorage:
- `accessToken` - Used for authenticated requests
- `refreshToken` - Used to refresh expired access tokens

### Available Routes

- `/login` - User login
- `/register` - User registration
- `/dashboard` - View all review requests
- `/create-request` - Create new review request
- `/requests/:id` - View and manage specific request
- `/requests/:id/results` - View AI analysis results
- `/review/:token` - Anonymous review submission (public)

## Environment Variables

Create a `.env` file if you need to customize the API URL:

```env
VITE_API_URL=http://localhost:3000
```

## Development

The app uses:
- Hot Module Replacement (HMR) for instant updates
- TypeScript for type checking
- Tailwind CSS for utility-first styling
- React Router for navigation
- Custom hooks for auth and API calls

## License

MIT
