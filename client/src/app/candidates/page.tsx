'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Candidate {
  id: number;
  name: string;
  phone: string;
  email: string;
  education: string;
  passingYear: string;
  totalExperience: string;
  currentCTC: string;
  expectedCTC: string;
  noticePeriod: string;
  currentLocation: string;
  designation: string;
  remarks: string;
  resume: string;
  status: string;
  job: { title: string };
  jobId: number;
}

const statusColors: any = {
  CALLING: 'bg-blue-100 text-blue-700',
  SCREENING: 'bg-yellow-100 text-yellow-700',
  INTERVIEW: 'bg-purple-100 text-purple-700',
  SHORTLISTED: 'bg-orange-100 text-orange-700',
  SELECTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  JOINED: 'bg-teal-100 text-teal-700',
};

const emptyForm = {
  name: '', phone: '', email: '', education: '',
  passingYear: '', totalExperience: '', currentCTC: '',
  expectedCTC: '', noticePeriod: '', currentLocation: '',
  designation: '', remarks: '', jobId: '', status: 'CALLING'
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);

  const fetchData = async () => {
    const [cRes, jRes] = await Promise.all([api.get('/candidates'), api.get('/jobs')]);
    setCandidates(cRes.data);
    setJobs(jRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (resumeFile) formData.append('resume', resumeFile);
      if (editId) {
        await api.put(`/candidates/${editId}`, form);
      } else {
        await api.post('/candidates', formData);
      }
      setOpen(false);
      setForm(emptyForm);
      setEditId(null);
      setResumeFile(null);
      fetchData();
    } catch (e) {
      alert('Error saving candidate');
    }
  };

  const handleEdit = (c: Candidate) => {
    setForm({
      name: c.name, phone: c.phone, email: c.email || '',
      education: c.education, passingYear: c.passingYear || '',
      totalExperience: c.totalExperience || '', currentCTC: c.currentCTC || '',
      expectedCTC: c.expectedCTC || '', noticePeriod: c.noticePeriod || '',
      currentLocation: c.currentLocation || '', designation: c.designation || '',
      remarks: c.remarks || '', jobId: c.jobId.toString(), status: c.status
    });
    setEditId(c.id);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this candidate?')) return;
    await api.delete(`/candidates/${id}`);
    fetchData();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await api.put(`/candidates/${id}`, { status });
    fetchData();
  };

  const handleExport = async () => {
    const res = await api.get('/candidates/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates.xlsx';
    a.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/candidates/import', formData);
      alert(res.data.message);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Candidates</h1>
          <p className="text-gray-500 text-sm">Recruitment calling list & tracking</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>📥 Export Excel</Button>
          <label className="cursor-pointer">
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            <span className={`inline-flex items-center px-4 py-2 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50 ${importing ? 'opacity-50' : ''}`}>
              📤 {importing ? 'Importing...' : 'Import Excel'}
            </span>
          </label>
          <Button onClick={() => { setForm(emptyForm); setEditId(null); setOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700">
            + Add Candidate
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name, phone or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Name', 'Phone', 'Education', 'Experience', 'Current CTC', 'Expected CTC', 'Notice Period', 'Job', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No candidates yet</td></tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <a href={`/candidates/${c.id}`} className="text-blue-600 hover:underline cursor-pointer">{c.name}</a>
                    </td>
                    <td className="px-4 py-3">{c.phone}</td>
                    <td className="px-4 py-3">{c.education}</td>
                    <td className="px-4 py-3">{c.totalExperience || '-'}</td>
                    <td className="px-4 py-3">{c.currentCTC || '-'}</td>
                    <td className="px-4 py-3">{c.expectedCTC || '-'}</td>
                    <td className="px-4 py-3">{c.noticePeriod || '-'}</td>
                    <td className="px-4 py-3">{c.job?.title || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${statusColors[c.status]}`}
                      >
                        {Object.keys(statusColors).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(c)} className="text-blue-600 hover:underline text-xs">Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                        {c.resume && (
                          <a href={`http://localhost:5000/uploads/resumes/${c.resume}`} target="_blank" className="text-green-600 hover:underline text-xs">Resume</a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Candidate' : 'Add New Candidate'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {[
              { label: 'Full Name', key: 'name' },
              { label: 'Phone', key: 'phone' },
              { label: 'Email', key: 'email' },
              { label: 'Education', key: 'education' },
              { label: 'Passing Year', key: 'passingYear' },
              { label: 'Total Experience', key: 'totalExperience' },
              { label: 'Current CTC', key: 'currentCTC' },
              { label: 'Expected CTC', key: 'expectedCTC' },
              { label: 'Notice Period', key: 'noticePeriod' },
              { label: 'Current Location', key: 'currentLocation' },
              { label: 'Current Designation', key: 'designation' },
            ].map(({ label, key }) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={label}
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label>Job Opening</Label>
              <Select value={form.jobId} onValueChange={(v) => setForm({ ...form, jobId: v })}>
                <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                <SelectContent>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id.toString()}>{j.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(statusColors).map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Remarks</Label>
              <Textarea
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Add any notes or remarks..."
                rows={3}
              />
            </div>
            {!editId && (
              <div className="col-span-2 space-y-1">
                <Label>Upload Resume (PDF/DOC)</Label>
                <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>
              {editId ? 'Update Candidate' : 'Add Candidate'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}