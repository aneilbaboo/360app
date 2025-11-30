import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewRequestsApi, reviewSubmissionsApi } from '@/services/api';
import type { ReviewRequest, SubmissionStats } from '@/types';
import { Plus, Eye, Share2, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsMap, setStatsMap] = useState<Record<string, SubmissionStats>>({});

  useEffect(() => {
    loadReviewRequests();
  }, []);

  const loadReviewRequests = async () => {
    try {
      setLoading(true);
      const data = await reviewRequestsApi.list();
      setRequests(data);

      // Load stats for each request
      const stats: Record<string, SubmissionStats> = {};
      await Promise.all(
        data.map(async (request) => {
          try {
            const stat = await reviewSubmissionsApi.getStats(request.id);
            stats[request.id] = stat;
          } catch (error) {
            console.error(`Failed to load stats for request ${request.id}:`, error);
          }
        })
      );
      setStatsMap(stats);
    } catch (error) {
      console.error('Failed to load review requests:', error);
      toast.error('Failed to load review requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/review/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleClose = async (id: string) => {
    if (!confirm('Are you sure you want to close this review request?')) {
      return;
    }

    try {
      await reviewRequestsApi.close(id);
      toast.success('Review request closed successfully');
      loadReviewRequests();
    } catch (error) {
      console.error('Failed to close request:', error);
      toast.error('Failed to close review request');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review request? This action cannot be undone.')) {
      return;
    }

    try {
      await reviewRequestsApi.delete(id);
      toast.success('Review request deleted successfully');
      loadReviewRequests();
    } catch (error) {
      console.error('Failed to delete request:', error);
      toast.error('Failed to delete review request');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: <span className="badge-info">Open</span>,
      closed: <span className="badge-warning">Closed</span>,
      processing: <span className="badge-warning">Processing</span>,
      completed: <span className="badge-success">Completed</span>,
    };
    return badges[status as keyof typeof badges] || <span className="badge">{status}</span>;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your 360 review requests and view results
          </p>
        </div>
        <Link to="/reviews/create" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Create Review Request
        </Link>
      </div>

      {/* Empty State */}
      {requests.length === 0 ? (
        <div className="card text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <Plus className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No review requests yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Get started by creating your first 360 review request
          </p>
          <Link to="/reviews/create" className="btn-primary mx-auto mt-6">
            Create Review Request
          </Link>
        </div>
      ) : (
        /* Review Requests Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => {
            const stats = statsMap[request.id];
            const progress = stats
              ? Math.round((stats.totalSubmissions / request.minRespondents) * 100)
              : 0;

            return (
              <div key={request.id} className="card flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Created {format(new Date(request.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {/* Stats */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Responses</span>
                    <span className="font-medium text-gray-900">
                      {stats?.totalSubmissions || 0} / {request.minRespondents}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-primary-600 transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  {/* Status Messages */}
                  <div className="flex items-start space-x-2 text-sm">
                    {stats?.minRespondentsMet ? (
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    ) : stats?.totalSubmissions ? (
                      <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    )}
                    <span className="text-gray-600">
                      {stats?.minRespondentsMet
                        ? 'Minimum responses met'
                        : stats?.totalSubmissions
                        ? `${request.minRespondents - (stats.totalSubmissions || 0)} more needed`
                        : 'No responses yet'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {request.status === 'completed' && stats?.canViewResults && (
                    <Link
                      to={`/reviews/${request.id}/results`}
                      className="btn-primary flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Results
                    </Link>
                  )}

                  {request.status === 'open' && (
                    <>
                      <button
                        onClick={() => handleCopyLink(request.shareableToken)}
                        className="btn-secondary flex-1"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Link
                      </button>
                      {stats?.minRespondentsMet && (
                        <button
                          onClick={() => handleClose(request.id)}
                          className="btn-secondary"
                        >
                          Close
                        </button>
                      )}
                    </>
                  )}

                  {request.status === 'processing' && (
                    <div className="flex flex-1 items-center justify-center text-sm text-gray-600">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                      Processing...
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(request.id)}
                    className="btn-secondary text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
