import darkBrownCat from '../assets/darkbrowncat.png';
import blackCat from '../assets/blackcat.png';
import calicoCat from '../assets/calicocat.png';
import creamCat from '../assets/creamcat.png';
import grayCat from '../assets/graycat.png';
import lightBrownCat from '../assets/lightbrowncat.png';
import orangeCat from '../assets/orangecat.png';
import tuxedoCat from '../assets/tuxedocat.png';
import whiteCat from '../assets/whitecat.png';

function FeedingSlot({ slot, onClick, isAvailable }) {
  // Helper to convert stored path to actual image
  const getCatImageFromPath = (photoURL) => {
    if (!photoURL) return darkBrownCat;
    
    const catMap = {
      'darkbrowncat': darkBrownCat,
      'darkbrown': darkBrownCat,
      'blackcat': blackCat,
      'black': blackCat,
      'calicocat': calicoCat,
      'calico': calicoCat,
      'creamcat': creamCat,
      'cream': creamCat,
      'graycat': grayCat,
      'gray': grayCat,
      'lightbrowncat': lightBrownCat,
      'lightbrown': lightBrownCat,
      'orangecat': orangeCat,
      'orange': orangeCat,
      'tuxedocat': tuxedoCat,
      'tuxedo': tuxedoCat,
      'whitecat': whiteCat,
      'white': whiteCat
    };

    const match = photoURL.match(/\/assets\/(\w+)/);
    if (match && match[1]) {
      const catName = match[1].toLowerCase();
      return catMap[catName] || darkBrownCat;
    }
    
    return darkBrownCat;
  };
  
  return (
    <div
      onClick={onClick}
      className="font-hand cursor-pointer rounded-[10px] border-[1.5px] p-2 text-center transition-transform hover:-translate-y-0.5"
      style={{
        borderColor: 'var(--color-line)',
        opacity: isAvailable ? 1 : 0.65,
        background: !isAvailable
          ? 'var(--color-soft)'
          : slot.isPM
            ? 'var(--color-chip-3)' // PM slots - pastel blue
            : 'var(--color-chip-2)' // AM slots - pastel pink
      }}
    >
      <p className="text-ink m-0 text-sm font-bold">{slot.time}</p>
      {slot.volunteer && (
        <div className="mt-1.5 flex items-center justify-center gap-1.5">
          {/* User Avatar */}
          <img
            src={getCatImageFromPath(slot.photoURL)}
            alt={slot.volunteer}
            className="bg-panel h-6 w-6 shrink-0 rounded-full object-cover"
          />
          {/* Display Name */}
          <span className="text-ink min-w-0 truncate text-xs font-semibold">{slot.volunteer}</span>
        </div>
      )}
    </div>
  );
}

export default FeedingSlot;