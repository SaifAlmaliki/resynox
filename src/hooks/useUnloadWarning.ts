import { useEffect } from "react";
/**
 * A custom React hook that warns the user before leaving the page (e.g.,
 * navigating away or closing the tab/window) if a certain condition is met.
 *
 * @param condition If true, the user will be prompted when attempting to unload the page.
 *                  If false, no prompt is shown.
 */

export default function useUnloadWarning(condition = true) {
  useEffect(() => {
    // If condition is false, do not attach the event listener
    if (!condition) {
      return;
    }

    // Calling event.preventDefault() (or setting returnValue) will trigger a browser warning.
    const listener = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    // Add the beforeunload event listener to the window
    window.addEventListener("beforeunload", listener);

    // Cleanup: remove the event listener when the component unmounts or condition changes
    return () => window.removeEventListener("beforeunload", listener);
  }, [condition]);
}
