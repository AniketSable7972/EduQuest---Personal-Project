import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contestApi } from '../api/client';
import Layout from '../components/Layout';
import { Plus, LogIn, Trophy } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contestApi.getHostContests()
      .then((res) => setContests(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = { LIVE: 'badge-live', WAITING: 'badge-waiting', FINISHED: 'badge-finished', DRAFT: 'badge-waiting' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
  };

  return (
    <Layout>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Welcome back, {user?.name}!</p>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <Link to="/host/create" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Plus size={32} color="#6366f1" />
          <h3 style={{ marginTop: '0.75rem' }}>Create Contest</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Set up a new quiz room with questions</p>
        </Link>
        <Link to="/join" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <LogIn size={32} color="#22d3ee" />
          <h3 style={{ marginTop: '0.75rem' }}>Join Contest</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter a Room ID to participate</p>
        </Link>
      </div>

      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Trophy size={24} /> Your Hosted Contests
      </h2>

      {loading ? (
        <div className="loading">Loading contests...</div>
      ) : contests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          No contests hosted yet. Create your first contest!
        </div>
      ) : (
        <div className="grid-2">
          {contests.map((c) => (
            <div key={c.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3>{c.title}</h3>
                {statusBadge(c.status)}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                Room ID: <strong style={{ color: 'var(--accent)' }}>{c.roomId}</strong>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {c.participantCount} participants · {c.questions?.length || 0} questions
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                {c.status !== 'FINISHED' && (
                  <Link to={`/host/lobby/${c.roomId}`} className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                    Manage
                  </Link>
                )}
                {c.status === 'FINISHED' && (
                  <Link to={`/contest/${c.roomId}/results`} className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                    Results
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
