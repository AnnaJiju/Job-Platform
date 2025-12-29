import { createPortal } from 'react-dom';
import Toast from './Toast';

export default function ToastContainer({ toasts, removeToast }) {
  return createPortal(
    <div style={styles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    pointerEvents: 'none',
  }
};
