import './style.css';

import React, { useCallback, useEffect, useState } from 'react';
import fastMemo from 'react-fast-memo';

export const Countdown = fastMemo(({ targetDate }) => {
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(targetDate) - +new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      return null;
    }
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const timeRemaining = calculateTimeLeft();
      if (timeRemaining) {
        setTimeLeft(timeRemaining);
      } else {
        clearInterval(timer);
        setTimeLeft(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, targetDate]);

  if (!timeLeft) {
    return null; // If the target date has passed, return null
  }

  return (
    <div className="countdown">
      <div className="countdown-item">
        <span className="countdown-number">{timeLeft.days}</span> Days
      </div>
      <div className="countdown-item">
        <span className="countdown-number">{timeLeft.hours}</span> Hours
      </div>
      <div className="countdown-item">
        <span className="countdown-number">{timeLeft.minutes}</span> Minutes
      </div>
      <div className="countdown-item">
        <span className="countdown-number">{timeLeft.seconds}</span> Seconds
      </div>
    </div>
  );
});
