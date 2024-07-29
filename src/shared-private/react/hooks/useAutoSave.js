import { useEffect, useState } from 'react';

export function useAutoSave(onSave, delay = 1000) {
  const [content, setContent] = useState('');
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  const handleChange = newContent => {
    setContent(newContent);

    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      onSave(newContent);
    }, delay);

    setTimer(newTimer);
  };

  return [content, handleChange];
}
