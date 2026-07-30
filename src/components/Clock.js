import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, memo } from 'react';
function ClockContent() {
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    return _jsx("span", { children: time });
}
export const Clock = memo(ClockContent);
