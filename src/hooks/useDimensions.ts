import React, { useEffect, useState } from "react";

// Custom hook to calculate the dimensions (width and height) of a given DOM element
export default function useDimensions(containerRef: React.RefObject<HTMLElement>) {
  // State to store the dimensions of the element
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Reference to the current DOM element
    const currentRef = containerRef.current;

    // Helper function to get the element's current dimensions
    function getDimensions() {
      return {
        width: currentRef?.offsetWidth || 0,    // Element's width (default to 0 if undefined)
        height: currentRef?.offsetHeight || 0,  // Element's height (default to 0 if undefined)
      };
    }

    // Create a ResizeObserver to watch for changes in the element's size
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]; // Take the first observed entry
      if (entry) {
        setDimensions(getDimensions()); // Update dimensions state when size changes
      }
    });

    // Start observing the element for size changes if it exists
    if (currentRef) {
      resizeObserver.observe(currentRef); // Attach observer to the DOM element
      setDimensions(getDimensions()); // Initialize dimensions state
    }

    // Cleanup function to disconnect the observer when the component unmounts
    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef); // Stop observing the element
      }
      resizeObserver.disconnect(); // Disconnect the observer to prevent memory leaks
    };
  }, [containerRef]); // Re-run effect if the containerRef changes

  // Return the current dimensions
  return dimensions;
}