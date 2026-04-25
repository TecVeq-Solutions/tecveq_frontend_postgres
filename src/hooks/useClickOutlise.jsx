import { useEffect } from "react";

function useClickOutside(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
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
