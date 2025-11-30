import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import CreateReview from '@/pages/CreateReview';
import ReviewSubmission from '@/pages/ReviewSubmission';
import Results from '@/pages/Results';
import Notifications from '@/pages/Notifications';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#363636',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes - No Layout */}
          <Route path="/review/:token" element={<ReviewSubmission />} />

          {/* Public Routes - With Layout */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/login"
            element={
              <Layout>
                <Login />
              </Layout>
            }
          />
          <Route
            path="/register"
            element={
              <Layout>
                <Register />
              </Layout>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/reviews/create"
            element={
              <Layout>
                <ProtectedRoute>
                  <CreateReview />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/reviews/:id/results"
            element={
              <Layout>
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/notifications"
            element={
              <Layout>
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              </Layout>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
