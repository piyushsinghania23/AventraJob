import { Router } from 'express';
import {
  createApplicationRecord,
  getApplicationsForUser,
  getAppliedJobIdsForUser,
  getSavedJobIdsForUser,
  hasUserAppliedToJob,
  mockState,
} from '../lib/mock-data';
import { AuthedRequest, requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/me', (req: AuthedRequest, res) => {
  const userId = req.auth!.sub;
  const applications = getApplicationsForUser(userId);
  const savedJobIds = getSavedJobIdsForUser(userId);
  const interviewCount = applications.filter((app) => app.status === 'interview').length;

  res.json({
    stats: {
      savedRoles: savedJobIds.length,
      applications: applications.length,
      interviewInvites: interviewCount,
    },
    applications,
    appliedJobIds: getAppliedJobIdsForUser(userId),
  });
});

router.post('/jobs/:jobId/apply', (req: AuthedRequest, res) => {
  const userId = req.auth!.sub;
  const jobId = String(req.params.jobId);
  const { coverLetter } = req.body as { coverLetter?: string };

  const job = mockState.jobs.find((entry) => entry.id === jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }
  if (!job.isApproved) {
    return res.status(400).json({ message: 'This job is not accepting applications right now.' });
  }
  if (hasUserAppliedToJob(userId, jobId)) {
    return res.status(409).json({ message: 'You have already applied to this job.' });
  }

  const application = createApplicationRecord({ userId, jobId, coverLetter });
  return res.status(201).json({ application });
});

export default router;
