import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../api/client';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getHistory(),
      analyticsApi.getStats(),
    ]).then(([histRes, statsRes]) => {
      setHistory(histRes.data.data);
      setStats(statsRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="loading">Loading analytics...</div></Layout>;

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <Layout>
      <h1 className="page-title">My Analytics</h1>
      <p className="page-subtitle">Your contest performance history</p>

      {stats && (
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Contests Played</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)' }}>{stats.contestsPlayed}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Score</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--gold)' }}>{stats.totalScore}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Avg Accuracy</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.averageAccuracy?.toFixed(1)}%</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Avg Completion</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{formatTime(stats.averageCompletionTimeMs)}</p>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Score History</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={history.slice(0, 10).map((h) => ({ name: h.title?.substring(0, 15), score: h.score }))}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Contest History</h3>
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No contests completed yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Contest</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Rank</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Score</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Accuracy</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.contestId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <Link to={`/contest/${h.roomId}/results`}>{h.title}</Link>
                  </td>
                  <td style={{ padding: '0.75rem' }}>#{h.rank}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--accent)' }}>{h.score}</td>
                  <td style={{ padding: '0.75rem' }}>{h.accuracy?.toFixed(0)}%</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(h.completionTimeMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
