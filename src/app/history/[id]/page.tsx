'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProblemAlert from '@/components/ProblemAlert';
import Protected from '@/components/Protected';
import SegmentHighlight from '@/components/SegmentHighlight';
import { AnalysisDetail, ApiError, getAnalysis } from '@/lib/api';

const formatLabel = (label: 0 | 1) => (label === 1 ? 'AI' : 'Human');

export default function AnalysisDetailPage() {
  const params = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return;
      try {
        const data = await getAnalysis(params.id);
        setAnalysis(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.detail || err.message);
        } else {
          setError('Unable to load analysis.');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params?.id]);

  return (
    <Protected>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Analysis detail</h1>
          <p className="text-sm text-slate-600">Review the analysis and segments.</p>
        </div>

        <ProblemAlert message={error} />

        {loading ? (
          <p className="text-sm text-slate-600">Loading...</p>
        ) : analysis ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {formatLabel(analysis.label_pred)}
                </span>
                <span className="text-sm text-slate-700">
                  Prob AI: <strong>{analysis.prob_ai.toFixed(3)}</strong>
                </span>
                {analysis.threshold !== undefined && (
                  <span className="text-sm text-slate-700">
                    Threshold: <strong>{analysis.threshold.toFixed(3)}</strong>
                  </span>
                )}
                <span className="text-sm text-slate-600">
                  {new Date(analysis.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Text</h2>
              <SegmentHighlight text={analysis.text} segments={analysis.segments} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Segments</h2>
              {analysis.segments && analysis.segments.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-2">
                  {analysis.segments.map((seg, idx) => (
                    <div
                      key={`${seg.start}-${seg.end}-${idx}`}
                      className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
                    >
                      <span>
                        {seg.start} - {seg.end}
                      </span>
                      <span className="rounded bg-yellow-200 px-2 py-0.5 text-xs font-semibold text-yellow-900">
                        {seg.prob_ai.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No segments reported.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Protected>
  );
}
