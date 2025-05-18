export const LectureCard = ({
  title,
  accessCode,
  section,
  schedule,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{title}</span>
        <div className="card-icons">
          <img
            src="/edit.png"
            alt="edit"
            className="icon-btn"
            onClick={onEdit}
          />
          <img
            src="/delete.png"
            alt="delete"
            className="icon-btn"
            onClick={onDelete}
          />
        </div>
      </div>
      <div className="card-body">
        <p className="auth">인증코드 : {accessCode}</p>
        <div className="bottom-info">
          <span>{section}</span>
          <span>{schedule}</span>
        </div>
      </div>
    </div>
  );
};
