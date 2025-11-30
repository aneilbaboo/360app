import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { invitationsApi, reviewSubmissionsApi } from '@/services/api';
import type { InvitationValidation } from '@/types';
import { CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SubmissionFormData {
  responses: Record<string, string>;
}

const ReviewSubmission: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [validation, setValidation] = useState<InvitationValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmissionFormData>();

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await invitationsApi.validate(token);
      setValidation(data);

      if (!data.valid) {
        toast.error(data.error || 'Invalid or expired invitation');
      }
    } catch (error) {
      console.error('Failed to validate token:', error);
      toast.error('Failed to validate invitation');
      setValidation({ valid: false, error: 'Failed to validate invitation' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SubmissionFormData) => {
    if (!token) return;

    setSubmitting(true);
    try {
      await reviewSubmissionsApi.submit({
        invitationToken: token,
        responses: data.responses,
      });

      setSubmitted(true);
      toast.success('Thank you! Your feedback has been submitted.');
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!validation?.valid || !validation.request) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Invalid Invitation</h2>
          <p className="mt-2 text-sm text-gray-600">
            {validation?.error || 'This invitation link is invalid or has expired.'}
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Feedback Submitted Successfully!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for taking the time to provide honest feedback. Your responses will be
            anonymized and included in the AI-powered analysis.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            You can now close this window.
          </p>
        </div>
      </div>
    );
  }

  const { request } = validation;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="card mb-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600">
              <span className="text-3xl font-bold text-white">360</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{request.title}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Your feedback will remain completely anonymous and will be combined with others to
              provide meaningful insights.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {request.questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <label htmlFor={question.id} className="label">
                  {index + 1}. {question.question}
                  {question.required && <span className="text-red-500"> *</span>}
                </label>

                {question.type === 'textarea' ? (
                  <textarea
                    {...register(`responses.${question.id}`, {
                      required: question.required ? 'This field is required' : false,
                    })}
                    id={question.id}
                    rows={6}
                    className="input"
                    placeholder="Enter your response here..."
                  />
                ) : (
                  <input
                    {...register(`responses.${question.id}`, {
                      required: question.required ? 'This field is required' : false,
                    })}
                    type="text"
                    id={question.id}
                    className="input"
                    placeholder="Enter your response here..."
                  />
                )}

                {errors.responses?.[question.id] && (
                  <p className="text-sm text-red-600">
                    {errors.responses[question.id]?.message}
                  </p>
                )}
              </div>
            ))}

            {/* Privacy Notice */}
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="text-sm font-medium text-blue-900">Privacy & Anonymity</h3>
              <p className="mt-1 text-sm text-blue-700">
                Your responses will be processed by AI to remove any identifying information
                before being shared with the requester. Individual responses are never shown -
                only aggregated themes and insights.
              </p>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmission;
