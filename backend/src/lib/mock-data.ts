import bcrypt from 'bcryptjs';

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: string;
  isVerified: boolean;
};

export type CompanyRecord = {
  id: string;
  name: string;
  slug: string;
  website?: string;
  industry?: string;
  location?: string;
  description?: string;
  isVerified: boolean;
  createdAt: string;
};

export type JobRecord = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  employmentType: string;
  remoteType: string;
  description: string;
  requirements?: string;
  expiresAt?: string;
  isApproved: boolean;
  source: 'internal' | 'aggregated';
  createdAt: string;
};

export type ApplicationRecord = {
  id: string;
  userId: string;
  jobId: string;
  status: 'submitted' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  coverLetter?: string;
  createdAt: string;
};

export const mockState = {
  users: [] as UserRecord[],
  companies: [] as CompanyRecord[],
  jobs: [] as JobRecord[],
  applications: [] as ApplicationRecord[],
};

const seedUsers = [
  {
    id: 'user-admin',
    email: 'admin@aventrajob.dev',
    passwordHash: bcrypt.hashSync('admin123', 10),
    fullName: 'Ava Patel',
    role: 'admin',
    isVerified: true,
  },
  {
    id: 'user-recruiter',
    email: 'recruiter@aventrajob.dev',
    passwordHash: bcrypt.hashSync('recruiter123', 10),
    fullName: 'Rohan Mehta',
    role: 'recruiter',
    isVerified: true,
  },
  {
    id: 'user-candidate',
    email: 'candidate@aventrajob.dev',
    passwordHash: bcrypt.hashSync('candidate123', 10),
    fullName: 'Neha Sharma',
    role: 'candidate',
    isVerified: true,
  },
];

const seedCompanies = [
  {
    id: 'company-1',
    name: 'Aventra Labs',
    slug: 'aventra-labs',
    website: 'https://aventra.dev',
    industry: 'AI Infrastructure',
    location: 'Bengaluru',
    description: 'Building intelligent workflow automation platforms for modern teams.',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'company-2',
    name: 'Northstar Commerce',
    slug: 'northstar-commerce',
    website: 'https://northstar.example',
    industry: 'Fintech',
    location: 'Mumbai',
    description: 'Fintech products helping growing firms streamline operations.',
    isVerified: false,
    createdAt: new Date().toISOString(),
  },
];

const seedJobs = [
  {
    id: 'job-1',
    title: 'Senior Product Designer',
    company: 'Aventra Labs',
    location: 'Remote · India',
    salary: '₹28L - ₹40L',
    employmentType: 'Full-time',
    remoteType: 'Remote',
    description: 'Design polished user experiences for high-impact B2B product teams.',
    requirements: '4+ years in product design, systems thinking, Figma, analytics.',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    isApproved: true,
    source: 'internal' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-2',
    title: 'Lead Backend Engineer',
    company: 'Northstar Commerce',
    location: 'Bengaluru · Hybrid',
    salary: '₹24L - ₹36L',
    employmentType: 'Full-time',
    remoteType: 'Hybrid',
    description: 'Own platform services and APIs that power real-time payments.',
    requirements: 'Node.js, TypeScript, PostgreSQL, event-driven systems.',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),
    isApproved: true,
    source: 'aggregated' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-3',
    title: 'Growth Marketing Manager',
    company: 'Lumen Health',
    location: 'Delhi · Onsite',
    salary: '₹18L - ₹26L',
    employmentType: 'Full-time',
    remoteType: 'Onsite',
    description: 'Drive campaigns across India and build demand generation.',
    requirements: 'Performance marketing, analytics, B2B SaaS experience.',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString(),
    isApproved: true,
    source: 'aggregated' as const,
    createdAt: new Date().toISOString(),
  },
];

export const initializeMockData = () => {
  if (mockState.users.length === 0) {
    mockState.users.push(...seedUsers);
  }
  if (mockState.companies.length === 0) {
    mockState.companies.push(...seedCompanies);
  }
  if (mockState.jobs.length === 0) {
    mockState.jobs.push(...seedJobs);
  }
};

initializeMockData();

export const getUserByEmail = (email: string) => {
  const normalizedEmail = email.toLowerCase();
  return mockState.users.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null;
};

export const getUserById = (id: string) =>
  mockState.users.find((user) => user.id === id) ?? null;

export const createUserRecord = async (input: {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}) => {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const record: UserRecord = {
    id: `user-${mockState.users.length + 1}`,
    email: input.email,
    passwordHash,
    fullName: input.fullName,
    role: input.role ?? 'candidate',
    isVerified: true,
  };
  mockState.users.push(record);
  return record;
};

export const createCompanyRecord = (input: {
  name: string;
  slug: string;
  website?: string;
  industry?: string;
  location?: string;
  description?: string;
}) => {
  const record: CompanyRecord = {
    id: `company-${mockState.companies.length + 1}`,
    name: input.name,
    slug: input.slug,
    website: input.website,
    industry: input.industry,
    location: input.location,
    description: input.description,
    isVerified: false,
    createdAt: new Date().toISOString(),
  };
  mockState.companies.push(record);
  return record;
};

export const createJobRecord = (input: {
  title: string;
  company: string;
  location: string;
  salary?: string;
  employmentType: string;
  remoteType: string;
  description: string;
  requirements?: string;
  expiresAt?: string;
  source?: 'internal' | 'aggregated';
}) => {
  const record: JobRecord = {
    id: `job-${mockState.jobs.length + 1}`,
    title: input.title,
    company: input.company,
    location: input.location,
    salary: input.salary,
    employmentType: input.employmentType,
    remoteType: input.remoteType,
    description: input.description,
    requirements: input.requirements,
    expiresAt: input.expiresAt,
    isApproved: true,
    source: input.source ?? 'internal',
    createdAt: new Date().toISOString(),
  };
  mockState.jobs.push(record);
  return record;
};

