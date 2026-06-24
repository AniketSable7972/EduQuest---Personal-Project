import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contestApi } from '../api/client';
import Layout from '../components/Layout';
import { LogIn } from 'lucide-react';

export default function JoinContest() {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    setError('');
    setLoading(true);
    try {
      const upper = roomId.trim().toUpperCase();
      await contestApi.join(upper);
      const res = await contestApi.getByRoom(upper);
      const contest = res.data.data;

      if (contest.status === 'LIVE') {
        navigate(`/contest/${upper}/play`);
      } else if (contest.status === 'FINISHED') {
        navigate(`/contest/${upper}/results`);
      } else {
        navigate(`/contest/${upper}/waiting`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join contest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Join Contest</h1>
      <p className="page-subtitle">Enter the Room ID provided by your host</p>

      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <form onSubmit={handleJoin}>
          <div className="form-group">
            <label>Room ID</label>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.3em', fontWeight: 700 }}
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            <LogIn size={18} /> {loading ? 'Joining...' : 'Join Contest'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
