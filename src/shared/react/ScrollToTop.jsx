import { IconButton } from '@radix-ui/themes';
import { RiArrowUpSLine } from '@remixicon/react';
import React, { useEffect, useState } from 'react';

export const ScrollToTop = React.memo(() => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setShow(window.scrollY > 1500);
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

export function scrollToTop() {
  window.scrollTo(0, 0);
}

export function useScrollToTop() {
  useEffect(() => {
    scrollToTop();
  }, []);
}
