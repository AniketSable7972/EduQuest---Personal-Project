import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contestApi } from '../api/client';
import { useContestWebSocket } from '../hooks/useWebSocket';
import Layout from '../components/Layout';
import Leaderboard from '../components/Leaderboard';

export default function ContestWaiting() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      await contestApi.join(roomId);
      const [contestRes, lbRes] = await Promise.all([
        contestApi.getByRoom(roomId),
        contestApi.getLeaderboard(roomId),
      ]);
      const c = contestRes.data.data;
      setContest(c);
      setLeaderboard(lbRes.data.data);

      if (c.status === 'LIVE') navigate(`/contest/${roomId}/play`);
      if (c.status === 'FINISHED') navigate(`/contest/${roomId}/results`);
    } catch {
      navigate('/join');
    } finally {
      setLoading(false);
    }
  }, [roomId, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useContestWebSocket(roomId, {
    onLeaderboard: setLeaderboard,
    onStatus: (status) => {
      if (status.status === 'LIVE') navigate(`/contest/${roomId}/play`);
      if (status.status === 'FINISHED') navigate(`/contest/${roomId}/results`);
    },
  });

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <h1 className="page-title">{contest?.title}</h1>
        <p className="page-subtitle">Waiting for the host to start the contest...</p>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.2em' }}>
            {roomId}
          </p>
          <p className="pulse" style={{ color: 'var(--text-muted)' }}>
            {contest?.participantCount} participants joined
          </p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Participants</h3>
        <Leaderboard entries={leaderboard} />
      </div>
    </Layout>
  );
}
