import { useState, useEffect } from 'react';

// Debounce wait for user to stop typing before triggering action
export default function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup runs before next effect
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
