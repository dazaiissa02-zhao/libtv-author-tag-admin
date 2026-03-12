export default function ConfirmModal({ visible, title, message, onConfirm, onCancel, danger }) {
  if (!visible) {
    return null;
  }

  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-body">
          <div className="confirm-body">
            <div className="confirm-icon">{danger ? '⚠️' : 'ℹ️'}</div>
            <div className="confirm-title">{title}</div>
            <div className="confirm-text">{message}</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onCancel}>
            取消
          </button>
          <button
            className={`btn ${danger ? 'btn-danger btn-danger-solid' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
