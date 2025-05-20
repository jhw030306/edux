export const LectureCard = ({
  title,
  section,
  schedule,
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{title}</span>
      </div>
      <div className="card-body">
        <div className="bottom-info">
          <span>{section}</span>
          <span>{schedule}</span>
        </div>
      </div>
    </div>
  );
};
