'use client';

import { useEffect, useState } from 'react';
import ProblemAlert from '@/components/ProblemAlert';
import Protected from '@/components/Protected';
import SegmentHighlight from '@/components/SegmentHighlight';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import {
  AnalyzeResponse,
  ApiError,
  StatsResponse,
  UserProfile,
  analyze,
  getStats,
  me,
} from '@/lib/api';

const formatLabel = (label: 0 | 1) => (label === 1 ? 'AI' : 'Human');

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [text, setText] = useState('');
  const [analyzedText, setAnalyzedText] = useState('');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await me();
        setProfile(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.detail || err.message);
        }
      } finally {
        setLoadingMe(false);
      }
    };

    const loadStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.detail || err.message);
        }
      }
    };

    loadProfile();
    loadStats();
  }, []);

  const handleAnalyze = async () => {
    setError(null);
    setLoadingAnalyze(true);
    try {
      const res = await analyze(text);
      setResult(res);
      setAnalyzedText(text);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('Analysis failed. Please try again.');
      }
    } finally {
      setLoadingAnalyze(false);
    }
  };

  return (
    <Protected>
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
            Overview
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">
            Analyze text and stay on top of your AI vs Human detections.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Me
              </p>
              <Badge variant="muted">Profile</Badge>
            </div>
            {loadingMe ? (
              <p className="mt-3 text-sm text-slate-600">Loading profile...</p>
            ) : profile ? (
              <div className="mt-4 space-y-2">
                <p className="text-lg font-semibold text-slate-900">{profile.email}</p>
                <p className="text-sm text-slate-600">
                  Joined {new Date(profile.created_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Unable to load profile.</p>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Stats
              </p>
              <Badge variant="info">Last 20</Badge>
            </div>
            {stats ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs uppercase text-slate-500">Total</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {stats.total_count}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs uppercase text-slate-500">AI</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {stats.ai_count}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs uppercase text-slate-500">Human</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {stats.human_count}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs uppercase text-slate-500">Avg Prob AI</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {stats.avg_prob_ai.toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Stats unavailable.</p>
            )}
          </Card>
        </div>

        <Card className="space-y-4 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Analyze text</h2>
              <p className="text-sm text-slate-600">
                Paste your text below and run AI detection.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={!text.trim() || loadingAnalyze}
              loading={loadingAnalyze}
            >
              {loadingAnalyze ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>

          <Textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type text here..."
          />

          <ProblemAlert message={error} />

          {result && (
            <div className="pt-2">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Summary</p>
                    <Badge variant={result.label === 1 ? 'ai' : 'human'}>
                      Label: {formatLabel(result.label)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info">
                      Prob AI: <span className="ml-1 font-bold">{result.prob_ai.toFixed(3)}</span>
                    </Badge>
                    <Badge variant="muted">
                      Threshold:{' '}
                      <span className="ml-1 font-semibold">{result.threshold.toFixed(3)}</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Segments</p>
                    <div className="space-y-2 rounded-lg border border-slate-100 bg-white p-3">
                      {result.segments && result.segments.length > 0 ? (
                        <div className="max-h-56 space-y-2 overflow-auto pr-1">
                          {result.segments.map((seg, idx) => (
                            <div
                              key={`${seg.start}-${seg.end}-${idx}`}
                              className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2"
                            >
                              <div className="flex items-center justify-between text-xs text-slate-600">
                                <span>
                                  Range {seg.start} - {seg.end}
                                </span>
                                <span className="tabular-nums text-sm font-semibold text-slate-900">
                                  {seg.prob_ai.toFixed(2)}
                                </span>
                              </div>
                              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-blue-300"
                                  style={{ width: `${Math.min(100, seg.prob_ai * 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600">No segments flagged.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white/90 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-800">Highlights</p>
                  <SegmentHighlight text={analyzedText} segments={result.segments || []} />
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Protected>
  );
}
