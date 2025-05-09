export const LectureCard = ({
  title,
  authCode,
  section,
  schedule,
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{title}</span>
      </div>
      <div className="card-body">
        <p className="auth">인증코드 : {authCode}</p>
        <div className="bottom-info">
          <span>{section}</span>
          <span>{schedule}</span>
        </div>
      </div>
    </div>
  );
};
