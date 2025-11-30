import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Shield, Brain, Users, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-600 shadow-lg">
            <span className="text-5xl font-bold text-white">360</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Get Honest Feedback
            <br />
            <span className="text-primary-600">Powered by AI</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Request anonymized 360-degree reviews from your peers and receive AI-powered insights
            with thematic analysis, sentiment breakdown, and actionable recommendations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/reviews/create" className="btn-secondary text-lg px-8 py-3">
                  Create Review
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-3">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose 360 Review Platform?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Traditional reviews miss the mark. We use AI to unlock honest, actionable insights.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Guaranteed Anonymity
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                AI removes all identifying information. Reviewers can be completely honest.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                AI-Powered Analysis
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Claude, OpenAI, or Perplexity synthesize feedback into themes and insights.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No Account Required
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Reviewers can provide feedback via link. No signup friction.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Actionable Results
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Get prioritized recommendations, not just raw feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 -mx-8 px-8 py-16 rounded-2xl">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get meaningful feedback in three simple steps
            </p>
          </div>

          <div className="mt-12 space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-white font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Create Your Review Request
                </h3>
                <p className="mt-1 text-gray-600">
                  Choose from templates or write custom questions. Set a minimum respondent threshold (default: 10).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Invite Reviewers
                </h3>
                <p className="mt-1 text-gray-600">
                  Share a unique link with peers, colleagues, or friends. They can respond anonymously without creating an account.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Get AI-Powered Insights
                </h3>
                <p className="mt-1 text-gray-600">
                  Once enough responses are collected, our AI analyzes feedback, identifies themes, and provides actionable recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Create your first 360 review request in minutes
            </p>
            <Link to="/register" className="btn-primary mx-auto mt-8 text-lg px-8 py-3">
              Sign Up Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
