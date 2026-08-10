function SubjectTabs({ subjects, selectedSubject, onSelect }) {
  return (
    <div className="subject-tabs" role="tablist" aria-label="Subjects">
      {Object.entries(subjects).map(([subjectId, subject]) => {
        const isActive = selectedSubject === subjectId;

        return (
          <button
            key={subjectId}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`subject-tab ${isActive ? "active" : ""}`.trim()}
            onClick={() => onSelect(subjectId)}
          >
            {subject.name}
          </button>
        );
      })}
    </div>
  );
}

export default SubjectTabs;
