import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }

    // React Router doesn't scroll to #anchors itself. Wait a frame so the
    // target page has rendered, then scroll to the section.
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo(0, 0);
      }
    });

    return () => cancelAnimationFrame(frame);
    // `key` changes on every navigation, so clicking "Programs" again while
    // already on /#programs still scrolls back to the section.
  }, [pathname, hash, key]);

  return null;
}
