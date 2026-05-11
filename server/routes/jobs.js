const router = require('express').Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  const jobs = await prisma.job.findMany({ include: { candidates: true, createdBy: true } });
  res.json(jobs);
});

router.post('/', auth, async (req, res) => {
  try {
    const job = await prisma.job.create({
      data: { ...req.body, vacancies: parseInt(req.body.vacancies), createdById: req.user.id }
    });
    res.json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const job = await prisma.job.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await prisma.job.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

module.exports = router;