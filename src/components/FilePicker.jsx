import React from 'react';

export function FilePicker({ accept, takePhoto, height, children, disabled, onSelect }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        height: height || '16px',
        cursor: 'pointer',
      }}
    >
      {children}
      <input
        type="file"
        accept={accept || 'image/*'}
        capture={takePhoto ? 'environment' : undefined}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
        }}
        onChange={e => {
          const file = onSelect(e.target.files?.[0]);
          if (file) {
            onSelect(file);
          }
        }}
        disabled={disabled}
      />
    </span>
  );
}
