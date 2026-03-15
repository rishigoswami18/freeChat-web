import { useState, useEffect } from "react";

/**
 * Standard utility hook to prevent high-frequency firing on rapidly changing values.
 * Commonly used for HTTP input request blocking.
 */
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up the timeout to update the value
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cancel the timeout if value changes (also on component unmount)
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
