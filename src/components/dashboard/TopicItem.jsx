function TopicItem({ topic, topicProgress, onToggleComplete, onToggleRevision }) {
  return (
    <li className="topic-item">
      <span className="topic-name">{topic.name}</span>

      <div className="topic-actions">
        <button
          type="button"
          className={`complete-btn ${topicProgress.completed ? "completed" : ""}`.trim()}
          onClick={() => onToggleComplete(topic.id)}
          aria-pressed={topicProgress.completed}
        >
          {topicProgress.completed ? "✓ Completed" : "Complete"}
        </button>

        <button
          type="button"
          className={`revision-btn ${topicProgress.revision ? "revision-active" : ""}`.trim()}
          onClick={() => onToggleRevision(topic.id)}
          aria-pressed={topicProgress.revision}
        >
          {topicProgress.revision ? "↻ Revision" : "Mark Revision"}
        </button>
      </div>
    </li>
  );
}

export default TopicItem;
