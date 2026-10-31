import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App';

// Block all browser zoom mechanisms (touch gestures, wheel, keyboard shortcuts)
const blockZoom = () => {
  // Prevent Ctrl/Cmd + Wheel / Trackpad pinch zoom
  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Prevent multi-touch pinch to zoom
  window.addEventListener(
    'touchstart',
    (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Prevent Safari iOS gesture zoom
  const preventGesture = (e: Event) => e.preventDefault();
  window.addEventListener('gesturestart', preventGesture, { passive: false });
  window.addEventListener('gesturechange', preventGesture, { passive: false });
  window.addEventListener('gestureend', preventGesture, { passive: false });

  // Prevent keyboard zoom shortcuts (Ctrl/Cmd +, -, =, 0)
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '+' ||
          e.key === '-' ||
          e.key === '=' ||
          e.key === '0' ||
          e.code === 'NumpadAdd' ||
          e.code === 'NumpadSubtract' ||
          e.code === 'Equal' ||
          e.code === 'Minus' ||
          e.code === 'Digit0')
      ) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
};

blockZoom();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

