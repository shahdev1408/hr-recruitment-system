const router = require('express').Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  const interviews = await prisma.interview.findMany({ include: { candidate: true } });
  res.json(interviews);
});

router.post('/', auth, async (req, res) => {
  try {
    const { candidateId, type, interviewer, date, mode, remarks, status } = req.body;
    if (!candidateId || !interviewer || !date) {
      return res.status(400).json({ message: 'Candidate, interviewer and date are required' });
    }
    const interview = await prisma.interview.create({
      data: {
        candidateId: parseInt(candidateId),
        type,
        interviewer,
        date: new Date(date),
        mode,
        remarks: remarks || '',
        status: status || 'SCHEDULED'
      }
    });
    res.json(interview);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const interview = await prisma.interview.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(interview);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;