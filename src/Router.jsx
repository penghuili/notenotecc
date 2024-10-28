import React from 'react';
import { BabyRoutes } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { SaveLocalNotes } from './components/SaveLocalNotes.jsx';
import { isMobileWidth } from './shared/browser/device.js';
import { isLoggedInCat, useIsEmailVerified } from './shared/browser/store/sharedCats.js';
import { initEffect } from './shared/browser/store/sharedEffects.js';
import { ChangeEmail } from './shared/semi/ChangeEmail.jsx';
import { ChangePassword } from './shared/semi/ChangePassword.jsx';
import { PageLoading } from './shared/semi/PageLoading.jsx';
import { PrepareData } from './shared/semi/PrepareData.jsx';
import { ResetPassword } from './shared/semi/ResetPassword.jsx';
import { Security } from './shared/semi/Security.jsx';
import { Settings } from './shared/semi/Settings.jsx';
import { Setup2FA } from './shared/semi/Setup2FA.jsx';
import { SignIn } from './shared/semi/SignIn.jsx';
import { SignUp } from './shared/semi/SignUp.jsx';
import { Verify2FA } from './shared/semi/Verify2FA.jsx';
import { VerifyEmail } from './shared/semi/VerifyEmail.jsx';
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
  '/security/email': ChangeEmail,
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
      return (
        <BabyRoutes
          routes={verifyEmailRoutes}
          enableAnimation={isMobileWidth()}
          bgColor="var(--semi-color-bg-0)"
          maxWidth="600px"
        />
      );
    }

    if (hasLocalNotes === undefined) {
      return <PageLoading />;
    }
    if (hasLocalNotes) {
      return <SaveLocalNotes />;
    }

    return (
      <BabyRoutes
        routes={loggedInRoutes}
        enableAnimation={isMobileWidth()}
        bgColor="var(--semi-color-bg-0)"
        maxWidth="600px"
      />
    );
  }

  return (
    <BabyRoutes
      routes={publicRoutes}
      enableAnimation={isMobileWidth()}
      bgColor="var(--semi-color-bg-0)"
      maxWidth="600px"
    />
  );
});
