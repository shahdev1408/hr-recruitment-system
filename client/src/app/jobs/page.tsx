'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
// import Sidebar from '@/components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  vacancies: number;
  experience: string;
  salaryRange: string;
  hiringType: string;
  stream: string;
  level: string;
  qualification: string;
  qualities: string;
  designation: string;
  status: string;
  recruiter: string;
  channels: string;
  projectCode: string;
  priority: string;
  periodOfPost: string;
}

const CHANNELS = [
  'Naukri', 'Indeed', 'ApnaHire', 'Workindia',
  'Newspaper', 'Reference', 'Old Database', 'Recruiter Mode'
];

const emptyForm = {
  title: '', department: '', location: '', vacancies: '',
  experience: '', salaryRange: '', hiringType: 'NEW',
  stream: 'Design', level: 'Level 1', qualification: '',
  qualities: '', designation: '',
  recruiter: '', channels: '', projectCode: '',
  priority: 'Moderate', periodOfPost: ''
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);

  const fetchJobs = async () => {
    const res = await api.get('/jobs');
    setJobs(res.data);
  };

  useEffect(() => { fetchJobs(); }, []);

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        vacancies: parseInt(form.vacancies),
        channels: selectedChannels.join(',')
      };
      if (editId) {
        await api.put(`/jobs/${editId}`, data);
      } else {
        await api.post('/jobs', data);
      }
      setOpen(false);
      setForm(emptyForm);
      setSelectedChannels([]);
      setEditId(null);
      fetchJobs();
    } catch (e) {
      alert('Error saving job');
    }
  };

  const handleEdit = (job: Job) => {
    setForm({ ...job, vacancies: job.vacancies.toString() });
    setSelectedChannels(job.channels ? job.channels.split(',') : []);
    setEditId(job.id);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this job?')) return;
    await api.delete(`/jobs/${id}`);
    fetchJobs();
  };

  const priorityColor: any = {
    Critical: 'bg-red-100 text-red-700',
    'High Priority': 'bg-orange-100 text-orange-700',
    Moderate: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Job Requirements</h1>
            <p className="text-gray-500 text-sm">Manage all job openings and sourcing strategy</p>
          </div>
          <Button onClick={() => { setForm(emptyForm); setSelectedChannels([]); setEditId(null); setOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700">
            + Add Job
          </Button>
        </div>

        {/* Job Matrix Table */}
        {jobs.length > 0 && (
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-0">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-700">Job Matrix Overview</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Stream', 'Level', 'Experience', 'Qualification', 'Priority', 'Period of Post', 'Project Code', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setActiveTab(activeTab === job.id ? null : job.id)}>
                        <td className="px-4 py-3 font-medium">{job.stream}</td>
                        <td className="px-4 py-3">{job.level}</td>
                        <td className="px-4 py-3">{job.experience}</td>
                        <td className="px-4 py-3">{job.qualification}</td>
                        <td className="px-4 py-3">
                          <Badge className={priorityColor[job.priority] || 'bg-gray-100 text-gray-600'}>
                            {job.priority || 'Moderate'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{job.periodOfPost || '-'}</td>
                        <td className="px-4 py-3">{job.projectCode || '-'}</td>
                        <td className="px-4 py-3">
                          <Badge className={job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                            {job.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Cards */}
        <div className="grid gap-4">
          {jobs.length === 0 && (
            <Card><CardContent className="p-8 text-center text-gray-400">No jobs yet. Click Add Job to create one.</CardContent></Card>
          )}
          {jobs.map((job) => (
            <Card key={job.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Job Title Row */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                      <Badge className={job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>{job.status}</Badge>
                      <Badge className="bg-blue-100 text-blue-700">{job.hiringType}</Badge>
                      {job.priority && <Badge className={priorityColor[job.priority] || 'bg-gray-100'}>{job.priority}</Badge>}
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-4">
                      <span>🏢 {job.department}</span>
                      <span>📍 {job.location}</span>
                      <span>👤 {job.vacancies} vacancies</span>
                      <span>💰 {job.salaryRange}</span>
                      <span>🎓 {job.qualification}</span>
                      <span>⏱ {job.experience}</span>
                      <span>🔧 {job.stream} — {job.level}</span>
                      {job.projectCode && <span>📁 Code: {job.projectCode}</span>}
                    </div>

                    {/* Sourcing Strategy Section */}
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Sourcing Strategy</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {job.recruiter && (
                          <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                            👤 Recruiter: {job.recruiter}
                          </span>
                        )}
                        {job.periodOfPost && (
                          <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                            📅 Period: {job.periodOfPost}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.channels ? job.channels.split(',').map(channel => (
                          <span key={channel} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            ✓ {channel}
                          </span>
                        )) : (
                          <span className="text-xs text-gray-400">No channels selected</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(job)}>Edit</Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(job.id)}>Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Job' : 'Create New Job'}</DialogTitle>
            </DialogHeader>

            {/* Basic Info */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-gray-500 uppercase">Job Information</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Job Title', key: 'title' },
                  { label: 'Department', key: 'department' },
                  { label: 'Location', key: 'location' },
                  { label: 'Vacancies', key: 'vacancies' },
                  { label: 'Experience Required', key: 'experience' },
                  { label: 'Salary Range', key: 'salaryRange' },
                  { label: 'Qualification', key: 'qualification' },
                  { label: 'Designation', key: 'designation' },
                  { label: 'Qualities Required', key: 'qualities' },
                  { label: 'Project Code', key: 'projectCode' },
                  { label: 'Period of Post', key: 'periodOfPost' },
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
                  <Label>Hiring Type</Label>
                  <Select value={form.hiringType} onValueChange={(v) => setForm({ ...form, hiringType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New Hiring</SelectItem>
                      <SelectItem value="REPLACEMENT">Replacement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Stream</Label>
                  <Select value={form.stream} onValueChange={(v) => setForm({ ...form, stream: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Estimation">Estimation</SelectItem>
                      <SelectItem value="AutoCAD">AutoCAD</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Level</Label>
                  <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Level 1">Level 1 - DGM/GM</SelectItem>
                      <SelectItem value="Level 2">Level 2 - Sr. Manager</SelectItem>
                      <SelectItem value="Level 3">Level 3 - Executive/Assistant</SelectItem>
                      <SelectItem value="Level 4">Level 4 - Trainee/Fresher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High Priority">High Priority</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sourcing Strategy */}
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-3">Sourcing Strategy</p>
                <div className="space-y-1 mb-4">
                  <Label>Assign Recruiter</Label>
                  <Input
                    value={form.recruiter}
                    onChange={(e) => setForm({ ...form, recruiter: e.target.value })}
                    placeholder="Enter recruiter name"
                  />
                </div>
                <Label className="mb-2 block">Hiring Channels (select multiple)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CHANNELS.map(channel => (
                    <label key={channel} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${selectedChannels.includes(channel) ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes(channel)}
                        onChange={() => toggleChannel(channel)}
                        className="rounded"
                      />
                      <span className="text-sm">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>
                {editId ? 'Update Job' : 'Create Job'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}