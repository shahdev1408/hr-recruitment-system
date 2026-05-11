'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const STAGES = [
  { key: 'CALLING', label: 'Searching & Calling', icon: '📞', desc: 'Initial vetting and calling' },
  { key: 'SCREENING', label: 'Screening', icon: '📋', desc: 'Pre-screening form & assessment' },
  { key: 'INTERVIEW', label: 'Interview', icon: '🎯', desc: 'HR & Technical rounds' },
  { key: 'SHORTLISTED', label: 'Shortlisted', icon: '⭐', desc: 'Management review' },
  { key: 'SELECTED', label: 'Selected', icon: '✅', desc: 'Offer made & joining formalities' },
  { key: 'JOINED', label: 'Joined', icon: '🎉', desc: 'Process complete' },
];

const CALLING_QUESTIONS = [
  'Are you currently looking for a job or job change? (YES/NO)',
  'What is your current location?',
  'Our profile and location (e.g., Ahmedabad, Surat) — is it okay for you?',
  'What is your qualification with the passing year?',
  'Are you currently working or not? If yes, when can you leave?',
  'What is your current designation and job role?',
  'What is your current and expected CTC?',
  'Do you have any notice period? (Yes/No) If yes, how many days and is it negotiable?',
  'What is your reason for job change?',
  'When are you able to attend the interview?',
];

