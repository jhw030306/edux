export const LectureCard = ({
  title,
  section,
  schedule,
  onClick,
}) => {
  return (
    <div className="card" onClick={onClick}>
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
