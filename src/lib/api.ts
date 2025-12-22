'use client';

import { clearToken, getToken } from './auth';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8000';

export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
};

export class ApiError extends Error {
  status?: number;
  detail?: string;
  constructor(message: string, status?: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

type AnalysisSegment = {
  start: number;
  end: number;
  prob_ai: number;
};

export type AnalyzeResponse = {
  label: 0 | 1;
  prob_ai: number;
  threshold: number;
  segments: AnalysisSegment[];
  text?: string;
};

export type AnalysisListItem = {
  id: number | string;
  created_at: string;
  label_pred: 0 | 1;
  prob_ai: number;
  preview: string;
  segments?: AnalysisSegment[];
};

export type AnalysisDetail = {
  id: number | string;
  created_at: string;
  label_pred: 0 | 1;
  prob_ai: number;
  threshold?: number;
  text: string;
  segments: AnalysisSegment[];
};

export type StatsResponse = {
  total_count: number;
  ai_count: number;
  human_count: number;
  avg_prob_ai: number;
};

export type AuthResponse = {
  access_token: string;
  token_type: 'bearer';
};

export type UserProfile = {
  id: number | string;
  email: string;
  created_at: string;
};

const redirectToLogin = () => {
  clearToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login?message=Session%20expired';
  }
};

const parseProblem = async (res: Response): Promise<ProblemDetails | null> => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/problem+json')) {
    try {
      return await res.json();
    } catch (error) {
      console.error('Failed to parse problem+json', error);
      return null;
    }
  }
  return null;
};

const handleError = async (res: Response): Promise<never> => {
  if (res.status === 401) {
    redirectToLogin();
    throw new ApiError('Unauthorized', 401);
  }

  const problem = await parseProblem(res);
  const detail = problem?.detail || res.statusText;
  throw new ApiError(detail, res.status, detail);
};

const request = async <T>(
  path: string,
  init?: RequestInit,
  opts?: { auth?: boolean; responseType?: 'json' | 'blob' }
): Promise<T> => {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(init?.headers);

  if (opts?.auth) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    return handleError(res);
  }

  if (opts?.responseType === 'blob') {
    return (await res.blob()) as T;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  return undefined as T;
};

export const login = (email: string, password: string) =>
  request<AuthResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    { auth: false }
  );

export const register = (email: string, password: string) =>
  request<AuthResponse>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    { auth: false }
  );

export const me = () =>
  request<UserProfile>('/auth/me', { method: 'GET' }, { auth: true });

export const analyze = (text: string) =>
  request<AnalyzeResponse>(
    '/analyze',
    { method: 'POST', body: JSON.stringify({ text }) },
    { auth: true }
  );

export const listAnalyses = (limit = 20) =>
  request<AnalysisListItem[]>(
    `/analyses?limit=${limit}`,
    { method: 'GET' },
    { auth: true }
  );

export const getAnalysis = (id: string | number) =>
  request<AnalysisDetail>(
    `/analyses/${id}`,
    { method: 'GET' },
    { auth: true }
  );

export const getStats = () =>
  request<StatsResponse>('/stats', { method: 'GET' }, { auth: true });

const extractFilename = (contentDisposition: string | null, fallback: string) => {
  if (!contentDisposition) return fallback;
  const match = /filename\\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
    contentDisposition
  );
  const filename = match?.[1] || match?.[2];
  return filename ? decodeURIComponent(filename) : fallback;
};

const downloadFile = async (path: string, fallback: string) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  });

  if (!res.ok) {
    await handleError(res);
  }

  const blob = await res.blob();
  const filename = extractFilename(res.headers.get('content-disposition'), fallback);
  return { blob, filename };
};

export const exportCsv = () => downloadFile('/export/csv', 'analyses.csv');
export const exportPdf = () => downloadFile('/export/pdf', 'analyses.pdf');

export const health = () =>
  request<{ status: string }>('/health', { method: 'GET' }, { auth: false });
