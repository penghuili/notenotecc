import React from 'react';
import { Toaster } from 'react-hot-toast';

export function Toast({ position = 'top-center' }) {
  return (
    <Toaster
      position={position}
      toastOptions={{
        duration: 3000,
      }}
    />
  );
}
