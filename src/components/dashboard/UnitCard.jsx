import TopicItem from "./TopicItem";

function UnitCard({ unit, unitProgress, openUnit, onToggleUnit, progress, onToggleComplete, onToggleRevision }) {
  const isOpen = openUnit === unit.id;

  return (
    <div className="unit-card">
      <button type="button" className="unit-header" onClick={() => onToggleUnit(unit.id)}>
        <div className="unit-title">
          <span>{unit.name}</span>
          <span className="unit-progress-text">
            {unitProgress.completed} / {unitProgress.total}
          </span>
        </div>

        <span className="unit-toggle">{isOpen ? "▴" : "▾"}</span>
      </button>

      {isOpen && (
        <div className="unit-content">
          <div className="unit-progress">
            <div className="unit-progress-info">
              <span>{unitProgress.completed} / {unitProgress.total} topics completed</span>
              <span>{unitProgress.percentage}%</span>
            </div>

            <div className="unit-progress-bar">
              <div className="unit-progress-fill" style={{ width: `${unitProgress.percentage}%` }} />
            </div>
          </div>

          <ul className="topic-list">
            {unit.topics.map((topic) => (
              <TopicItem
                key={topic.id}
                topic={topic}
                topicProgress={progress[topic.id] || { completed: false, revision: false }}
                onToggleComplete={onToggleComplete}
                onToggleRevision={onToggleRevision}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UnitCard;
