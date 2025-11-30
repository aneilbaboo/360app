# 360 Review Platform - Frontend

Modern React-based frontend for the 360 Review Platform, built with TypeScript, Vite, and Tailwind CSS.

## Features

- **Responsive Design**: Mobile-first approach with responsive layouts for all screen sizes
- **Authentication**: Email/password and OAuth (Google, Facebook) login
- **Review Management**: Create, manage, and track 360 review requests
- **Anonymous Submissions**: Allow reviewers to provide feedback without creating an account
- **AI-Powered Results**: Visualize AI-synthesized feedback with interactive charts
- **Real-time Notifications**: Stay updated on review progress
- **Accessibility**: WCAG 2.1 Level AA compliant

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3000`

### Installation

```bash
# From the client directory
cd client
npm install
```

### Development

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:5173
```

The Vite dev server is configured to proxy API requests to the backend at `http://localhost:3000`.

### Building for Production

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist` directory.

## Project Structure

```
client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CreateReview.tsx
│   │   ├── ReviewSubmission.tsx
│   │   ├── Results.tsx
│   │   └── Notifications.tsx
│   ├── services/         # API services
│   │   └── api.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   └── cn.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Key Features

### Authentication

The app supports:
- Email/password registration and login
- OAuth authentication (Google, Facebook)
- JWT token management with automatic refresh
- Protected routes requiring authentication

### Review Request Management

Users can:
- Create review requests with custom questions
- Set minimum respondent thresholds
- Share review links with peers
- Track response progress
- Close requests manually
- View AI-synthesized results

### Anonymous Review Submission

Reviewers can:
- Access review forms via unique token links
- Submit feedback without creating an account
- See privacy guarantees about anonymization

### Results Visualization

Results pages include:
- Executive summary
- Sentiment analysis pie chart
- Key themes bar chart
- Skill categories radar chart
- Actionable recommendations with priority levels
- Download results as text file

### Notifications

Users receive notifications for:
- Minimum respondent threshold reached
- New responses received
- Results ready to view
- Reminders for pending reviews

## Environment Variables

Create a `.env` file in the client directory:

```env
# API Configuration
# Leave blank to use proxy (default)
VITE_API_URL=
```

## API Integration

The frontend communicates with the backend API at `/api/v1`. All API calls are handled through the `services/api.ts` module, which includes:

- Automatic JWT token injection
- Token refresh on 401 responses
- Error handling
- Type-safe request/response interfaces

## Styling

The app uses Tailwind CSS with a custom design system:

- Primary color: Blue (`#0ea5e9`)
- Utility classes for buttons, inputs, cards, and badges
- Responsive breakpoints (sm, md, lg)
- Custom scrollbar styling
- Focus indicators for accessibility

## Accessibility

The frontend follows WCAG 2.1 Level AA guidelines:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators on interactive elements
- Screen reader compatibility
- Loading states with appropriate ARIA attributes

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

When adding new features:

1. Follow the existing TypeScript patterns
2. Use React Hook Form for forms
3. Add proper error handling
4. Ensure responsive design
5. Test accessibility with keyboard navigation
6. Add loading states for async operations
7. Use toast notifications for user feedback

## License

MIT
