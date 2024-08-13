import { IconButton } from '@radix-ui/themes';
import { RiArrowUpSLine } from '@remixicon/react';
import React, { useEffect, useState } from 'react';

import { scrollToTop } from '../lib/scrollToTop';

export const ScrollToTop = React.memo(() => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setShow(window.scrollY > 1000);
    };
    window.addEventListener('scroll', handleToggle);

    return () => {
      window.removeEventListener('scroll', handleToggle);
    };
  }, []);

  return (
    show && (
      <IconButton onClick={scrollToTop} mr="2" variant="ghost">
        <RiArrowUpSLine />
      </IconButton>
    )
  );
});
