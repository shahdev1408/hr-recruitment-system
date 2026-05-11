'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Interview {
  id: number;
  type: string;
  interviewer: string;
  date: string;
  mode: string;
  remarks: string;
  status: string;
  candidate: { name: string; phone: string; job: { title: string } };
}

const emptyForm = {
  candidateId: '', type: 'HR', interviewer: '',
  date: '', mode: 'TELEPHONIC', remarks: '', status: 'SCHEDULED'
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    const [iRes, cRes] = await Promise.all([api.get('/interviews'), api.get('/candidates')]);
    setInterviews(iRes.data);
    setCandidates(cRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    try {
      await api.post('/interviews', form);
      setOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error scheduling interview');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    await api.put(`/interviews/${id}`, { status });
    fetchData();
  };

  const statusColors: any = {
    SCHEDULED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Interviews</h1>
            <p className="text-gray-500 text-sm">Schedule and track interviews</p>
          </div>
          <Button onClick={() => { setForm(emptyForm); setOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700">
            + Schedule Interview
          </Button>
        </div>

        <div className="grid gap-4">
          {interviews.length === 0 && (
            <Card><CardContent className="p-8 text-center text-gray-400">No interviews scheduled yet.</CardContent></Card>
          )}
          {interviews.map((interview) => (
            <Card key={interview.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {interview.candidate?.name}
                      </h3>
                      <Badge className={interview.type === 'HR' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}>
                        {interview.type} Round
                      </Badge>
                      <Badge className={statusColors[interview.status]}>
                        {interview.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                      <span>📞 {interview.candidate?.phone}</span>
                      <span>💼 {interview.candidate?.job?.title}</span>
                      <span>👤 Interviewer: {interview.interviewer}</span>
                      <span>📅 {new Date(interview.date).toLocaleString()}</span>
                      <span>📍 Mode: {interview.mode}</span>
                      {interview.remarks && <span className="col-span-2">💬 {interview.remarks}</span>}
                    </div>
                  </div>
                  <div className="ml-4">
                    <select
                      value={interview.status}
                      onChange={(e) => handleStatusChange(interview.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded border border-gray-200 cursor-pointer"
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label>Candidate</Label>
                <Select value={form.candidateId} onValueChange={(v) => setForm({ ...form, candidateId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                  <SelectContent>
                    {candidates.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name} — {c.job?.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Round Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR">HR Round</SelectItem>
                      <SelectItem value="TECHNICAL">Technical Round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Mode</Label>
                  <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TELEPHONIC">Telephonic</SelectItem>
                      <SelectItem value="FACE_TO_FACE">Face to Face</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Interviewer Name</Label>
                <Input
                  value={form.interviewer}
                  onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
                  placeholder="Enter interviewer name"
                />
              </div>
              <div className="space-y-1">
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Remarks</Label>
                <Textarea
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="Any notes about the interview..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>
                Schedule Interview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}