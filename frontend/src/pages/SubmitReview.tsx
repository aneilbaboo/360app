import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invitationAPI, submissionAPI } from '../services/api';
import type { ReviewRequest, Invitation } from '../types';

export default function SubmitReview() {
  const { token } = useParams<{ token: string }>();
  const [reviewRequest, setReviewRequest] = useState<ReviewRequest | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  const loadInvitation = async () => {
    try {
      const response = await invitationAPI.validate(token!);
      setReviewRequest(response.data.reviewRequest);
      setInvitation(response.data.invitation);

      // Initialize responses
      const initialResponses: Record<string, string> = {};
      response.data.reviewRequest.questions.forEach(q => {
        initialResponses[q.id] = '';
      });
      setResponses(initialResponses);
    } catch (err: any) {
      setError('Invalid or expired invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required questions
    const missingRequired = reviewRequest?.questions.filter(
      q => q.required && !responses[q.id]?.trim()
    );

    if (missingRequired && missingRequired.length > 0) {
      setError('Please answer all required questions');
      return;
    }

    setSubmitting(true);

    try {
      await submissionAPI.submit(token!, responses);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error && !reviewRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/" className="text-indigo-600 hover:text-indigo-500">
            Go to home page
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow sm:rounded-lg p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Thank You!
          </h3>
          <p className="text-gray-500">
            Your feedback has been submitted successfully. Your responses are anonymous and will be included in the AI-powered analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {reviewRequest?.title}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Your responses are completely anonymous. Please provide honest and constructive feedback.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {reviewRequest?.questions.map((question, index) => (
                <div key={question.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {index + 1}. {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows={4}
                    value={responses[question.id] || ''}
                    onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                    required={question.required}
                  />
                </div>
              ))}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            <strong>Privacy Notice:</strong> Your responses will be processed by AI to generate aggregated insights. Individual responses will never be shown to ensure anonymity.
          </p>
        </div>
      </div>
    </div>
  );
}
