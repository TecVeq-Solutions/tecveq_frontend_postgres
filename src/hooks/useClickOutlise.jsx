import { useEffect } from "react";

function useClickOutside(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      // If the target is no longer in the document, it was likely an internal element
      // (like a tab or button) that was removed during a state update.
      if (!document.body.contains(event.target)) return;

      if (Array.isArray(ref)) {
        if (ref.every((r) => r.current && !r.current.contains(event.target))) {
          callback();
        }
      } else {
        if (ref.current && !ref.current.contains(event.target)) {
          callback();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

export default useClickOutside;
