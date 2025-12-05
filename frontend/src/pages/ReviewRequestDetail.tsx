import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { reviewRequestAPI, invitationAPI, submissionAPI } from '../services/api';
import type { ReviewRequest, Invitation } from '../types';

export default function ReviewRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ReviewRequest | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [newEmails, setNewEmails] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [requestRes, invitationsRes, statsRes] = await Promise.all([
        reviewRequestAPI.get(id!),
        invitationAPI.list(id!),
        submissionAPI.getStats(id!)
      ]);
      setRequest(requestRes.data);
      setInvitations(invitationsRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      setError('Failed to load review request');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvitations = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = newEmails.split('\n').map(e => e.trim()).filter(e => e);
    if (emails.length === 0) return;

    try {
      await invitationAPI.create(id!, emails.map(email => ({ email })));
      setNewEmails('');
      loadData();
    } catch (err: any) {
      alert('Failed to send invitations');
    }
  };

  const handleCloseRequest = async () => {
    if (!confirm('Are you sure you want to close this review request?')) return;

    try {
      await reviewRequestAPI.close(id!);
      loadData();
    } catch (err: any) {
      alert('Failed to close request');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error || 'Request not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{request.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Status: <span className="font-medium">{request.status}</span>
                </p>
              </div>
              <div className="space-x-2">
                {request.status === 'completed' && (
                  <Link
                    to={`/requests/${id}/results`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    View Results
                  </Link>
                )}
                {request.status === 'active' && (
                  <button
                    onClick={handleCloseRequest}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close Request
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Total Invitations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Questions</h4>
              <ol className="list-decimal list-inside space-y-2">
                {request.questions.map((q, i) => (
                  <li key={q.id} className="text-gray-700">
                    {q.question}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Invite Reviewers</h4>
              <form onSubmit={handleAddInvitations} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Addresses (one per line)
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows={4}
                    placeholder="reviewer1@example.com&#10;reviewer2@example.com"
                    value={newEmails}
                    onChange={(e) => setNewEmails(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Send Invitations
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Invitations</h4>
            {invitations.length === 0 ? (
              <p className="text-gray-500">No invitations sent yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invited
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invitations.map((invitation) => (
                      <tr key={invitation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invitation.email || 'Registered User'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            invitation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            invitation.status === 'expired' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invitation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
