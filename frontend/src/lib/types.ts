export type JobStatus = 'draft' | 'open' | 'closed';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
export type ApplicationStatus = 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
export type UserRole = 'superadmin' | 'admin';

export const EMPLOYMENT_TYPES: EmploymentType[] = ['full-time', 'part-time', 'contract', 'internship', 'temporary'];
export const JOB_STATUSES: JobStatus[] = ['draft', 'open', 'closed'];
export const APPLICATION_STATUSES: ApplicationStatus[] = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'];

export interface Job {
  _id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  salary: string;
  deadline?: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export type JobInput = Partial<Omit<Job, '_id' | 'slug' | 'createdAt' | 'updatedAt'>>;

export interface Photo {
  _id: string;
  title: string;
  caption: string;
  category: string;
  url: string;
  storagePath: string;
  contentType: string;
  size: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  job: Pick<Job, '_id' | 'title' | 'slug' | 'location'> | null;
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
  cvUrl?: string;
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export type EnquiryType = 'contact' | 'quote';
export type EnquiryStatus = 'new' | 'in-progress' | 'quoted' | 'closed';
export const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'in-progress', 'quoted', 'closed'];

export interface EnquiryItem {
  description: string;
  quantity: string;
}

export interface Enquiry {
  _id: string;
  type: EnquiryType;
  name: string;
  organization: string;
  email: string;
  phone: string;
  category: string;
  message: string;
  items: EnquiryItem[];
  deliveryLocation: string;
  neededBy: string;
  status: EnquiryStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryInput {
  type: EnquiryType;
  name: string;
  email: string;
  organization?: string;
  phone?: string;
  category?: string;
  message?: string;
  items?: { description: string; quantity?: string }[];
  deliveryLocation?: string;
  neededBy?: string;
  website?: string;
}

interface ContentItem {
  _id: string;
  imageUrl?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial extends ContentItem {
  quote: string;
  name: string;
  role: string;
  organization: string;
}

export interface Partner extends ContentItem {
  name: string;
  website: string;
}

export interface Project extends ContentItem {
  title: string;
  client: string;
  category: string;
  year: string;
  summary: string;
}

export interface News extends ContentItem {
  title: string;
  category: string;
  summary: string;
  body: string;
}

export type DemandStatus = 'open' | 'fulfilled';

export interface Demand extends ContentItem {
  title: string;
  quantity: string;
  price: string;
  location: string;
  details: string;
  contact: string;
  status: DemandStatus;
}

export type ContentKind = 'testimonials' | 'partners' | 'projects' | 'news' | 'demands';

export interface Stat {
  value: string;
  label: string;
}

export interface Credential {
  title: string;
  detail: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface SiteSettings {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  officeHours: string;
  stats: Stat[];
  credentials: Credential[];
  faqs: Faq[];
  companyProfileUrl?: string;
}

export type SettingsInput = Partial<Omit<SiteSettings, 'companyProfileUrl'>>;
