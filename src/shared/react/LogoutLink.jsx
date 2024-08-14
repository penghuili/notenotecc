import React from 'react';

import { LinkButton } from './LinkButton.jsx';
import { logOutEffect } from './store/sharedEffects';

export function LogoutLink() {
  return <LinkButton onClick={logOutEffect}>Log out</LinkButton>;
}
