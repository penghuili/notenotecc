import { useAtomValue } from 'jotai';
import React, { useState } from 'react';

import { errorColor } from './AppWrapper.jsx';
import { Confirm } from './Confirm.jsx';
import { LinkButton } from './LinkButton.jsx';
import { isDeletingAccountAtom } from './store/sharedAtoms';
import { deleteAccountEffect } from './store/sharedEffects';

export function DeleteAccountLink() {
  const isDeleting = useAtomValue(isDeletingAccountAtom);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <LinkButton onClick={() => setShowConfirm(true)} color={errorColor} disabled={isDeleting}>
        Delete account
      </LinkButton>

      <Confirm
        message="All your data will be deleted. Are you sure?"
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={deleteAccountEffect}
        isSaving={isDeleting}
      />
    </>
  );
}
