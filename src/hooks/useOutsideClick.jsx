import { useEffect } from 'react';

export const useOutsideClick = (ref, callback, action = 'click') => {
    const handleClick = e => {
        if (ref.current && !ref.current.contains(e.target)) {
            callback();
        }
    };

    useEffect(() => {
        document.addEventListener(action, handleClick);
        return () => {
            document.removeEventListener(action, handleClick);
        };
    });
};
