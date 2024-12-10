import { useEffect, useState } from "react";
/**
 * A custom React hook that debounces a given value.
 *
 * Debouncing means delaying updates to the value until a certain amount of time
 * has passed without further changes. This is useful for performance optimization,
 * for example, when handling search input or API calls triggered by user typing.
 */
export default function useDebounce<T>(value: T, delay: number = 250) {
  // Internal state to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after `delay` ms
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // If `value` or `delay` changes, clear the previous timeout to prevent premature updates
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
