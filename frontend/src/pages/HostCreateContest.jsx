import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contestApi } from '../api/client';
import Layout from '../components/Layout';
import { Plus, Trash2, Sparkles } from 'lucide-react';

const emptyQuestion = () => ({
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  difficulty: 'MEDIUM',
  topic: '',
});

export default function HostCreateContest() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timerMode, setTimerMode] = useState('PER_QUESTION');
  const [perQuestionSeconds, setPerQuestionSeconds] = useState(30);
  const [totalMinutes, setTotalMinutes] = useState(30);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('MEDIUM');
  const [aiCount, setAiCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);
  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

  const generateAI = async () => {
    if (!aiTopic.trim()) return;
    setGenerating(true);
    try {
      const res = await contestApi.generateQuestions({
        topic: aiTopic,
        difficulty: aiDifficulty,
        count: aiCount,
      });
      setQuestions([...questions, ...res.data.data]);
    } catch (err) {
      setError(err.response?.data?.message || 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await contestApi.create({
        title,
        description,
        timerMode,
        perQuestionSeconds: timerMode === 'PER_QUESTION' ? perQuestionSeconds : null,
        totalMinutes: timerMode === 'FULL_CONTEST' ? totalMinutes : null,
        questions: questions.filter((q) => q.text.trim()),
      });
      navigate(`/host/lobby/${res.data.data.roomId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create contest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Create Contest</h1>
      <p className="page-subtitle">Set up your quiz room and questions</p>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Contest Details</h3>
          <div className="form-group">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Timer Mode</label>
              <select value={timerMode} onChange={(e) => setTimerMode(e.target.value)}>
                <option value="PER_QUESTION">Per Question Timer</option>
                <option value="FULL_CONTEST">Full Contest Timer</option>
              </select>
            </div>
            {timerMode === 'PER_QUESTION' ? (
              <div className="form-group">
                <label>Seconds per Question</label>
                <input type="number" value={perQuestionSeconds} onChange={(e) => setPerQuestionSeconds(+e.target.value)} min={5} />
              </div>
            ) : (
              <div className="form-group">
                <label>Total Minutes</label>
                <input type="number" value={totalMinutes} onChange={(e) => setTotalMinutes(+e.target.value)} min={1} />
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} /> AI Question Generator
          </h3>
          <div className="grid-2">
            <div className="form-group">
              <label>Topic</label>
              <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g. JavaScript, Biology" />
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label>Count</label>
              <input type="number" value={aiCount} onChange={(e) => setAiCount(+e.target.value)} min={1} max={20} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={generateAI} disabled={generating}>
                {generating ? 'Generating...' : 'Generate Questions'}
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Manual Questions ({questions.length})</h3>
            <button type="button" className="btn btn-secondary" onClick={addQuestion}>
              <Plus size={16} /> Add Question
            </button>
          </div>

          {questions.map((q, idx) => (
            <div key={idx} style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none', paddingTop: idx > 0 ? '1rem' : 0, marginTop: idx > 0 ? '1rem' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>Question {idx + 1}</strong>
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="form-group">
                <input value={q.text} onChange={(e) => updateQuestion(idx, 'text', e.target.value)} placeholder="Question text" />
              </div>
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="form-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={q.correctIndex === oIdx}
                    onChange={() => updateQuestion(idx, 'correctIndex', oIdx)}
                  />
                  <input value={opt} onChange={(e) => updateOption(idx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Contest Room'}
        </button>
      </form>
    </Layout>
  );
}
