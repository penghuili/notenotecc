import React from 'react';
import { BabyRoutes } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { PrepareData } from './components/PrepareData.jsx';
import { SaveLocalNotes } from './components/SaveLocalNotes.jsx';
import { ChangeEmail } from './shared/react/ChangeEmail.jsx';
import { ChangePassword } from './shared/react/ChangePassword.jsx';
import { isMobileWidth } from './shared/react/device.js';
import { PageLoading } from './shared/react/PageLoading.jsx';
import { ResetPassword } from './shared/react/ResetPassword.jsx';
import { Security } from './shared/react/Security.jsx';
import { Setup2FA } from './shared/react/Setup2FA.jsx';
import { SignIn } from './shared/react/SignIn.jsx';
import { SignUp } from './shared/react/SignUp.jsx';
import { isLoggedInCat, useIsEmailVerified } from './shared/react/store/sharedCats.js';
import { initEffect } from './shared/react/store/sharedEffects.js';
import { Verify2FA } from './shared/react/Verify2FA.jsx';
import { VerifyEmail } from './shared/react/VerifyEmail.jsx';
import { hasLocalNotesCat } from './store/note/noteCats.js';
import { Account } from './views/Account.jsx';
import { AddImagess } from './views/AddImages.jsx';
import { AI } from './views/AI.jsx';
import { AlbumDetails } from './views/AlbumDetails.jsx';
import { AlbumEdit } from './views/AlbumEdit.jsx';
import { Albums } from './views/Albums.jsx';
import { AlbumsReorder } from './views/AlbumsReorder.jsx';
import { Demo } from './views/Demo.jsx';
import { NoteEdit } from './views/NoteEdit.jsx';
import { Notes } from './views/Notes.jsx';
import { OnThisDay } from './views/OnThisDay.jsx';
import { PreviewImages } from './views/PreviewImages.jsx';
import { Settings } from './views/Settings.jsx';
import { Upgrade } from './views/Upgrade.jsx';

async function load() {
  initEffect();
}

export function Router() {
  return (
    <PrepareData load={load} source="Router">
      <AllRoutes />
    </PrepareData>
  );
}

const verifyEmailRoutes = {
  '/security/email': VerifyEmail,
  '/': VerifyEmail,
};
const commonRoutes = {
  '/notes/details': NoteEdit,
  '/add-images': AddImagess,
  '/preview-images': PreviewImages,

  '/albums/reorder': AlbumsReorder,
  '/albums/edit': AlbumEdit,
  '/albums/details': AlbumDetails,
  '/albums': Albums,

  '/settings': Settings,
  '/upgrade': Upgrade,
};
const loggedInRoutes = {
  ...commonRoutes,

  '/demo': Demo,

  '/account': Account,
  '/on-this-day': OnThisDay,
  '/security': Security,
  '/security/2fa': Setup2FA,
  '/security/email': ChangeEmail,
  '/security/password': ChangePassword,

  '/ai': AI,
  '/': Notes,
};
const publicRoutes = {
  ...commonRoutes,

  '/sign-up': SignUp,
  '/sign-in': SignIn,
  '/sign-in/2fa': Verify2FA,
  '/reset-password': ResetPassword,

  '/': Notes,
};

const AllRoutes = fastMemo(() => {
  const isLoggedIn = useCat(isLoggedInCat);
  const isVerified = useIsEmailVerified();
  const hasLocalNotes = useCat(hasLocalNotesCat);

  if (isLoggedIn) {
    if (isVerified === undefined) {
      return <PageLoading />;
    }

    if (!isVerified) {
      return <BabyRoutes routes={verifyEmailRoutes} enableAnimation={isMobileWidth()} />;
    }

    if (hasLocalNotes === undefined) {
      return <PageLoading />;
    }
    if (hasLocalNotes) {
      return <SaveLocalNotes />;
    }

    return <BabyRoutes routes={loggedInRoutes} enableAnimation={isMobileWidth()} />;
  }

  return <BabyRoutes routes={publicRoutes} enableAnimation={isMobileWidth()} />;
});
