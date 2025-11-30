import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { reviewRequestsApi, invitationsApi } from '@/services/api';
import type { CreateReviewRequestData, Question } from '@/types';
import { Plus, Trash2, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewFormData {
  title: string;
  questions: Question[];
  minRespondents: number;
  deadline?: string;
  inviteeEmails: string;
}

const CreateReview: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'invitations'>('details');
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormData>({
    defaultValues: {
      title: '',
      questions: [
        {
          id: '1',
          question: 'What are my key strengths?',
          type: 'textarea',
          required: true,
        },
        {
          id: '2',
          question: 'What areas should I focus on improving?',
          type: 'textarea',
          required: true,
        },
      ],
      minRespondents: 10,
      inviteeEmails: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const onSubmitDetails = async (data: ReviewFormData) => {
    setIsLoading(true);
    try {
      const requestData: CreateReviewRequestData = {
        title: data.title,
        questions: data.questions.map((q, idx) => ({
          ...q,
          id: `q${idx + 1}`,
        })),
        minRespondents: data.minRespondents,
        deadline: data.deadline || undefined,
      };

      const request = await reviewRequestsApi.create(requestData);
      setCreatedRequestId(request.id);
      toast.success('Review request created successfully!');
      setStep('invitations');
    } catch (error) {
      console.error('Failed to create review request:', error);
      toast.error('Failed to create review request');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitInvitations = async (data: ReviewFormData) => {
    if (!createdRequestId) return;

    setIsLoading(true);
    try {
      const emails = data.inviteeEmails
        .split('\n')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (emails.length > 0) {
        await invitationsApi.create(createdRequestId, {
          invitations: emails.map((email) => ({ email })),
        });
        toast.success(`Invitations sent to ${emails.length} people!`);
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to send invitations:', error);
      toast.error('Failed to send invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    append({
      id: `${fields.length + 1}`,
      question: '',
      type: 'textarea',
      required: true,
    });
  };

  if (step === 'invitations') {
    return (
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => setStep('details')}
          className="mb-6 flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to details
        </button>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900">Invite Reviewers</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter email addresses of people you want to invite (one per line). You can also skip
            this and share the link manually.
          </p>

          <form onSubmit={handleSubmit(onSubmitInvitations)} className="mt-6 space-y-6">
            <div>
              <label htmlFor="inviteeEmails" className="label">
                Email Addresses (optional)
              </label>
              <textarea
                {...register('inviteeEmails')}
                id="inviteeEmails"
                rows={8}
                className="input font-mono text-sm"
                placeholder="colleague1@example.com&#10;colleague2@example.com&#10;friend@example.com"
              />
              <p className="mt-2 text-sm text-gray-500">
                One email address per line
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1"
              >
                Skip & Go to Dashboard
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Send className="mr-2 h-4 w-4" />
                    Send Invitations
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to dashboard
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900">Create Review Request</h1>
        <p className="mt-2 text-sm text-gray-600">
          Set up your 360 review with custom questions and settings
        </p>

        <form onSubmit={handleSubmit(onSubmitDetails)} className="mt-6 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

            <div>
              <label htmlFor="title" className="label">
                Review Title
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                id="title"
                className="input"
                placeholder="e.g., Q4 2024 Performance Review"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="minRespondents" className="label">
                  Minimum Respondents
                </label>
                <input
                  {...register('minRespondents', {
                    required: 'Minimum respondents is required',
                    min: { value: 1, message: 'Must be at least 1' },
                    max: { value: 50, message: 'Cannot exceed 50' },
                  })}
                  type="number"
                  id="minRespondents"
                  className="input"
                  min="1"
                  max="50"
                />
                {errors.minRespondents && (
                  <p className="mt-1 text-sm text-red-600">{errors.minRespondents.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="deadline" className="label">
                  Deadline (optional)
                </label>
                <input
                  {...register('deadline')}
                  type="datetime-local"
                  id="deadline"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-secondary text-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <label className="label">Question {index + 1}</label>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <textarea
                    {...register(`questions.${index}.question`, {
                      required: 'Question is required',
                    })}
                    className="input mt-2"
                    rows={2}
                    placeholder="Enter your question here..."
                  />
                  {errors.questions?.[index]?.question && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.questions[index]?.question?.message}
                    </p>
                  )}

                  <div className="mt-3 flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        {...register(`questions.${index}.type`)}
                        type="radio"
                        value="text"
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Short answer</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        {...register(`questions.${index}.type`)}
                        type="radio"
                        value="textarea"
                        className="mr-2"
                        defaultChecked
                      />
                      <span className="text-sm text-gray-700">Long answer</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </span>
              ) : (
                'Continue to Invitations'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReview;
