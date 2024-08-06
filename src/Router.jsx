import React from 'react';
import { useCat } from 'usecat';

import { PrepareData } from './components/PrepareData.jsx';
import { useRerenderDetector } from './lib/useRerenderDetector.js';
import { ChangeEmail } from './shared-private/react/ChangeEmail.jsx';
import { ChangePassword } from './shared-private/react/ChangePassword.jsx';
import { LocalStorage, sharedLocalStorageKeys } from './shared-private/react/LocalStorage';
import {
  DefaultRoute,
  Redirect,
  Route,
  useSetupRouter,
} from './shared-private/react/my-router.jsx';
import { ResetPassword } from './shared-private/react/ResetPassword.jsx';
import { Security } from './shared-private/react/Security.jsx';
import { Setup2FA } from './shared-private/react/Setup2FA.jsx';
import { SignIn } from './shared-private/react/SignIn.jsx';
import { SignUp } from './shared-private/react/SignUp.jsx';
import { isLoggedInCat, useIsEmailVerified } from './shared-private/react/store/sharedCats.js';
import { initEffect } from './shared-private/react/store/sharedEffects.js';
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
  useSetupRouter();

  return (
    <PrepareData load={load}>
      <Routes />
    </PrepareData>
  );
}

const Routes = React.memo(() => {
  const isLoggedIn = useCat(isLoggedInCat);
  const isVerified = useIsEmailVerified();

  const pathname = location.pathname;
  const pathWithQuery = `${pathname}${location.search}`;

  useRerenderDetector('Routes', { isLoggedIn, isVerified, pathWithQuery });

  if (isLoggedIn) {
    if (!isVerified) {
      return (
        <>
          <Route path="/security/email" component={ChangeEmail} />

          <Route path="/" component={VerifyEmail} />

          <DefaultRoute to="/" />
        </>
      );
    }

    const redirectUrl = LocalStorage.get(sharedLocalStorageKeys.redirectUrl);
    if (redirectUrl) {
      LocalStorage.remove(sharedLocalStorageKeys.redirectUrl);
      return <Redirect to={redirectUrl} />;
    }

    return (
      <>
        <Route path="/notes/add" component={NoteAdd} />
        <Route path="/notes/:noteId" component={NoteEdit} />

        <Route path="/albums/:albumId/edit" component={AlbumEdit} />
        <Route path="/albums/:albumId" component={AlbumDetails} />
        <Route path="/albums" component={Albums} />

        <Route path="/account" component={Account} />
        <Route path="/on-this-day" component={OnThisDay} />
        <Route path="/security" component={Security} />
        <Route path="/security/2fa" component={Setup2FA} />
        <Route path="/security/email" component={ChangeEmail} />
        <Route path="/security/password" component={ChangePassword} />

        <Route path="/" component={Notes} />

        <DefaultRoute to="/" />
      </>
    );
  }

  if (!['/', '/sign-up', '/sign-in', '/sign-in/2fa', '/reset-password'].includes(pathname)) {
    LocalStorage.set(sharedLocalStorageKeys.redirectUrl, pathWithQuery);
  }

  return (
    <>
      <Route path="/sign-up" component={SignUp} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-in/2fa" component={Verify2FA} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/" component={Welcome} />

      <DefaultRoute to="/" />
    </>
  );
});
