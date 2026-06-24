import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contestApi } from '../api/client';
import { useContestWebSocket } from '../hooks/useWebSocket';
import Layout from '../components/Layout';
import Leaderboard from '../components/Leaderboard';
import { Play, Square, Copy, BarChart3 } from 'lucide-react';

export default function HostLobby() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchContest = useCallback(async () => {
    try {
      const [contestRes, lbRes] = await Promise.all([
        contestApi.getByRoom(roomId),
        contestApi.getLeaderboard(roomId),
      ]);
      setContest(contestRes.data.data);
      setLeaderboard(lbRes.data.data);
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [roomId, navigate]);

  useEffect(() => { fetchContest(); }, [fetchContest]);

  useContestWebSocket(roomId, {
    onLeaderboard: setLeaderboard,
    onStatus: (status) => {
      setContest((prev) => prev ? { ...prev, status: status.status } : prev);
      if (status.status === 'FINISHED') {
        navigate(`/contest/${roomId}/results`);
      }
    },
  });

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startContest = async () => {
    setActionLoading(true);
    try {
      const res = await contestApi.start(roomId);
      setContest(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start');
    } finally {
      setActionLoading(false);
    }
  };

  const endContest = async () => {
    setActionLoading(true);
    try {
      await contestApi.end(roomId);
      navigate(`/contest/${roomId}/results`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading">Loading lobby...</div></Layout>;

  return (
    <Layout>
      <h1 className="page-title">{contest.title}</h1>
      <p className="page-subtitle">Host Control Panel</p>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Room Info</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
            {roomId}
          </p>
          <button className="btn btn-secondary" onClick={copyRoomId} style={{ marginBottom: '1rem' }}>
            <Copy size={16} /> {copied ? 'Copied!' : 'Copy Room ID'}
          </button>
          <p><strong>Status:</strong> <span className={`badge badge-${contest.status?.toLowerCase()}`}>{contest.status}</span></p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {contest.questions?.length} questions · {contest.participantCount} participants
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            Timer: {contest.timerMode === 'PER_QUESTION'
              ? `${contest.perQuestionSeconds}s per question`
              : `${contest.totalMinutes} min total`}
          </p>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {contest.status === 'WAITING' && (
              <button className="btn btn-success" onClick={startContest} disabled={actionLoading}>
                <Play size={16} /> Start Contest
              </button>
            )}
            {contest.status === 'LIVE' && (
              <button className="btn btn-danger" onClick={endContest} disabled={actionLoading}>
                <Square size={16} /> End Contest
              </button>
            )}
            {contest.status === 'FINISHED' && (
              <Link to={`/contest/${roomId}/results`} className="btn btn-primary">
                View Results
              </Link>
            )}
            <Link to={`/host/analytics/${roomId}`} className="btn btn-secondary">
              <BarChart3 size={16} /> Analytics
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Live Leaderboard</h3>
          <Leaderboard entries={leaderboard} />
        </div>
      </div>
    </Layout>
  );
}
