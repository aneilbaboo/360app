import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateReviewRequest from './pages/CreateReviewRequest';
import ReviewRequestDetail from './pages/ReviewRequestDetail';
import SubmitReview from './pages/SubmitReview';
import Results from './pages/Results';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/review/:token" element={<SubmitReview />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/create-request"
        element={
          <PrivateRoute>
            <CreateReviewRequest />
          </PrivateRoute>
        }
      />
      <Route
        path="/requests/:id"
        element={
          <PrivateRoute>
            <ReviewRequestDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/requests/:id/results"
        element={
          <PrivateRoute>
            <Results />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
