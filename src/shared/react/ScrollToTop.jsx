import { IconButton } from '@radix-ui/themes';
import { RiArrowUpSLine } from '@remixicon/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';

export const ScrollToTop = fastMemo(() => {
  const [show, setShow] = useState(false);
  const ref = useRef();
  const pageWrapperRef = useRef();

  const handleScrollToTop = useCallback(() => {
    if (!pageWrapperRef.current) {
      return;
    }

    pageWrapperRef.current.scrollTop = 0;
  }, []);

  useEffect(() => {
    pageWrapperRef.current = getPageWrapper(ref.current);
    if (!pageWrapperRef.current) {
      return;
    }

    const handleToggle = () => {
      setShow(pageWrapperRef.current.scrollTop > 1500);
    };
    pageWrapperRef.current.addEventListener('scroll', handleToggle);

    return () => {
      pageWrapperRef.current.removeEventListener('scroll', handleToggle);
    };
  }, []);

  return (
    <div style={{ display: show ? 'block' : 'none' }} ref={ref}>
      <IconButton onClick={handleScrollToTop} mr="2" variant="ghost">
        <RiArrowUpSLine />
      </IconButton>
    </div>
  );
});

function getPageWrapper(element) {
  let wrapper = element;
  while (wrapper && wrapper.tagName !== 'BODY' && !wrapper.classList.contains('page-content')) {
    wrapper = wrapper.parentElement;
  }

  return wrapper?.classList?.contains('page-content') ? wrapper : null;
}
