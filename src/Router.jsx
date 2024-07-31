import { Flex, Spinner } from '@radix-ui/themes';
import React from 'react';
import { useCat } from 'usecat';
import { Redirect, Route, Switch, useLocation } from 'wouter';

import { ChangeEmail } from './shared-private/react/ChangeEmail.jsx';
import { ChangePassword } from './shared-private/react/ChangePassword.jsx';
import { LocalStorage, sharedLocalStorageKeys } from './shared-private/react/LocalStorage';
import { ResetPassword } from './shared-private/react/ResetPassword.jsx';
import { Security } from './shared-private/react/Security.jsx';
import { Setup2FA } from './shared-private/react/Setup2FA.jsx';
import { SignIn } from './shared-private/react/SignIn.jsx';
import { SignUp } from './shared-private/react/SignUp.jsx';
import {
  isCheckingRefreshTokenCat,
  isLoadingAccountCat,
  isLoggedInCat,
  useIsEmailVerified,
} from './shared-private/react/store/sharedCats.js';
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

export function Router() {
  const isCheckingRefreshToken = useCat(isCheckingRefreshTokenCat);
  const isLoadingAccount = useCat(isLoadingAccountCat);
  const isLoggedIn = useCat(isLoggedInCat);
  const isVerified = useIsEmailVerified();

  const [path] = useLocation();

  if (isCheckingRefreshToken || isLoadingAccount) {
    return (
      <Flex justify="center" py="8">
        <Spinner size="3" />
      </Flex>
    );
  }

  if (isLoggedIn) {
    if (!isVerified) {
      return (
        <Switch>
          <Route path="/security/email" component={ChangeEmail} />

          <Route path="/" component={VerifyEmail} />
          <Route>{() => <Redirect to="/" />}</Route>
        </Switch>
      );
    }

    const redirectUrl = LocalStorage.get(sharedLocalStorageKeys.redirectUrl);
    if (redirectUrl) {
      LocalStorage.remove(sharedLocalStorageKeys.redirectUrl);
      return <Redirect to={redirectUrl} />;
    }

    return (
      <Switch>
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
        <Route>{() => <Redirect to="/" />}</Route>
      </Switch>
    );
  }

  if (!['/sign-up', '/sign-in', '/sign-in/2fa', '/', '/reset-password'].includes(path)) {
    LocalStorage.set(sharedLocalStorageKeys.redirectUrl, path);
  }

  return (
    <Switch>
      <Route path="/sign-up" component={SignUp} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-in/2fa" component={Verify2FA} />
      <Route path="/reset-password" component={ResetPassword} />

      <Route path="/" component={Welcome} />
      <Route>{() => <Redirect to="/" />}</Route>
    </Switch>
  );
}