export default function CandidateDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''));
  const [screeningNotes, setScreeningNotes] = useState('');
  const [offerDate, setOfferDate] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchData = async () => {
    const [cRes, iRes] = await Promise.all([
      api.get('/candidates'),
      api.get('/interviews'),
    ]);
    const found = cRes.data.find((c: any) => c.id === parseInt(id as string));
    if (found) {
      setCandidate(found);
      if (found.callingAnswers) {
        try {
          const parsed = JSON.parse(found.callingAnswers);
          setAnswers(parsed);
        } catch { setAnswers(Array(10).fill('')); }
      }
      if (found.screeningNotes) setScreeningNotes(found.screeningNotes);
      if (found.offerDate) setOfferDate(found.offerDate);
      if (found.joiningDate) setJoiningDate(found.joiningDate);
    }
    const cInterviews = iRes.data.filter((i: any) => i.candidateId === parseInt(id as string));
    setInterviews(cInterviews);
  };

  useEffect(() => { fetchData(); }, [id]);

  const getCurrentStageIndex = () => {
    if (!candidate) return 0;
    const idx = STAGES.findIndex(s => s.key === candidate.status);
    return idx === -1 ? 0 : idx;
  };

  const moveToStage = async (stageKey: string) => {
    setSaving(true);
    await api.put(`/candidates/${id}`, { status: stageKey });
    await fetchData();
    setSaving(false);
  };

  const handleReject = async () => {
    if (!confirm('Mark this candidate as Rejected?')) return;
    await api.put(`/candidates/${id}`, { status: 'REJECTED' });
    fetchData();
  };

  const saveCallingAnswers = async () => {
    setSavingNotes(true);
    try {
      await api.put(`/candidates/${id}`, { callingAnswers: JSON.stringify(answers) });
      alert('Calling answers saved!');
    } catch (e) {
      alert('Error saving answers');
    }
    setSavingNotes(false);
  };

  const saveScreeningNotes = async () => {
    setSavingNotes(true);
    try {
      await api.put(`/candidates/${id}`, { screeningNotes });
      alert('Screening notes saved!');
    } catch (e) {
      alert('Error saving notes');
    }
    setSavingNotes(false);
  };

  const saveOfferDetails = async () => {
    setSavingNotes(true);
    try {
      await api.put(`/candidates/${id}`, { offerDate, joiningDate });
      alert('Offer details saved!');
    } catch (e) {
      alert('Error saving offer details');
    }
    setSavingNotes(false);
  };

  if (!candidate) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Loading candidate...</p>
    </div>
  );

  const currentStageIdx = getCurrentStageIndex();
  const isRejected = candidate.status === 'REJECTED';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Back</button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{candidate.name}</h1>
          <p className="text-gray-500 text-sm">{candidate.phone} • {candidate.email || 'No email'} • {candidate.job?.title}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
        >
          🖨️ Print Profile
        </button>
        {isRejected ? (
          <Badge className="bg-red-100 text-red-700 text-sm px-3 py-1">REJECTED</Badge>
        ) : (
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleReject}>
            Reject Candidate
          </Button>
        )}
      </div>

      {/* Stage Pipeline */}
      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recruitment Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {STAGES.map((stage, idx) => {
              const isDone = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              const isNext = idx === currentStageIdx + 1;
              return (
                <div key={stage.key} className="flex items-center">
                  <div
                    className="flex flex-col items-center min-w-[100px] cursor-pointer group"
                    onClick={() => !isRejected && moveToStage(stage.key)}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all
                      ${isRejected ? 'bg-gray-100' :
                        isDone ? 'bg-green-500 shadow-md' :
                        isCurrent ? 'bg-blue-600 shadow-lg ring-4 ring-blue-100' :
                        isNext ? 'bg-gray-100 group-hover:bg-blue-50 border-2 border-dashed border-blue-300' :
                        'bg-gray-100'}`}>
                      {stage.icon}
                    </div>
                    <span className={`text-xs font-medium text-center leading-tight
                      ${isDone ? 'text-green-600' :
                        isCurrent ? 'text-blue-600' :
                        'text-gray-400'}`}>
                      {stage.label}
                    </span>
                    {isCurrent && !isRejected && (
                      <span className="text-xs text-blue-400 mt-1">Current</span>
                    )}
                    {isDone && (
                      <span className="text-xs text-green-400 mt-1">✓ Done</span>
                    )}
                  </div>
                  {idx < STAGES.length - 1 && (
                    <div className={`h-1 w-8 mx-1 rounded ${idx < currentStageIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
          {!isRejected && currentStageIdx < STAGES.length - 1 && (
            <div className="mt-4 pt-4 border-t">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={saving}
                onClick={() => moveToStage(STAGES[currentStageIdx + 1].key)}
              >
                {saving ? 'Saving...' : `Move to ${STAGES[currentStageIdx + 1].label} →`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">📋 Candidate Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Education', candidate.education],
                ['Passing Year', candidate.passingYear],
                ['Total Experience', candidate.totalExperience],
                ['Current CTC', candidate.currentCTC],
                ['Expected CTC', candidate.expectedCTC],
                ['Notice Period', candidate.noticePeriod],
                ['Current Location', candidate.currentLocation],
                ['Designation', candidate.designation],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-400 text-xs">{label}</p>
                  <p className="font-medium text-gray-700">{value || '-'}</p>
                </div>
              ))}
            </div>
            {candidate.remarks && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-400 text-xs mb-1">Remarks</p>
                <p className="text-gray-700 text-sm">{candidate.remarks}</p>
              </div>
            )}
            {candidate.resume && (
              <div className="mt-4 pt-4 border-t">
                <a
                  href={`http://localhost:5000/uploads/resumes/${candidate.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  📄 View Resume
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calling Questions */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">📞 Calling Questions Checklist</CardTitle>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveCallingAnswers}
              disabled={savingNotes}
            >
              {savingNotes ? 'Saving...' : 'Save Answers'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {CALLING_QUESTIONS.map((q, idx) => (
                <div key={idx} className="space-y-1">
                  <Label className="text-xs text-gray-600">{idx + 1}. {q}</Label>
                  <Input
                    placeholder="Enter answer..."
                    value={answers[idx]}
                    onChange={(e) => {
                      const updated = [...answers];
                      updated[idx] = e.target.value;
                      setAnswers(updated);
                    }}
                    className="text-sm h-8"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Screening Notes */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">📝 Screening & Assessment Notes</CardTitle>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveScreeningNotes}
              disabled={savingNotes}
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add screening notes, assessment feedback, pre-screening form responses..."
              value={screeningNotes}
              onChange={(e) => setScreeningNotes(e.target.value)}
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Interview History */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">🎯 Interview History</CardTitle>
          </CardHeader>
          <CardContent>
            {interviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No interviews scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {interviews.map((interview) => (
                  <div key={interview.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{interview.type} Round</span>
                      <Badge className={
                        interview.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        interview.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }>{interview.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">👤 {interview.interviewer}</p>
                    <p className="text-xs text-gray-500">📅 {new Date(interview.date).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">📍 {interview.mode}</p>
                    {interview.remarks && <p className="text-xs text-gray-600 mt-1">💬 {interview.remarks}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offer & Joining */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">🎁 Offer & Joining Details</CardTitle>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveOfferDetails}
              disabled={savingNotes}
            >
              {savingNotes ? 'Saving...' : 'Save Details'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Offer Date</Label>
                <Input
                  type="date"
                  value={offerDate}
                  onChange={(e) => setOfferDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Expected Joining Date</Label>
                <Input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => moveToStage('SELECTED')}
                >
                  ✅ Mark Selected
                </Button>
                <Button
                  variant="outline"
                  className="text-teal-600 border-teal-200 hover:bg-teal-50"
                  onClick={() => moveToStage('JOINED')}
                >
                  🎉 Mark Joined
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}