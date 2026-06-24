import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Podium.css';

export default function Podium({ topThree }) {
  const [first, second, third] = topThree;

  return (
    <div className="podium-section">
      <div className="podium">
        <div className="podium-place second">
          {second && (
            <>
              <div className="podium-avatar">{second.userName?.[0]}</div>
              <div className="podium-bar silver">
                <span className="podium-rank">2</span>
                <span className="podium-name">{second.userName}</span>
                <span className="podium-score">{second.score}</span>
              </div>
            </>
          )}
        </div>
        <div className="podium-place first">
          {first && (
            <>
              <div className="podium-avatar gold-ring">{first.userName?.[0]}</div>
              <div className="podium-bar gold">
                <span className="podium-rank">1</span>
                <span className="podium-name">{first.userName}</span>
                <span className="podium-score">{first.score}</span>
              </div>
            </>
          )}
        </div>
        <div className="podium-place third">
          {third && (
            <>
              <div className="podium-avatar">{third.userName?.[0]}</div>
              <div className="podium-bar bronze">
                <span className="podium-rank">3</span>
                <span className="podium-name">{third.userName}</span>
                <span className="podium-score">{third.score}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {topThree.length > 0 && (
        <div className="chart-container card">
          <h3>Score Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topThree.map((e) => ({ name: e.userName, score: e.score }))}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
              />
              <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
