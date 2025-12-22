'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProblemAlert from '@/components/ProblemAlert';
import Protected from '@/components/Protected';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/Table';
import {
  AnalysisListItem,
  ApiError,
  exportCsv,
  exportPdf,
  listAnalyses,
} from '@/lib/api';

const formatLabel = (label: 0 | 1) => (label === 1 ? 'AI' : 'Human');

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await listAnalyses(20);
        setAnalyses(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.detail || err.message);
        } else {
          setError('Unable to load history.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDownload = async (type: 'csv' | 'pdf') => {
    setError(null);
    setExporting(type);
    try {
      const { blob, filename } = type === 'csv' ? await exportCsv() : await exportPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('Download failed.');
      }
    } finally {
      setExporting(null);
    }
  };

  return (
    <Protected>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
              Logs
            </p>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">History</h1>
              <p className="text-sm text-slate-600">Recent analyses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownload('csv')}
              disabled={exporting === 'csv'}
              loading={exporting === 'csv'}
            >
              {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownload('pdf')}
              disabled={exporting === 'pdf'}
              loading={exporting === 'pdf'}
            >
              {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        <ProblemAlert message={error} />

        <TableContainer>
          <Table>
            <TableHead className="sticky top-[64px] z-10 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHeaderCell className="w-40">Created</TableHeaderCell>
                <TableHeaderCell className="w-24">Label</TableHeaderCell>
                <TableHeaderCell className="w-24 text-right">Prob AI</TableHeaderCell>
                <TableHeaderCell>Preview</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-slate-600">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : analyses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-slate-600">
                    No analyses yet.
                  </TableCell>
                </TableRow>
              ) : (
                analyses.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                  >
                    <TableCell className="text-slate-700">
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.label_pred === 1 ? 'ai' : 'human'}>
                        {formatLabel(item.label_pred)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-slate-800">
                      {item.prob_ai.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      <Link
                        href={`/history/${item.id}`}
                        className="group inline-flex max-w-full items-center gap-2"
                      >
                        <span className="block max-w-[320px] truncate text-slate-600">
                          {item.preview}
                        </span>
                        <span className="text-sm font-semibold text-[var(--accent)] opacity-0 transition group-hover:opacity-100">
                          View
                        </span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Protected>
  );
}