export const getCompanyById = (id: string) => mockState.companies.find((company) => company.id === id) ?? null;

export const verifyCompanyRecord = (id: string) => {
  const company = getCompanyById(id);
  if (!company) {
    return null;
  }
  company.isVerified = true;
  return company;
};

export const approveJobRecord = (id: string) => {
  const job = mockState.jobs.find((entry) => entry.id === id) ?? null;
  if (!job) {
    return null;
  }
  job.isApproved = true;
  return job;
};

export const rejectJobRecord = (id: string) => {
  const job = mockState.jobs.find((entry) => entry.id === id) ?? null;
  if (!job) {
    return null;
  }
  job.isApproved = false;
  return job;
};

export const getAdminStats = () => ({
  totalUsers: mockState.users.length,
  totalCompanies: mockState.companies.length,
  totalJobs: mockState.jobs.length,
  pendingCompanies: mockState.companies.filter((company) => !company.isVerified).length,
  pendingJobs: mockState.jobs.filter((job) => !job.isApproved).length,
});

export const hasUserAppliedToJob = (userId: string, jobId: string) =>
  mockState.applications.some((entry) => entry.userId === userId && entry.jobId === jobId);

export const createApplicationRecord = (input: { userId: string; jobId: string; coverLetter?: string }) => {
  const record: ApplicationRecord = {
    id: `application-${mockState.applications.length + 1}`,
    userId: input.userId,
    jobId: input.jobId,
    status: 'submitted',
    coverLetter: input.coverLetter,
    createdAt: new Date().toISOString(),
  };
  mockState.applications.push(record);
  return record;
};

export const getApplicationsForUser = (userId: string) => {
  const userApps = mockState.applications.filter((entry) => entry.userId === userId);
  return userApps
    .map((app) => {
      const job = mockState.jobs.find((entry) => entry.id === app.jobId);
      return job ? { ...app, job } : null;
    })
    .filter((entry): entry is ApplicationRecord & { job: JobRecord } => entry !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const getAppliedJobIdsForUser = (userId: string) =>
  mockState.applications
    .filter((entry) => entry.userId === userId)
    .map((entry) => entry.jobId);

export const getSavedJobIdsForUser = (_userId: string) => {
  // Placeholder until saved-jobs feature ships; returning a stable empty list keeps
  // the dashboard "Saved roles" card rendering a real value.
  return [] as string[];
};

export type AdminUserView = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  applicationCount: number;
};

export const listUsersForAdmin = (): AdminUserView[] => {
  const now = new Date().toISOString();
  return mockState.users
    .map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: now,
      applicationCount: mockState.applications.filter((entry) => entry.userId === user.id).length,
    }))
    .sort((a, b) => a.email.localeCompare(b.email));
};

export const updateUserRecord = (
  id: string,
  patch: Partial<Pick<UserRecord, 'role' | 'isVerified' | 'fullName'>>
): UserRecord | null => {
  const user = mockState.users.find((entry) => entry.id === id);
  if (!user) {
    return null;
  }
  if (patch.role && ['admin', 'recruiter', 'candidate'].includes(patch.role)) {
    user.role = patch.role;
  }
  if (typeof patch.isVerified === 'boolean') {
    user.isVerified = patch.isVerified;
  }
  if (typeof patch.fullName === 'string' && patch.fullName.trim().length > 0) {
    user.fullName = patch.fullName.trim();
  }
  return user;
};

export const deleteUserRecord = (id: string): boolean => {
  const index = mockState.users.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }
  mockState.users.splice(index, 1);
  // Also drop their applications so the store stays consistent.
  for (let i = mockState.applications.length - 1; i >= 0; i -= 1) {
    if (mockState.applications[i].userId === id) {
      mockState.applications.splice(i, 1);
    }
  }
  return true;
};

export type AdminJobView = JobRecord & { applicationCount: number };

export const listJobsForAdmin = (): AdminJobView[] =>
  mockState.jobs
    .map((job) => ({
      ...job,
      applicationCount: mockState.applications.filter((entry) => entry.jobId === job.id).length,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const getApplicationsForJob = (jobId: string) => {
  return mockState.applications
    .filter((entry) => entry.jobId === jobId)
    .map((entry) => {
      const user = mockState.users.find((u) => u.id === entry.userId);
      return {
        id: entry.id,
        status: entry.status,
        coverLetter: entry.coverLetter,
        createdAt: entry.createdAt,
        user: user
          ? { id: user.id, email: user.email, fullName: user.fullName }
          : { id: entry.userId, email: 'unknown@aventrajob.dev', fullName: 'Deleted user' },
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const updateJobRecord = (
  id: string,
  patch: Partial<Omit<JobRecord, 'id' | 'createdAt' | 'source'>>
): JobRecord | null => {
  const job = mockState.jobs.find((entry) => entry.id === id);
  if (!job) {
    return null;
  }
  const editable: (keyof typeof patch)[] = [
    'title',
    'company',
    'location',
    'salary',
    'employmentType',
    'remoteType',
    'description',
    'requirements',
    'expiresAt',
    'isApproved',
  ];
  for (const key of editable) {
    const value = patch[key];
    if (value !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (job as any)[key] = value;
    }
  }
  return job;
};

export const deleteJobRecord = (id: string): boolean => {
  const index = mockState.jobs.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }
  mockState.jobs.splice(index, 1);
  for (let i = mockState.applications.length - 1; i >= 0; i -= 1) {
    if (mockState.applications[i].jobId === id) {
      mockState.applications.splice(i, 1);
    }
  }
  return true;
};
