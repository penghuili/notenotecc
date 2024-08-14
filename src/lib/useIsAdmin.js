import { useMemo } from 'react';
import { useCat } from 'usecat';

import { userCat } from '../shared/react/store/sharedCats';

export function useIsAdmin() {
  const userId = useCat(userCat, account => account?.id);
  return useMemo(
    () => [import.meta.env.VITE_USER1, import.meta.env.VITE_USER2].includes(userId),
    [userId]
  );
}
