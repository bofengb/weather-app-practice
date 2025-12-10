import { useState, useEffect } from 'react';

// Debounce wait for user to stop typing before triggering action
export default function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup runs before next effect
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
