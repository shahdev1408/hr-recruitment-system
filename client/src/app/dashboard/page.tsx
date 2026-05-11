'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalJobs: 0, totalCandidates: 0,
    interviews: 0, selected: 0, joined: 0, rejected: 0,
    calling: 0, screening: 0, shortlisted: 0, interview: 0
  });
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);
  const [todayInterviews, setTodayInterviews] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [jobsRes, candidatesRes, interviewsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/candidates'),
        api.get('/interviews'),
      ]);
      const candidates = candidatesRes.data;
      const interviews = interviewsRes.data;

      setStats({
        totalJobs: jobsRes.data.length,
        totalCandidates: candidates.length,
        interviews: interviews.length,
        selected: candidates.filter((c: any) => c.status === 'SELECTED').length,
        joined: candidates.filter((c: any) => c.status === 'JOINED').length,
        rejected: candidates.filter((c: any) => c.status === 'REJECTED').length,
        calling: candidates.filter((c: any) => c.status === 'CALLING').length,
        screening: candidates.filter((c: any) => c.status === 'SCREENING').length,
        shortlisted: candidates.filter((c: any) => c.status === 'SHORTLISTED').length,
        interview: candidates.filter((c: any) => c.status === 'INTERVIEW').length,
      });

      setRecentCandidates(candidates.slice(-5).reverse());

      const today = new Date().toDateString();
      const todayI = interviews.filter((i: any) =>
        new Date(i.date).toDateString() === today
      );
      setTodayInterviews(todayI);
    } catch (e) {
      console.error(e);
    }
  };

  const statusColors: any = {
    CALLING: 'bg-blue-100 text-blue-700',
    SCREENING: 'bg-yellow-100 text-yellow-700',
    INTERVIEW: 'bg-purple-100 text-purple-700',
    SHORTLISTED: 'bg-orange-100 text-orange-700',
    SELECTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    JOINED: 'bg-teal-100 text-teal-700',
  };

  const topCards = [
    { title: 'Total Jobs', value: stats.totalJobs, color: 'bg-blue-500', icon: '💼' },
    { title: 'Total Candidates', value: stats.totalCandidates, color: 'bg-purple-500', icon: '👥' },
    { title: 'Interviews Scheduled', value: stats.interviews, color: 'bg-yellow-500', icon: '📅' },
    { title: 'Selected', value: stats.selected, color: 'bg-green-500', icon: '✅' },
    { title: 'Joined', value: stats.joined, color: 'bg-teal-500', icon: '🎉' },
    { title: 'Rejected', value: stats.rejected, color: 'bg-red-500', icon: '❌' },
  ];

  const chartData = [
    { stage: 'Calling', count: stats.calling, color: '#06B6D4' },
    { stage: 'Screening', count: stats.screening, color: '#EAB308' },
    { stage: 'Interview', count: stats.interview, color: '#A855F7' },
    { stage: 'Shortlisted', count: stats.shortlisted, color: '#F97316' },
    { stage: 'Selected', count: stats.selected, color: '#22C55E' },
    { stage: 'Joined', count: stats.joined, color: '#14B8A6' },
    { stage: 'Rejected', count: stats.rejected, color: '#EF4444' },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name || 'HR Manager'} 👋
        </h1>
        <p className="text-gray-500 mt-1">MMIPL HR Recruitment System — Overview</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {topCards.map((card) => (
          <Card key={card.title} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center text-xl`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pipeline Chart */}
        <Card className="shadow-sm">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-gray-700">📊 Recruitment Pipeline</h2>
            <p className="text-xs text-gray-400 mt-1">Candidates by stage</p>
          </div>
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} candidates`, 'Count']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's Interviews */}
        <Card className="shadow-sm">
          <div className="p-5 border-b flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-gray-700">📅 Today's Interviews</h2>
              <p className="text-xs text-gray-400 mt-1">{new Date().toDateString()}</p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {todayInterviews.length} scheduled
            </span>
          </div>
          <CardContent className="p-0">
            {todayInterviews.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No interviews scheduled for today
              </div>
            ) : (
              <div className="divide-y">
                {todayInterviews.map((interview: any) => (
                  <div key={interview.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-gray-800">
                          {interview.candidate?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          👤 {interview.interviewer} • {interview.type} Round
                        </p>
                        <p className="text-xs text-gray-500">
                          📍 {interview.mode} • {new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        interview.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        interview.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {interview.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Candidates */}
      <Card className="shadow-sm">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">👥 Recent Candidates</h2>
          <a href="/candidates" className="text-xs text-blue-600 hover:underline">View all →</a>
        </div>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Name', 'Phone', 'Job', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentCandidates.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No candidates yet</td></tr>
              )}
              {recentCandidates.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{c.job?.title || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/candidates/${c.id}`} className="text-blue-600 hover:underline text-xs font-medium">
                      View →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}