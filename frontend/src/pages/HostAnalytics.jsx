import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestApi } from '../api/client';
import Layout from '../components/Layout';
import Leaderboard from '../components/Leaderboard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HostAnalytics() {
  const { roomId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    contestApi.getAnalytics(roomId)
      .then((res) => setAnalytics(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [roomId]);

  if (loading) return <Layout><div className="loading">Loading analytics...</div></Layout>;
  if (error) return <Layout><p className="error-msg">{error}</p></Layout>;

  return (
    <Layout>
      <h1 className="page-title">Contest Analytics</h1>
      <p className="page-subtitle">{analytics.contestTitle} — Room {roomId}</p>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Participants</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)' }}>{analytics.totalParticipants}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Average Score</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--gold)' }}>{analytics.averageScore?.toFixed(0)}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Average Accuracy</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{analytics.averageAccuracy?.toFixed(1)}%</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Score Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analytics.leaderboard?.map((e) => ({ name: e.userName?.substring(0, 10), score: e.score }))}>
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
            <Bar dataKey="score" fill="#22d3ee" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Full Report</h3>
        <Leaderboard entries={analytics.leaderboard} />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link to={`/host/lobby/${roomId}`} className="btn btn-secondary">Back to Lobby</Link>
      </div>
    </Layout>
  );
}
