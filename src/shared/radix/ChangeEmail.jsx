import { Button, Flex, Text } from '@radix-ui/themes';
import React, { useState } from 'react';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { isChangingEmailCat, userCat } from '../browser/store/sharedCats.js';
import { changeEmailEffect, setToastEffect } from '../browser/store/sharedEffects.js';
import { changeEmailTrigger } from '../browser/store/sharedNetwork.js';
import { toastTypes } from '../browser/Toast.jsx';
import { FormButton } from './FormButton.jsx';
import { InputField } from './InputField.jsx';
import { ItemsWrapper } from './ItemsWrapper.jsx';
import { PageHeader } from './PageHeader.jsx';

export const ChangeEmail = fastMemo(() => {
  const user = useCat(userCat);
  const isChanging = useCat(isChangingEmailCat);

  const [newEmail, setNewEmail] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [code, setCode] = useState('');

  async function handleTrigger() {
    setIsTriggering(true);
    const { data } = await changeEmailTrigger(newEmail);
    if (data) {
      setIsTriggered(true);
      setToastEffect('You should get a code in your email if your account exists.');
    } else {
      setToastEffect('Something went wrong, please try again.', toastTypes.error);
    }
    setIsTriggering(false);
  }

  function renderTriggerForm() {
    if (isTriggered) {
      return null;
    }

    return (
      <>
        <InputField type="email" label="New email" value={newEmail} onChange={setNewEmail} />

        <FormButton
          onClick={handleTrigger}
          disabled={!newEmail.trim() || isTriggering}
          isLoading={isTriggering}
        >
          Change email
        </FormButton>
      </>
    );
  }

  function renderSaveForm() {
    if (!isTriggered) {
      return null;
    }

    return (
      <>
        <InputField
          type="email"
          label="New email"
          value={newEmail}
          onChange={setNewEmail}
          disabled
        />

        <InputField label="Code in your email" placeholder="Code" value={code} onChange={setCode} />

        <FormButton
          onClick={async () => {
            await changeEmailEffect(newEmail, code, () => {
              setIsTriggered(false);
              setCode('');
              setNewEmail('');
            });
          }}
          disabled={
            !code.trim() || !newEmail.trim() || newEmail.trim() === user?.email || isChanging
          }
        >
          Save
        </FormButton>

        <Flex>
          <Button variant="ghost" onClick={handleTrigger}>
            Resend code
          </Button>
        </Flex>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Change email" isLoading={isChanging} hasBack />

      <ItemsWrapper>
        <Text>Current email: {user?.email}</Text>

        {renderTriggerForm()}

        {renderSaveForm()}
      </ItemsWrapper>
    </>
  );
});
