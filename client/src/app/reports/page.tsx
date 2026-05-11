'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

export default function ReportsPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [cRes, jRes, iRes] = await Promise.all([
        api.get('/candidates'),
        api.get('/jobs'),
        api.get('/interviews'),
      ]);
      setCandidates(cRes.data);
      setJobs(jRes.data);
      setInterviews(iRes.data);
    };
    fetchData();
  }, []);

  // Candidates per job
  const candidatesPerJob = jobs.map(j => ({
    name: j.title.length > 15 ? j.title.substring(0, 15) + '...' : j.title,
    candidates: candidates.filter(c => c.jobId === j.id).length,
  }));

  // Status distribution
  const statusData = [
    { name: 'Calling', value: candidates.filter(c => c.status === 'CALLING').length, color: '#06B6D4' },
    { name: 'Screening', value: candidates.filter(c => c.status === 'SCREENING').length, color: '#EAB308' },
    { name: 'Interview', value: candidates.filter(c => c.status === 'INTERVIEW').length, color: '#A855F7' },
    { name: 'Shortlisted', value: candidates.filter(c => c.status === 'SHORTLISTED').length, color: '#F97316' },
    { name: 'Selected', value: candidates.filter(c => c.status === 'SELECTED').length, color: '#22C55E' },
    { name: 'Joined', value: candidates.filter(c => c.status === 'JOINED').length, color: '#14B8A6' },
    { name: 'Rejected', value: candidates.filter(c => c.status === 'REJECTED').length, color: '#EF4444' },
  ].filter(s => s.value > 0);

  // Interview mode distribution
  const modeData = [
    { name: 'Telephonic', value: interviews.filter(i => i.mode === 'TELEPHONIC').length, color: '#3B82F6' },
    { name: 'Face to Face', value: interviews.filter(i => i.mode === 'FACE_TO_FACE').length, color: '#8B5CF6' },
  ].filter(m => m.value > 0);

  // Hiring type distribution
  const hiringTypeData = [
    { name: 'New Hiring', value: jobs.filter(j => j.hiringType === 'NEW').length, color: '#22C55E' },
    { name: 'Replacement', value: jobs.filter(j => j.hiringType === 'REPLACEMENT').length, color: '#F97316' },
  ].filter(h => h.value > 0);

  // Conversion rate
  const conversionRate = candidates.length > 0
    ? Math.round((candidates.filter(c => c.status === 'SELECTED' || c.status === 'JOINED').length / candidates.length) * 100)
    : 0;

  const summaryCards = [
    { title: 'Total Jobs Open', value: jobs.filter(j => j.status === 'OPEN').length, icon: '💼', color: 'text-blue-600' },
    { title: 'Total Candidates', value: candidates.length, icon: '👥', color: 'text-purple-600' },
    { title: 'Total Interviews', value: interviews.length, icon: '📅', color: 'text-yellow-600' },
    { title: 'Conversion Rate', value: `${conversionRate}%`, icon: '📈', color: 'text-green-600' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Complete recruitment performance overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <Card key={card.title} className="shadow-sm">
            <CardContent className="p-5 text-center">
              <div className="text-3xl mb-2">{card.icon}</div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Candidates Per Job */}
        <Card className="shadow-sm">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-gray-700">💼 Candidates Per Job</h2>
            <p className="text-xs text-gray-400 mt-1">How many candidates applied per opening</p>
          </div>
          <CardContent className="p-5">
            {candidatesPerJob.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={candidatesPerJob}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="candidates" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution Pie */}
        <Card className="shadow-sm">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-gray-700">📊 Candidate Status Distribution</h2>
            <p className="text-xs text-gray-400 mt-1">Current stage of all candidates</p>
          </div>
          <CardContent className="p-5">
            {statusData.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Interview Mode */}
        <Card className="shadow-sm">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-gray-700">📞 Interview Mode Distribution</h2>
            <p className="text-xs text-gray-400 mt-1">Telephonic vs Face to Face</p>
          </div>
          <CardContent className="p-5">
            {modeData.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No interviews yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={modeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {modeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Hiring Type */}
        <Card className="shadow-sm">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-gray-700">🔄 Hiring Type Distribution</h2>
            <p className="text-xs text-gray-400 mt-1">New Hiring vs Replacement</p>
          </div>
          <CardContent className="p-5">
            {hiringTypeData.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No jobs yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={hiringTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {hiringTypeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Candidate Table */}
      <Card className="shadow-sm">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">📋 Complete Candidate Report</h2>
          <span className="text-xs text-gray-400">{candidates.length} total candidates</span>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Name', 'Phone', 'Job', 'Experience', 'Current CTC', 'Expected CTC', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No candidates yet</td></tr>
                )}
                {candidates.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <a href={`/candidates/${c.id}`} className="text-blue-600 hover:underline">{c.name}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{c.job?.title || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.totalExperience || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.currentCTC || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.expectedCTC || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        c.status === 'SELECTED' ? 'bg-green-100 text-green-700' :
                        c.status === 'JOINED' ? 'bg-teal-100 text-teal-700' :
                        c.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        c.status === 'SHORTLISTED' ? 'bg-orange-100 text-orange-700' :
                        c.status === 'INTERVIEW' ? 'bg-purple-100 text-purple-700' :
                        c.status === 'SCREENING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}