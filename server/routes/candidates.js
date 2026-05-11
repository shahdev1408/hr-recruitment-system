const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/resumes';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
const uploadExcel = multer({ dest: 'uploads/excel/' });

router.get('/', auth, async (req, res) => {
  const candidates = await prisma.candidate.findMany({ include: { job: true } });
  res.json(candidates);
});

router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    const candidate = await prisma.candidate.create({
      data: { ...req.body, jobId: parseInt(req.body.jobId), resume: req.file?.filename || null }
    });
    res.json(candidate);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const candidate = await prisma.candidate.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(candidate);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await prisma.candidate.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

router.get('/export', auth, async (req, res) => {
  const candidates = await prisma.candidate.findMany({ include: { job: true } });
  const data = candidates.map(c => ({
    Name: c.name, Phone: c.phone, Email: c.email || '',
    Education: c.education, Experience: c.totalExperience || '',
    'Current CTC': c.currentCTC || '', 'Expected CTC': c.expectedCTC || '',
    'Notice Period': c.noticePeriod || '', Status: c.status, Job: c.job.title
  }));
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Candidates');
  const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=candidates.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

router.post('/import', auth, uploadExcel.single('file'), async (req, res) => {
  try {
    const wb = xlsx.readFile(req.file.path);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws);
    const jobs = await prisma.job.findMany();
    const defaultJobId = jobs[0]?.id || 1;
    let imported = 0;
    for (const row of data) {
      await prisma.candidate.create({
        data: {
          name: row['Name'] || row['name'] || 'Unknown',
          phone: String(row['Phone'] || row['phone'] || ''),
          email: row['Email'] || row['email'] || null,
          education: row['Education'] || row['education'] || '',
          passingYear: String(row['Passing Year'] || row['passingYear'] || ''),
          totalExperience: String(row['Experience'] || row['totalExperience'] || ''),
          currentCTC: String(row['Current CTC'] || row['currentCTC'] || ''),
          expectedCTC: String(row['Expected CTC'] || row['expectedCTC'] || ''),
          noticePeriod: String(row['Notice Period'] || row['noticePeriod'] || ''),
          jobId: defaultJobId,
          status: 'CALLING'
        }
      });
      imported++;
    }
    fs.unlinkSync(req.file.path);
    res.json({ message: `Successfully imported ${imported} candidates` });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;