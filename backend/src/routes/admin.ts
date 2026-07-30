import { Router } from 'express';
import { AuthedRequest, requireAdmin, requireAuth } from '../middleware/auth';
import {
  AdminJobView,
  AdminUserView,
  approveJobRecord,
  deleteJobRecord,
  deleteUserRecord,
  getAdminStats,
  getApplicationsForJob,
  listJobsForAdmin,
  listUsersForAdmin,
  rejectJobRecord,
  updateJobRecord,
  updateUserRecord,
} from '../lib/mock-data';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', (_req, res) => {
  res.json({ stats: getAdminStats() });
});

router.get('/users', (_req, res) => {
  const users: AdminUserView[] = listUsersForAdmin();
  res.json({ users });
});

router.patch('/users/:id', (req: AuthedRequest, res) => {
  const { role, isVerified, fullName } = req.body as {
    role?: string;
    isVerified?: boolean;
    fullName?: string;
  };

  const id = String(req.params.id);
  const updated = updateUserRecord(id, { role, isVerified, fullName });
  if (!updated) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json({
    user: {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      role: updated.role,
      isVerified: updated.isVerified,
    },
  });
});

router.delete('/users/:id', (req: AuthedRequest, res) => {
  const id = String(req.params.id);
  if (id === req.auth!.sub) {
    return res.status(400).json({ message: 'You cannot delete your own admin account.' });
  }
  const ok = deleteUserRecord(id);
  if (!ok) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.status(204).end();
});

router.get('/jobs', (_req, res) => {
  const jobs: AdminJobView[] = listJobsForAdmin();
  res.json({ jobs });
});

router.patch('/jobs/:id', (req, res) => {
  const patch = req.body as Record<string, unknown>;
  const allowed: Record<string, unknown> = {};
  const fields = [
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
  for (const field of fields) {
    if (patch[field] !== undefined) {
      allowed[field] = patch[field];
    }
  }
  const updated = updateJobRecord(String(req.params.id), allowed);
  if (!updated) {
    return res.status(404).json({ message: 'Job not found.' });
  }
  res.json({ job: updated });
});

router.delete('/jobs/:id', (req, res) => {
  const ok = deleteJobRecord(String(req.params.id));
  if (!ok) {
    return res.status(404).json({ message: 'Job not found.' });
  }
  return res.status(204).end();
});

router.post('/jobs/:id/approve', (req, res) => {
  const job = approveJobRecord(String(req.params.id));
  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }
  res.json({ job });
});

router.post('/jobs/:id/reject', (req, res) => {
  const job = rejectJobRecord(String(req.params.id));
  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }
  res.json({ job });
});

router.get('/jobs/:id/applicants', (req, res) => {
  const jobId = String(req.params.id);
  const applicants = getApplicationsForJob(jobId);
  res.json({ applicants });
});

export default router;
