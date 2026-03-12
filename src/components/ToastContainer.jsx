export default function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : '⚠️'}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
