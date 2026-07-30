import { useState, useEffect, memo } from 'react';

function ClockContent() {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span>{time}</span>;
}

export const Clock = memo(ClockContent);
