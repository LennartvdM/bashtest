import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';

/**
 * Returns a navigate function that wraps route changes in the
 * View Transition API so the browser crossfades between pages.
 *
 * Falls back to a plain navigate when the API isn't supported.
 */
export default function useViewTransition() {
  const navigate = useNavigate();

  return (to, opts) => {
    if (!document.startViewTransition) {
      navigate(to, opts);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        navigate(to, opts);
      });
    });
  };
}
