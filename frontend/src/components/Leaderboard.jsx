import './Leaderboard.css';

export default function Leaderboard({ entries, highlightUserId }) {
  if (!entries?.length) {
    return <p className="text-muted">No participants yet.</p>;
  }

  return (
    <div className="leaderboard">
      {entries.map((entry, idx) => (
        <div
          key={entry.userId}
          className={`leaderboard-row ${entry.userId === highlightUserId ? 'highlight' : ''} ${idx < 3 ? `rank-${idx + 1}` : ''}`}
        >
          <span className="rank">#{entry.rank || idx + 1}</span>
          <div className="player-info">
            {entry.profilePhotoUrl ? (
              <img src={entry.profilePhotoUrl} alt="" className="avatar" />
            ) : (
              <div className="avatar placeholder">{entry.userName?.[0]?.toUpperCase()}</div>
            )}
            <span className="name">{entry.userName}</span>
          </div>
          <span className="score">{entry.score} pts</span>
          <span className="accuracy">{entry.accuracy?.toFixed(0)}%</span>
          {entry.finished && <span className="badge badge-live">Done</span>}
        </div>
      ))}
    </div>
  );
}
