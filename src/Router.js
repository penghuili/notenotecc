import { Flex, Spinner } from '@radix-ui/themes';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Redirect, Route, Switch, useLocation } from 'wouter';

import { ChangeEmail } from './shared-private/react/ChangeEmail';
import { ChangePassword } from './shared-private/react/ChangePassword';
import {
  LocalStorage,
  sharedLocalStorageKeys,
} from './shared-private/react/LocalStorage';
import { ResetPassword } from './shared-private/react/ResetPassword';
import { Security } from './shared-private/react/Security';
import { Setup2FA } from './shared-private/react/Setup2FA';
import { SignIn } from './shared-private/react/SignIn';
import { SignUp } from './shared-private/react/SignUp';
import {
  isCheckingRefreshTokenAtom,
  isEmailVerifiedAtom,
  isLoadingAccountAtom,
  isLoggedInAtom,
} from './shared-private/react/store/sharedAtoms';
import { Verify2FA } from './shared-private/react/Verify2FA';
import { VerifyEmail } from './shared-private/react/VerifyEmail';
import { Account } from './views/Account';
import { AlbumDetails } from './views/AlbumDetails';
import { Albums } from './views/Albums';
import { NoteAdd } from './views/NoteAdd';
import { NoteEdit } from './views/NoteEdit';
import { Notes } from './views/Notes';
import { OnThisDay } from './views/OnThisDay';
import { Welcome } from './views/Welcome';

export function Router() {
  const isCheckingRefreshToken = useAtomValue(isCheckingRefreshTokenAtom);
  const isLoadingAccount = useAtomValue(isLoadingAccountAtom);
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const isVerified = useAtomValue(isEmailVerifiedAtom);

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
        <Route path="/notes" component={Notes} />

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
