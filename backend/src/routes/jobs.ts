import { Router } from 'express';
import { approveJobRecord, createJobRecord, mockState, rejectJobRecord } from '../lib/mock-data';

const router = Router();

router.get('/', async (_req, res) => {
  const jobs = mockState.jobs.filter((job) => job.isApproved).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ jobs });
});

router.get('/admin', async (_req, res) => {
  res.json({ jobs: mockState.jobs.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

router.get('/:id', async (req, res) => {
  const job = mockState.jobs.find((entry) => entry.id === req.params.id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }
  res.json({ job });
});

router.post('/', async (req, res) => {
  const job = createJobRecord({
    title: req.body.title ?? 'Untitled role',
    company: req.body.company ?? 'Company',
    location: req.body.location ?? 'Remote',
    salary: req.body.salary,
    employmentType: req.body.employmentType ?? 'Full-time',
    remoteType: req.body.remoteType ?? 'Remote',
    description: req.body.description ?? 'A great opportunity awaits.',
    requirements: req.body.requirements,
    expiresAt: req.body.expiresAt,
    source: req.body.source ?? 'internal',
  });

  res.status(201).json({ job });
});

router.post('/:id/approve', async (req, res) => {
  const job = approveJobRecord(req.params.id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }
  res.json({ job });
});

router.post('/:id/reject', async (req, res) => {
  const job = rejectJobRecord(req.params.id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }
  res.json({ job });
});

export default router;
