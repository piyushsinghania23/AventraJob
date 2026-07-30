import { Router } from 'express';
import { createCompanyRecord, mockState, verifyCompanyRecord } from '../lib/mock-data';

const router = Router();

router.get('/', async (_req, res) => {
  const companies = mockState.companies.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ companies });
});

router.post('/', async (req, res) => {
  const company = createCompanyRecord({
    name: req.body.name ?? 'New Company',
    slug: req.body.slug ?? 'new-company',
    website: req.body.website,
    industry: req.body.industry,
    location: req.body.location,
    description: req.body.description,
  });

  res.status(201).json({ company });
});

router.post('/:id/verify', async (req, res) => {
  const company = verifyCompanyRecord(req.params.id);
  if (!company) {
    return res.status(404).json({ message: 'Company not found.' });
  }
  res.json({ company });
});

export default router;
