import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      backgroundColor: '#DEF7EC',
      borderColor: '#10B981',
      iconColor: '#10B981',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
      )
    },
    error: {
      backgroundColor: '#FEE2E2',
      borderColor: '#EF4444',
      iconColor: '#EF4444',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
        </svg>
      )
    },
    warning: {
      backgroundColor: '#FEF3C7',
      borderColor: '#F59E0B',
      iconColor: '#F59E0B',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
      )
    },
    info: {
      backgroundColor: '#DBEAFE',
      borderColor: '#3B82F6',
      iconColor: '#3B82F6',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
        </svg>
      )
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div style={{
      ...styles.container,
      backgroundColor: style.backgroundColor,
      borderLeft: `4px solid ${style.borderColor}`
    }}>
      <div style={{ ...styles.icon, color: style.iconColor }}>
        {style.icon}
      </div>
      <div style={styles.content}>
        <p style={styles.message}>{message}</p>
      </div>
      <button onClick={onClose} style={styles.closeButton}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    minWidth: '320px',
    maxWidth: '500px',
    animation: 'slideIn 0.3s ease-out',
  },
  icon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  message: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
    lineHeight: '1.5',
  },
  closeButton: {
    flexShrink: 0,
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: '#9ca3af',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  }
};
