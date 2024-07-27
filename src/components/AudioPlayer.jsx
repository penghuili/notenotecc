import React from 'react';

export function AudioPlayer({ src, hidden, onLoad }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: hidden ? 'none' : 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.5rem',
      }}
    >
      <audio controls preload="metadata" onLoadedData={onLoad}>
        <source src={src} type="audio/webm" />
      </audio>
    </div>
  );
}
