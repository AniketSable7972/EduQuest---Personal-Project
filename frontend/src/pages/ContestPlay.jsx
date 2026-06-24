import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contestApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useContestWebSocket } from '../hooks/useWebSocket';
import Layout from '../components/Layout';
import Leaderboard from '../components/Leaderboard';
import { Clock } from 'lucide-react';
import './ContestPlay.css';

export default function ContestPlay() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStart, setQuestionStart] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      await contestApi.join(roomId);
      const [contestRes, lbRes] = await Promise.all([
        contestApi.getByRoom(roomId),
        contestApi.getLeaderboard(roomId),
      ]);
      const c = contestRes.data.data;
      if (c.status === 'FINISHED') {
        navigate(`/contest/${roomId}/results`);
        return;
      }
      if (c.status !== 'LIVE') {
        navigate(`/contest/${roomId}/waiting`);
        return;
      }
      setContest(c);
      setLeaderboard(lbRes.data.data);
      const myEntry = lbRes.data.data.find((e) => e.userId === user?.userId);
      if (myEntry) setScore(myEntry.score);
      setTimeLeft(c.timerMode === 'PER_QUESTION' ? c.perQuestionSeconds : c.totalMinutes * 60);
      setQuestionStart(Date.now());
    } catch {
      navigate('/join');
    } finally {
      setLoading(false);
    }
  }, [roomId, navigate, user?.userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useContestWebSocket(roomId, {
    onLeaderboard: setLeaderboard,
    onStatus: (status) => {
      if (status.status === 'FINISHED') {
        navigate(`/contest/${roomId}/results`);
      }
    },
  });

  useEffect(() => {
    if (!contest || submitting) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (contest.timerMode === 'PER_QUESTION') {
            handleSubmit(-1);
          } else {
            navigate(`/contest/${roomId}/results`);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [contest, currentIndex, submitting]);

  const handleSubmit = async (forcedIndex) => {
    if (submitting) return;
    setSubmitting(true);
    const timeTaken = Date.now() - questionStart;
    const answerIndex = forcedIndex ?? selected;
    if (answerIndex === null && forcedIndex === undefined) {
      setSubmitting(false);
      return;
    }

    try {
      const res = await contestApi.submitAnswer(roomId, {
        questionId: contest.questions[currentIndex].id,
        selectedIndex: answerIndex >= 0 ? answerIndex : 0,
        timeTakenMs: timeTaken,
      });
      const data = res.data.data;
      setScore(data.totalScore);
      setFeedback(data.correct ? 'correct' : 'incorrect');

      setTimeout(() => {
        setFeedback(null);
        if (data.finished || currentIndex >= contest.questions.length - 1) {
          navigate(`/contest/${roomId}/results`);
        } else {
          setCurrentIndex((i) => i + 1);
          setSelected(null);
          setQuestionStart(Date.now());
          if (contest.timerMode === 'PER_QUESTION') {
            setTimeLeft(contest.perQuestionSeconds);
          }
        }
        setSubmitting(false);
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.message || 'Submit failed');
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><div className="loading">Loading contest...</div></Layout>;
  if (!contest) return null;

  const question = contest.questions[currentIndex];
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <Layout>
      <div className="play-header">
        <div>
          <h2>{contest.title}</h2>
          <span className="question-counter">Question {currentIndex + 1} / {contest.questions.length}</span>
        </div>
        <div className={`timer ${timeLeft <= 10 ? 'timer-urgent' : ''}`}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
        <div className="current-score">Score: {score}</div>
      </div>

      <div className="play-grid">
        <div className="card question-card">
          {feedback && (
            <div className={`feedback ${feedback}`}>
              {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
            </div>
          )}
          <h3 className="question-text">{question.text}</h3>
          <div className="options">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                className={`option-btn ${selected === idx ? 'selected' : ''}`}
                onClick={() => setSelected(idx)}
                disabled={submitting}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                {opt}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleSubmit()}
            disabled={selected === null || submitting}
            style={{ marginTop: '1.5rem', width: '100%' }}
          >
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Live Leaderboard</h3>
          <Leaderboard entries={leaderboard} highlightUserId={user?.userId} />
        </div>
      </div>
    </Layout>
  );
}
