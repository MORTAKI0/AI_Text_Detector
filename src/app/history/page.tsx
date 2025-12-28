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
      <div className="min-h-screen bg-slate-50/30 pb-8">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Logs
                </p>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">History</h1>
                  <p className="mt-1 text-sm text-slate-600">Recent analyses</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload('csv')}
                  disabled={exporting !== null}
                  loading={exporting === 'csv'}
                >
                  {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload('pdf')}
                  disabled={exporting !== null}
                  loading={exporting === 'pdf'}
                >
                  {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
                </Button>
              </div>
            </div>

            {error && <ProblemAlert message={error} />}

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow className="bg-slate-50">
                      <TableHeaderCell className="w-48 whitespace-nowrap">
                        Created
                      </TableHeaderCell>
                      <TableHeaderCell className="w-28 whitespace-nowrap">
                        Label
                      </TableHeaderCell>
                      <TableHeaderCell className="w-28 whitespace-nowrap text-right">
                        Prob AI
                      </TableHeaderCell>
                      <TableHeaderCell className="min-w-[300px]">
                        Preview
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center text-sm text-slate-500">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : analyses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center text-sm text-slate-500">
                          No analyses yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      analyses.map((item) => (
                        <TableRow
                          key={item.id}
                          className="border-t border-slate-100 transition-colors hover:bg-slate-50/50"
                        >
                          <TableCell className="whitespace-nowrap text-sm text-slate-700">
                            {new Date(item.created_at).toLocaleString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.label_pred === 1 ? 'ai' : 'human'}>
                              {formatLabel(item.label_pred)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums text-slate-800">
                            {item.prob_ai.toFixed(3)}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/history/${item.id}`}
                              className="group inline-flex items-center gap-2"
                            >
                              <span className="block max-w-md truncate text-sm text-slate-600 group-hover:text-slate-900">
                                {item.preview || 'No preview available'}
                              </span>
                              <span className="whitespace-nowrap text-xs font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                                View →
                              </span>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}


