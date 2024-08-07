import React from 'react';
import { useCat } from 'usecat';

import { PageLoading } from './components/PageLoading.jsx';
import { PrepareData } from './components/PrepareData.jsx';
import { useRerenderDetector } from './lib/useRerenderDetector.js';
import { ChangeEmail } from './shared-private/react/ChangeEmail.jsx';
import { ChangePassword } from './shared-private/react/ChangePassword.jsx';
import { LocalStorage, sharedLocalStorageKeys } from './shared-private/react/LocalStorage';
import { Routes } from './shared-private/react/my-router.jsx';
import { ResetPassword } from './shared-private/react/ResetPassword.jsx';
import { Security } from './shared-private/react/Security.jsx';
import { Setup2FA } from './shared-private/react/Setup2FA.jsx';
import { SignIn } from './shared-private/react/SignIn.jsx';
import { SignUp } from './shared-private/react/SignUp.jsx';
import { isLoggedInCat, useIsEmailVerified } from './shared-private/react/store/sharedCats.js';
import { initEffect, navigateEffect } from './shared-private/react/store/sharedEffects.js';
import { Verify2FA } from './shared-private/react/Verify2FA.jsx';
import { VerifyEmail } from './shared-private/react/VerifyEmail.jsx';
import { Account } from './views/Account.jsx';
import { AlbumDetails } from './views/AlbumDetails.jsx';
import { AlbumEdit } from './views/AlbumEdit.jsx';
import { Albums } from './views/Albums.jsx';
import { NoteAdd } from './views/NoteAdd.jsx';
import { NoteEdit } from './views/NoteEdit.jsx';
import { Notes } from './views/Notes.jsx';
import { OnThisDay } from './views/OnThisDay.jsx';
import { Welcome } from './views/Welcome.jsx';

async function load() {
  await initEffect();
}

export function Router() {
  return (
    <PrepareData load={load}>
      <AllRoutes />
    </PrepareData>
  );
}

const verifyEmailRoutes = [
  { path: '/security/email', component: VerifyEmail },
  { path: '/', component: VerifyEmail },
];
const loggedRoutes = [
  { path: '/notes/add', component: NoteAdd },
  { path: '/notes/:noteId', component: NoteEdit },

  { path: '/albums/:albumId/edit', component: AlbumEdit },
  { path: '/albums/:albumId', component: AlbumDetails },
  { path: '/albums', component: Albums },

  { path: '/account', component: Account },
  { path: '/on-this-day', component: OnThisDay },
  { path: '/security', component: Security },
  { path: '/security/2fa', component: Setup2FA },
  { path: '/security/email', component: ChangeEmail },
  { path: '/security/password', component: ChangePassword },

  { path: '/', component: Notes },
];
const publicRoutes = [
  { path: '/sign-up', component: SignUp },
  { path: '/sign-in', component: SignIn },
  { path: '/sign-in/2fa', component: Verify2FA },
  { path: '/reset-password', component: ResetPassword },
  { path: '/', component: Welcome },
];

const AllRoutes = React.memo(() => {
  const isLoggedIn = useCat(isLoggedInCat);
  const isVerified = useIsEmailVerified();

  const pathname = location.pathname;
  const pathWithQuery = `${pathname}${location.search}`;

  useRerenderDetector('AllRoutes', { isLoggedIn, isVerified, pathWithQuery });

  if (isLoggedIn) {
    if (isVerified === undefined) {
      console.log('page loading');
      return <PageLoading />;
    }

    if (!isVerified) {
      console.log('verify email');
      return <Routes routes={verifyEmailRoutes} />;
    }

    const redirectUrl = LocalStorage.get(sharedLocalStorageKeys.redirectUrl);
    if (redirectUrl) {
      console.log('redirecting to', redirectUrl);
      LocalStorage.remove(sharedLocalStorageKeys.redirectUrl);
      navigateEffect(redirectUrl);
    }

    console.log('logged in');
    return <Routes routes={loggedRoutes} />;
  }

  if (!publicRoutes.map(route => route.path).includes(pathname)) {
    LocalStorage.set(sharedLocalStorageKeys.redirectUrl, pathWithQuery);
  }

  console.log('public');
  return <Routes routes={publicRoutes} />;
});
