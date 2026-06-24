import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Podium from '../components/Podium';
import Leaderboard from '../components/Leaderboard';
import { Trophy } from 'lucide-react';

export default function ContestResults() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      contestApi.getByRoom(roomId),
      contestApi.getLeaderboard(roomId),
    ]).then(([contestRes, lbRes]) => {
      setContest(contestRes.data.data);
      setLeaderboard(lbRes.data.data);
    }).finally(() => setLoading(false));
  }, [roomId]);

  if (loading) return <Layout><div className="loading">Loading results...</div></Layout>;

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const myEntry = leaderboard.find((e) => e.userId === user?.userId || e.userId === user?.id);

  return (
    <Layout>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Trophy size={48} color="#fbbf24" style={{ marginBottom: '0.5rem' }} />
        <h1 className="page-title">Contest Results</h1>
        <p className="page-subtitle">{contest?.title}</p>
      </div>

      {myEntry && (
        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h3>Your Performance</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div><strong style={{ fontSize: '2rem', color: 'var(--accent)' }}>#{myEntry.rank}</strong><br /><span style={{ color: 'var(--text-muted)' }}>Rank</span></div>
            <div><strong style={{ fontSize: '2rem', color: 'var(--gold)' }}>{myEntry.score}</strong><br /><span style={{ color: 'var(--text-muted)' }}>Score</span></div>
            <div><strong style={{ fontSize: '2rem' }}>{myEntry.accuracy?.toFixed(0)}%</strong><br /><span style={{ color: 'var(--text-muted)' }}>Accuracy</span></div>
            <div><strong style={{ fontSize: '2rem' }}>{myEntry.correctCount}/{myEntry.correctCount + myEntry.incorrectCount}</strong><br /><span style={{ color: 'var(--text-muted)' }}>Correct</span></div>
          </div>
        </div>
      )}

      <Podium topThree={topThree} />

      {rest.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>All Participants</h3>
          <Leaderboard entries={rest} highlightUserId={user?.userId || user?.id} />
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    </Layout>
  );
}
