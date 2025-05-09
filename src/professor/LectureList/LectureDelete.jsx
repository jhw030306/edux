export const LectureDelete = ({
  lecture,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="modal">
      <div className="modal-box">
        <h2>강의실 삭제</h2>
        <p>
          <strong>
            {lecture.title} {lecture.section}
          </strong>
          을
          <br />
          삭제하시겠습니까?
        </p>
        <small className="notice">
          (삭제 시 강의에 저장된 모든 정보는 삭제됩니다)
        </small>
        <div className="delete-buttons">
          <button
            onClick={onConfirm}
            className="submit-btn"
          >
            삭제
          </button>
          <button onClick={onCancel} className="submit-btn">
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
