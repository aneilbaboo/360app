import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reviewRequestAPI } from '../services/api';
import type { AIResult } from '../types';

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadResults();
    }
  }, [id]);

  const loadResults = async () => {
    try {
      const response = await reviewRequestAPI.getResults(id!);
      setResults(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Results are still being processed. Please check back later.');
      } else {
        setError('Failed to load results');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading results...</p>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link to={`/requests/${id}`} className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block">
            ← Back to Request
          </Link>
          <div className="bg-white shadow sm:rounded-lg p-6">
            <p className="text-gray-600">{error || 'Results not available'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to={`/requests/${id}`} className="text-indigo-600 hover:text-indigo-500">
            ← Back to Request
          </Link>
        </div>

        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Review Analysis</h2>
            <p className="text-sm text-gray-500 mb-4">
              Processed on {new Date(results.processedAt).toLocaleString()}
            </p>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Executive Summary</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{results.summary}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Analysis</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">Overall Sentiment:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    results.sentimentAnalysis.overall === 'positive' ? 'bg-green-100 text-green-800' :
                    results.sentimentAnalysis.overall === 'negative' ? 'bg-red-100 text-red-800' :
                    results.sentimentAnalysis.overall === 'mixed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {results.sentimentAnalysis.overall}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Key Strengths</h3>
                <ul className="space-y-2">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {results.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Identified Themes</h3>
              <div className="space-y-4">
                {results.themes.map((theme, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{theme.theme}</h4>
                      <span className="text-sm text-gray-500">
                        Mentioned {theme.frequency} time{theme.frequency !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-gray-700">{theme.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Assessment</h3>
              <div className="space-y-3">
                {Object.entries(results.skillCategories).map(([skill, data]) => (
                  <div key={skill} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{skill}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        data.level === 'Expert' ? 'bg-green-100 text-green-800' :
                        data.level === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                        data.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {data.level}
                      </span>
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {data.evidence.map((evidence, idx) => (
                        <li key={idx}>{evidence}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actionable Recommendations</h3>
              <ol className="list-decimal list-inside space-y-2">
                {results.actionableRecommendations.map((recommendation, index) => (
                  <li key={index} className="text-gray-700 pl-2">
                    {recommendation}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
