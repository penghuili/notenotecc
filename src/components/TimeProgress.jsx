import { Progress } from '@radix-ui/themes';
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';

export const TimeProgress = React.memo(({ ref, totalTime }) => {
  const [progress, setProgress] = useState(0);

  const timerIdRef = useRef(null);
  const startTimestampRef = useRef(null);
  const elapsedTimeRef = useRef(0);

  useImperativeHandle(ref, () => ({
    start: handleStart,
    pause: handlePause,
    resume: handleResume,
    stop: handleStop,
  }));

  const handleUpdateProgress = useCallback(() => {
    clearTimer();

    timerIdRef.current = setInterval(() => {
      const timeChange = Date.now() - startTimestampRef.current;
      const newElapsedTime = elapsedTimeRef.current + timeChange;
      const newProgress = Math.min((newElapsedTime / totalTime) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearTimer();
      }
    }, 100);
  }, [totalTime]);

  const handleStart = useCallback(() => {
    startTimestampRef.current = Date.now();
    elapsedTimeRef.current = 0;
    handleUpdateProgress();
  }, [handleUpdateProgress]);

  const handlePause = useCallback(() => {
    clearTimer();
    elapsedTimeRef.current += Date.now() - startTimestampRef.current;
  }, []);

  const handleResume = useCallback(() => {
    startTimestampRef.current = Date.now();
    handleUpdateProgress();
  }, [handleUpdateProgress]);

  const handleStop = useCallback(() => {
    clearTimer();
    elapsedTimeRef.current = 0;
    setProgress(0);
  }, []);

  const clearTimer = () => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  if (!progress) {
    return null;
  }

  return <Progress size="1" value={progress} />;
});
