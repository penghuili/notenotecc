import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useCat } from 'usecat';

import { formatDate } from '../shared/js/date';
import { Confirm } from '../shared/react/Confirm.jsx';
import { navigate } from '../shared/react/my-router.jsx';
import { isLoggedInCat, useExpiresAt, useFreeTrialsUntil } from '../shared/react/store/sharedCats';

export const ProRequired = React.memo(({ children }) => {
  const expiresAt = useExpiresAt();
  const freeTrialUntil = useFreeTrialsUntil();
  const isLoggedIn = useCat(isLoggedInCat);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isPro = useMemo(() => {
    const date = expiresAt || freeTrialUntil;
    return !!date && date > formatDate(new Date());
  }, [expiresAt, freeTrialUntil]);

  const handleShowConfirm = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);
  const handleGoToUpgrade = useCallback(() => {
    navigate('/upgrade');
  }, []);

  return (
    <>
      <Wrapper>
        {children}
        {!isPro && isLoggedIn && <Overlay onClick={handleShowConfirm} />}
      </Wrapper>

      <Confirm
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        message="This is a Pro feature, please pay a tiny fee to get full access, or try 30 days for free."
        onConfirm={handleGoToUpgrade}
        confirmButtonLabel="Check Pro details"
      />
    </>
  );
});

const Wrapper = styled.span`
  display: inline-block;
  position: relative;
`;
const Overlay = styled.span`
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
