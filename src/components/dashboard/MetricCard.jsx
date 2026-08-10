function MetricCard({ label, value, tone, level }) {
  return (
    <div className={`stat-card water-card ${tone}`}>
      <div className={`water-fill ${tone}`} style={{ "--water-level": `${level}%` }}>
        <span className="bubble bubble-1" />
        <span className="bubble bubble-2" />
        <span className="bubble bubble-3" />
      </div>

      <div className="water-content">
        <h3>{label}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
}

export default MetricCard;
