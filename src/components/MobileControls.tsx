interface MobileControlsProps {
  onTouchStart: (side: 'left' | 'right') => void
  onTouchEnd: (side: 'left' | 'right') => void
}

export function MobileControls({ onTouchStart, onTouchEnd }: MobileControlsProps) {
  return (
    <div
      data-testid="mobile-controls"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        gap: 16,
      }}
    >
      <button
        data-testid="mobile-left-flipper"
        onTouchStart={(e) => {
          e.preventDefault()
          onTouchStart('left')
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          onTouchEnd('left')
        }}
        onMouseDown={() => onTouchStart('left')}
        onMouseUp={() => onTouchEnd('left')}
        style={{
          flex: 1,
          padding: '20px 0',
          background: '#4a2800',
          color: '#FFD700',
          border: '2px solid #8B6914',
          borderRadius: 8,
          fontFamily: 'monospace',
          fontSize: 16,
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        Left Flipper
      </button>
      <button
        data-testid="mobile-right-flipper"
        onTouchStart={(e) => {
          e.preventDefault()
          onTouchStart('right')
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          onTouchEnd('right')
        }}
        onMouseDown={() => onTouchStart('right')}
        onMouseUp={() => onTouchEnd('right')}
        style={{
          flex: 1,
          padding: '20px 0',
          background: '#4a2800',
          color: '#FFD700',
          border: '2px solid #8B6914',
          borderRadius: 8,
          fontFamily: 'monospace',
          fontSize: 16,
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        Right Flipper
      </button>
    </div>
  )
}
