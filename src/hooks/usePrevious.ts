import { useRef, useEffect } from 'react';

/**
 * Custom hook for getting the previous value
 * @param value - The current value
 * @returns The previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

export default usePrevious;
