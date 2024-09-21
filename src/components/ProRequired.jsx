import React, { useCallback, useMemo, useState } from 'react';
import { navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { useCat } from 'usecat';

import { isTesting } from '../shared/browser/isTesting.js';
import {
  isLoggedInCat,
  useExpiresAt,
  useFreeTrialsUntil,
} from '../shared/browser/store/sharedCats';
import { formatDate } from '../shared/js/date';
import { Confirm } from '../shared/radix/Confirm.jsx';

export const ProRequired = fastMemo(({ children }) => {
  const expiresAt = useExpiresAt();
  const freeTrialUntil = useFreeTrialsUntil();
  const isLoggedIn = useCat(isLoggedInCat);
  const [showConfirm, setShowConfirm] = useState(false);

  const isPro = useMemo(() => {
    const date = expiresAt || freeTrialUntil;
    return !!date && date > formatDate(new Date());
  }, [expiresAt, freeTrialUntil]);

  const handleShowConfirm = useCallback(() => {
    setShowConfirm(true);
  }, []);
  const handleGoToUpgrade = useCallback(() => {
    navigateTo('/upgrade');
  }, []);

  return (
    <>
      <Wrapper>
        {children}
        {!isTesting() && !isPro && isLoggedIn && <Overlay onClick={handleShowConfirm} />}
      </Wrapper>

      <Confirm
        open={showConfirm}
        onOpenChange={setShowConfirm}
        message="This is a Pro feature, please pay a tiny fee to get full access, or try 14 days for free."
        onConfirm={handleGoToUpgrade}
        confirmButtonLabel="Check Pro details"
      />
    </>
  );
});

const Wrapper = styled.div`
  display: inline-block;
  position: relative;
`;
const Overlay = styled.div`
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 1;

  cursor: pointer;
`;
