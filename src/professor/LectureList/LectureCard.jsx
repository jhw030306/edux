export const LectureCard = ({
  title,
  authCode,
  section,
  schedule,
  onEdit,
  onDelete,
  onClick, // ✅ 추가
}) => {
  return (
    <div className="card" onClick={onClick}>
      {" "}
      {/* ✅ 카드 전체 클릭 가능 */}
      <div className="card-header">
        <span className="card-title">{title}</span>
        <div className="card-icons">
          <img
            src="/edit.png"
            alt="edit"
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation(); // ✅ 부모 onClick 방지
              onEdit();
            }}
          />
          <img
            src="/delete.png"
            alt="delete"
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation(); // ✅ 부모 onClick 방지
              onDelete();
            }}
          />
        </div>
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
