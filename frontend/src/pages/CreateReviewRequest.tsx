import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reviewRequestAPI } from '../services/api';
import type { Question } from '../types';

export default function CreateReviewRequest() {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', question: '', type: 'text', required: true }
  ]);
  const [minRespondents, setMinRespondents] = useState(5);
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addQuestion = () => {
    const newQuestion: Question = {
      id: String(questions.length + 1),
      question: '',
      type: 'text',
      required: true
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (questions.some(q => !q.question.trim())) {
      setError('Please fill in all questions');
      return;
    }

    if (!deadline) {
      setError('Please set a deadline');
      return;
    }

    setLoading(true);

    try {
      const response = await reviewRequestAPI.create({
        title,
        questions,
        minRespondents,
        deadline: new Date(deadline).toISOString(),
        status: 'draft'
      });

      navigate(`/requests/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create review request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Create Review Request
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Review Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Q4 2024 Performance Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Questions
                </label>
                {questions.map((question, index) => (
                  <div key={question.id} className="mb-4 p-4 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Question {index + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      rows={2}
                      placeholder="Enter your question"
                      value={question.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    />
                    <div className="mt-2 flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={question.required}
                        onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-700">
                        Required
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  + Add Question
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minRespondents" className="block text-sm font-medium text-gray-700">
                    Minimum Respondents
                  </label>
                  <input
                    type="number"
                    id="minRespondents"
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={minRespondents}
                    onChange={(e) => setMinRespondents(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                    Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {loading ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
