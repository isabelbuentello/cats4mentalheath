import { Link } from 'react-router-dom';
import crest from '../assets/crest.jpeg';

/**
 * Club crest, flanking the title inside the page header banner, linking home
 * (the about page).
 *
 * Sits in the flex row rather than floating over the panel, so it can never
 * collide with a title that wraps onto two lines on narrow screens.
 *
 * The source is a square JPEG on an opaque purple field, but its cream circle
 * runs nearly edge to edge, so `rounded-full` crops the purple corners away.
 *
 * @param {boolean} decorative - the mirrored copy on the right. Still clickable,
 *   but hidden from assistive tech and skipped in the tab order so the same
 *   destination isn't announced twice.
 */
function CrestLink({ decorative = false }) {
  return (
    <Link
      to="/"
      aria-label={decorative ? undefined : 'Cats for Mental Health — home'}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      className="shrink-0 transition-transform hover:-translate-y-0.5"
    >
      <img
        src={crest}
        alt=""
        className="border-line bg-panel h-12 w-12 rounded-full border-[3px] object-cover sm:h-16 sm:w-16"
      />
    </Link>
  );
}

export default CrestLink;
