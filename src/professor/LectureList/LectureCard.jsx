export const LectureCard = ({
  title,
  accessCode,
  section,
  schedule,
  onEdit,
  onDelete,
<<<<<<< HEAD
  onClick
=======
  onClick, // ✅ 추가
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
}) => {
  return (
    <div className="card" onClick={onClick}>
      {" "}
<<<<<<< HEAD
=======
      {/* ✅ 카드 전체 클릭 가능 */}
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
      <div className="card-header">
        <span className="card-title">{title}</span>
        <div className="card-icons">
          <img
            src="/edit.png"
            alt="edit"
            className="icon-btn"
            onClick={(e) => {
<<<<<<< HEAD
              e.stopPropagation(); //  부모 onClick 방지
=======
              e.stopPropagation(); // ✅ 부모 onClick 방지
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
              onEdit();
            }}
          />
          <img
            src="/delete.png"
            alt="delete"
            className="icon-btn"
            onClick={(e) => {
<<<<<<< HEAD
              e.stopPropagation(); // 부모 onClick 방지
=======
              e.stopPropagation(); // ✅ 부모 onClick 방지
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
              onDelete();
            }}
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
