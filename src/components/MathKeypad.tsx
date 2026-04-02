import React from 'react';

interface MathKeypadProps {
  onInput: (val: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const MathKeypad: React.FC<MathKeypadProps> = ({ onInput, onClear, onSubmit, disabled }) => {
  return (
    <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
      <div 
        className="glass-panel" 
        style={{ 
          padding: '0', 
          width: '100%',
          height: '226px',
          marginBottom: '0',
          background: 'rgba(15, 23, 42, 0.98)',
          border: 'none',
          borderRadius: '1.2rem 1.2rem 0 0'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 'calc(0.35rem + 1px)', width: '100%', height: '100%' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onInput(num.toString())}
              disabled={disabled}
              className="glass-panel"
              style={{ fontSize: '1.6rem', padding: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="glass-panel"
            style={{ fontSize: '1.2rem', color: 'var(--danger)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={() => onInput('0')}
            disabled={disabled}
            className="glass-panel"
            style={{ fontSize: '1.6rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            0
          </button>
          <button 
            onClick={onSubmit}
            disabled={disabled}
            className="btn-primary title-font" 
            style={{ fontSize: '1.5rem', padding: 0, height: '100%' }}
          >
            GO!
          </button>
        </div>
      </div>
    </div>
  );
};
