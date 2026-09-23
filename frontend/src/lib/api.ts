import { clearToken, getToken } from './auth';
import type {
  AdminUser,
  Application,
  ApplicationStatus,
  AuthUser,
  ContentKind,
  Enquiry,
  EnquiryInput,
  EnquiryStatus,
  Job,
  JobInput,
  LoginResponse,
  Partner,
  Photo,
  Project,
  SettingsInput,
  SiteSettings,
  Testimonial,
  UserRole,
} from './types';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
};

function toQuery(params: Record<string, string | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, next, cache } = options;
  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;

  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { method, headers, body: payload, next, cache });

  if (!res.ok) {
    let message = res.statusText || 'Request failed';
    try {
      const data = await res.json();
      message = Array.isArray(data.message) ? data.message.join(', ') : (data.message ?? message);
    } catch {}
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function safely<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export const publicApi = {
  jobs: (params: { search?: string; employmentType?: string } = {}) =>
    request<Job[]>(`/jobs${toQuery(params)}`, { next: { revalidate: 60 } }),
  jobBySlug: (slug: string) => request<Job>(`/jobs/slug/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } }),
  photos: (params: { category?: string; featured?: boolean } = {}) =>
    request<Photo[]>(`/photos${toQuery(params)}`, { next: { revalidate: 60 } }),
  photoCategories: () => request<string[]>('/photos/categories', { next: { revalidate: 60 } }),
  apply: (form: FormData) => request<{ id: string; submitted: boolean }>('/applications', { method: 'POST', body: form }),
  settings: () => request<SiteSettings>('/settings', { next: { revalidate: 60 } }),
  testimonials: () => request<Testimonial[]>('/testimonials', { next: { revalidate: 60 } }),
  partners: () => request<Partner[]>('/partners', { next: { revalidate: 60 } }),
  projects: () => request<Project[]>('/projects', { next: { revalidate: 60 } }),
  submitEnquiry: (data: EnquiryInput) =>
    request<{ id?: string; submitted: boolean }>('/enquiries', { method: 'POST', body: data }),
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: { email, password } }),
};

async function authed<T>(path: string, options: Omit<RequestOptions, 'token'> = {}): Promise<T> {
  try {
    return await request<T>(path, { ...options, token: getToken(), cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && typeof window !== 'undefined') {
      clearToken();
      window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw error;
  }
}

export const adminApi = {
  me: () => authed<AuthUser & { _id: string }>('/auth/me'),

  jobs: (params: { search?: string; status?: string; employmentType?: string } = {}) =>
    authed<Job[]>(`/jobs/admin${toQuery(params)}`),
  job: (id: string) => authed<Job>(`/jobs/admin/${id}`),
  createJob: (data: JobInput) => authed<Job>('/jobs', { method: 'POST', body: data }),
  updateJob: (id: string, data: JobInput) => authed<Job>(`/jobs/${id}`, { method: 'PATCH', body: data }),
  deleteJob: (id: string) => authed<{ deleted: boolean }>(`/jobs/${id}`, { method: 'DELETE' }),

  photos: (params: { category?: string } = {}) => authed<Photo[]>(`/photos${toQuery(params)}`),
  uploadPhoto: (form: FormData) => authed<Photo>('/photos', { method: 'POST', body: form }),
  updatePhoto: (id: string, data: Partial<Pick<Photo, 'title' | 'caption' | 'category' | 'featured'>>) =>
    authed<Photo>(`/photos/${id}`, { method: 'PATCH', body: data }),
  deletePhoto: (id: string) => authed<{ deleted: boolean }>(`/photos/${id}`, { method: 'DELETE' }),

  applications: (params: { jobId?: string; status?: string } = {}) =>
    authed<Application[]>(`/applications${toQuery(params)}`),
  updateApplication: (id: string, data: { status?: ApplicationStatus; notes?: string }) =>
    authed<Application>(`/applications/${id}`, { method: 'PATCH', body: data }),
  deleteApplication: (id: string) => authed<{ deleted: boolean }>(`/applications/${id}`, { method: 'DELETE' }),

  enquiries: (params: { type?: string; status?: string } = {}) => authed<Enquiry[]>(`/enquiries${toQuery(params)}`),
  updateEnquiry: (id: string, data: { status?: EnquiryStatus; notes?: string }) =>
    authed<Enquiry>(`/enquiries/${id}`, { method: 'PATCH', body: data }),
  deleteEnquiry: (id: string) => authed<{ deleted: boolean }>(`/enquiries/${id}`, { method: 'DELETE' }),

  contentList: <T>(kind: ContentKind) => authed<T[]>(`/${kind}/admin`),
  contentCreate: <T>(kind: ContentKind, form: FormData) => authed<T>(`/${kind}`, { method: 'POST', body: form }),
  contentUpdate: <T>(kind: ContentKind, id: string, form: FormData) =>
    authed<T>(`/${kind}/${id}`, { method: 'PATCH', body: form }),
  contentDelete: (kind: ContentKind, id: string) => authed<{ deleted: boolean }>(`/${kind}/${id}`, { method: 'DELETE' }),

  settings: () => authed<SiteSettings>('/settings'),
  updateSettings: (data: SettingsInput) => authed<SiteSettings>('/settings', { method: 'PATCH', body: data }),
  uploadCompanyProfile: (form: FormData) =>
    authed<SiteSettings>('/settings/company-profile', { method: 'POST', body: form }),
  removeCompanyProfile: () => authed<SiteSettings>('/settings/company-profile', { method: 'DELETE' }),

  users: () => authed<AdminUser[]>('/users'),
  createUser: (data: { name: string; email: string; password: string; role: UserRole }) =>
    authed<AdminUser>('/users', { method: 'POST', body: data }),
  updateUser: (id: string, data: Partial<{ name: string; email: string; password: string; role: UserRole; active: boolean }>) =>
    authed<AdminUser>(`/users/${id}`, { method: 'PATCH', body: data }),
  deleteUser: (id: string) => authed<{ deleted: boolean }>(`/users/${id}`, { method: 'DELETE' }),
};
