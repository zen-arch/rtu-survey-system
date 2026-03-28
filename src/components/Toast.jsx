
function Toast({ message, show }) {
  if (!show) return null
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: '#0033A0',
      color: '#FFFFFF',
      padding: '12px 20px',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      zIndex: 9999,
      borderLeft: '4px solid #FFD700',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {message}
    </div>
  )
}

export default Toast

