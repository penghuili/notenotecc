import './theme.css';

import React from 'react';
import { useLocation } from 'wouter';

import { ErrorBoundary } from './components/ErrorBoundary';
import { FullScreenImage } from './components/FullScreenImage';
import { registerSW } from './registerSW';
import { Router } from './Router';
import { apps } from './shared-private/js/apps';
import { AppWrapper } from './shared-private/react/AppWrapper';
import { useEffectOnce } from './shared-private/react/hooks/useEffectOnce';
import {
  HooksOutsieWrapper,
  setHook,
} from './shared-private/react/hooksOutside';
import { initShared } from './shared-private/react/initShared';
import { initEffect } from './shared-private/react/store/sharedEffects';
import { Toast } from './shared-private/react/Toast';
import { resetAlbumAtoms } from './store/album/albumAtoms';
import { resetAlbumItemsAtoms } from './store/album/albumItemAtoms';
import { resetNoteAtoms } from './store/note/noteAtoms';

initShared({
  logo: '/icons/icon-192.png',
  app: apps.simplestcam.name,
  privacyUrl: 'https://remiind.cc/privacy/',
  termsUrl: 'https://remiind.cc/terms/',
  resetAtoms: () => {
    resetNoteAtoms();
    resetAlbumAtoms();
    resetAlbumItemsAtoms();
  },
});

setHook('location', useLocation);

registerSW();

function App() {
  useEffectOnce(initEffect);

  return (
    <ErrorBoundary>
      <AppWrapper hasPadding={false}>
        <Router />

        <FullScreenImage />
        <Toast position="bottom-right" />
      </AppWrapper>
      <HooksOutsieWrapper />
    </ErrorBoundary>
  );
}

export default App;
