import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resultsApi, reviewRequestsApi } from '@/services/api';
import type { AIProcessingResult, ReviewRequest } from '@/types';
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
  primary: '#0ea5e9',
};

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<AIProcessingResult | null>(null);
  const [request, setRequest] = useState<ReviewRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadResults();
    }
  }, [id]);

  const loadResults = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [resultsData, requestData] = await Promise.all([
        resultsApi.get(id),
        reviewRequestsApi.get(id),
      ]);
      setResults(resultsData);
      setRequest(requestData);
    } catch (error) {
      console.error('Failed to load results:', error);
      toast.error('Failed to load results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!results || !request) return;

    const content = generateResultsText(results, request);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${request.title.replace(/\s+/g, '_')}_Results.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Results downloaded!');
  };

  const generateResultsText = (results: AIProcessingResult, request: ReviewRequest): string => {
    let text = `360 Review Results: ${request.title}\n`;
    text += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    text += `=== SUMMARY ===\n${results.anonymizedSummary}\n\n`;
    text += `=== SENTIMENT ANALYSIS ===\n`;
    text += `Positive: ${results.sentimentAnalysis.positive}%\n`;
    text += `Neutral: ${results.sentimentAnalysis.neutral}%\n`;
    text += `Negative: ${results.sentimentAnalysis.negative}%\n\n`;
    text += `=== KEY THEMES ===\n`;
    results.themes.forEach((theme) => {
      text += `- ${theme.name} (${theme.frequency} mentions, ${theme.sentiment})\n`;
    });
    text += `\n=== SKILL CATEGORIES ===\n`;
    results.skillCategories.forEach((skill) => {
      text += `\n${skill.category} (Score: ${skill.score}/10)\n`;
      skill.feedback.forEach((fb) => text += `  - ${fb}\n`);
    });
    text += `\n=== ACTIONABLE RECOMMENDATIONS ===\n`;
    results.actionableItems.forEach((item, idx) => {
      text += `${idx + 1}. [${item.priority.toUpperCase()}] ${item.item} (${item.category})\n`;
    });
    return text;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!results || !request) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="card max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900">No Results Available</h2>
          <p className="mt-2 text-sm text-gray-600">
            Results are not yet available for this review request.
          </p>
          <Link to="/dashboard" className="btn-primary mx-auto mt-4">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: results.sentimentAnalysis.positive, color: COLORS.positive },
    { name: 'Neutral', value: results.sentimentAnalysis.neutral, color: COLORS.neutral },
    { name: 'Negative', value: results.sentimentAnalysis.negative, color: COLORS.negative },
  ];

  const themeData = results.themes.slice(0, 8).map((theme) => ({
    name: theme.name,
    frequency: theme.frequency,
    sentiment: theme.sentiment,
  }));

  const skillData = results.skillCategories.map((skill) => ({
    category: skill.category,
    score: skill.score,
  }));

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedActions = [...results.actionableItems].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </button>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
            <p className="mt-1 text-sm text-gray-600">
              AI-Powered 360 Feedback Analysis
            </p>
          </div>
          <button onClick={handleDownload} className="btn-secondary">
            <Download className="mr-2 h-4 w-4" />
            Download Results
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900">Executive Summary</h2>
        <p className="mt-4 whitespace-pre-wrap text-gray-700 leading-relaxed">
          {results.anonymizedSummary}
        </p>
      </div>

      {/* Sentiment Analysis */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sentiment Distribution</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-3">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Themes */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Themes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={themeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="frequency" fill={COLORS.primary} name="Mentions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Skills Radar */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Skill Categories</h2>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={skillData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={90} domain={[0, 10]} />
            <Radar
              name="Score"
              dataKey="score"
              stroke={COLORS.primary}
              fill={COLORS.primary}
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>

        <div className="mt-6 space-y-4">
          {results.skillCategories.map((skill) => (
            <div key={skill.category} className="border-t border-gray-200 pt-4 first:border-0 first:pt-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{skill.category}</h3>
                <span className="text-sm font-medium text-gray-600">
                  {skill.score}/10
                </span>
              </div>
              <ul className="space-y-1">
                {skill.feedback.map((fb, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{fb}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Items */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Actionable Recommendations
        </h2>
        <div className="space-y-3">
          {sortedActions.map((item, index) => {
            const icons = {
              high: <AlertTriangle className="h-5 w-5 text-red-500" />,
              medium: <TrendingUp className="h-5 w-5 text-yellow-500" />,
              low: <CheckCircle className="h-5 w-5 text-green-500" />,
            };

            const badges = {
              high: <span className="badge-danger">High Priority</span>,
              medium: <span className="badge-warning">Medium Priority</span>,
              low: <span className="badge-info">Low Priority</span>,
            };

            return (
              <div
                key={index}
                className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4"
              >
                <div className="mt-0.5">{icons[item.priority]}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-gray-900">{item.item}</p>
                    {badges[item.priority]}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.category}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Results;
