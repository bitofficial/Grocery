import { useEffect } from 'react'

export default function SuccessPopup({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(), 1500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backdropFilter: 'blur(4px)',
      background: 'rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(135deg, var(--success) 0%, #1fa34a 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
        minWidth: '300px',
        animation: 'slideDown 0.4s ease-out'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✓</div>
        <div style={{ marginTop: '0.5rem', fontWeight: '600', fontSize: '1rem', lineHeight: '1.5' }}>
          {message}
        </div>
      </div>
    </div>
  )
}

