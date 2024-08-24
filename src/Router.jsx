import React from 'react';
import { useCat } from 'usecat';

import { PrepareData } from './components/PrepareData.jsx';
import { hasLocalNotesCat, SaveLocalNotes } from './components/SaveLocalNotes.jsx';
import { ChangeEmail } from './shared/react/ChangeEmail.jsx';
import { ChangePassword } from './shared/react/ChangePassword.jsx';
import { Routes } from './shared/react/my-router.jsx';
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
import { Account } from './views/Account.jsx';
import { AI } from './views/AI.jsx';
import { AlbumDetails } from './views/AlbumDetails.jsx';
import { AlbumEdit } from './views/AlbumEdit.jsx';
import { Albums } from './views/Albums.jsx';
import { AlbumsReorder } from './views/AlbumsReorder.jsx';
import { NoteAdd } from './views/NoteAdd.jsx';
import { NoteEdit } from './views/NoteEdit.jsx';
import { Notes } from './views/Notes.jsx';
import { OnThisDay } from './views/OnThisDay.jsx';
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

const verifyEmailRoutes = [
  { path: '/security/email', component: VerifyEmail },
  { path: '/', component: VerifyEmail },
];
const commonRoutes = [
  { path: '/notes/add', component: NoteAdd },
  { path: '/notes/:noteId', component: NoteEdit },

  { path: '/albums/reorder', component: AlbumsReorder },
  { path: '/albums/:albumId/edit', component: AlbumEdit },
  { path: '/albums/:albumId', component: AlbumDetails },
  { path: '/albums', component: Albums },

  { path: '/settings', component: Settings },
  { path: '/upgrade', component: Upgrade },
];
const loggedInRoutes = [
  ...commonRoutes,

  { path: '/account', component: Account },
  { path: '/on-this-day', component: OnThisDay },
  { path: '/security', component: Security },
  { path: '/security/2fa', component: Setup2FA },
  { path: '/security/email', component: ChangeEmail },
  { path: '/security/password', component: ChangePassword },

  { path: '/ai', component: AI },

  { path: '/', component: Notes },
];
const publicRoutes = [
  ...commonRoutes,

  { path: '/sign-up', component: SignUp },
  { path: '/sign-in', component: SignIn },
  { path: '/sign-in/2fa', component: Verify2FA },
  { path: '/reset-password', component: ResetPassword },

  { path: '/', component: Notes },
];

const AllRoutes = React.memo(() => {
  const isLoggedIn = useCat(isLoggedInCat);
  const isVerified = useIsEmailVerified();
  const hasLocalNotes = useCat(hasLocalNotesCat);

  if (isLoggedIn) {
    if (isVerified === undefined) {
      return <PageLoading />;
    }

    if (!isVerified) {
      return <Routes routes={verifyEmailRoutes} />;
    }

    if (hasLocalNotes) {
      return <SaveLocalNotes />;
    }

    return <Routes routes={loggedInRoutes} />;
  }

  return <Routes routes={publicRoutes} />;
});
