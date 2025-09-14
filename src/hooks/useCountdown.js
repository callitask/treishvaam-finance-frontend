import { useState, useEffect, useMemo } from 'react';

const useCountdown = (targetTime) => {
    const countDownDate = useMemo(() => new Date(targetTime).getTime(), [targetTime]);

    const [countDown, setCountDown] = useState(
        countDownDate - new Date().getTime()
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setCountDown(countDownDate - new Date().getTime());
        }, 1000);

        return () => clearInterval(interval);
    }, [countDownDate]);

    return getReturnValues(countDown);
};

const getReturnValues = (countDown) => {
    if (countDown < 0) {
        return { hours: 0, minutes: 0, seconds: 0, isFinished: true };
    }
    const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, isFinished: false };
};

export { useCountdown };
