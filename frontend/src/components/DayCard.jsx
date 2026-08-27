import FeedingSlot from './FeedingSlot.jsx';

function DayCard({ day, dayName, slots, onSlotClick }) {
  // Separate available and taken slots
  const availableSlots = slots.filter(slot => !slot.volunteer);
  const takenSlots = slots.filter(slot => slot.volunteer);
  
  // Further separate by AM/PM
  const availableAM = availableSlots.filter(slot => !slot.isPM);
  const availablePM = availableSlots.filter(slot => slot.isPM);
  const takenAM = takenSlots.filter(slot => !slot.isPM);
  const takenPM = takenSlots.filter(slot => slot.isPM);

  return (
    <div className="c4-panel font-hand min-h-[420px] rounded-[14px] p-3">
      <h3 className="font-pix text-accent m-0 mb-4 text-center text-lg capitalize">
        {dayName}
        <span className="text-ink/70 font-hand mt-1 block text-sm font-normal">
          {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </h3>

      <div className="flex flex-col gap-2.5">

        {/* Available AM slots */}
        {availableAM.map((slot) => (
          <FeedingSlot
            key={slot.id}
            slot={slot}
            onClick={() => onSlotClick(day, slot)}
            isAvailable={true}
          />
        ))}

        {/* Available PM slots first */}
        {availablePM.map((slot) => (
          <FeedingSlot
            key={slot.id}
            slot={slot}
            onClick={() => onSlotClick(day, slot)}
            isAvailable={true}
          />
        ))}
        
        {/* Taken AM slots */}
        {takenAM.map((slot) => (
          <FeedingSlot
            key={slot.id}
            slot={slot}
            onClick={() => onSlotClick(day, slot)}
            isAvailable={false}
          />
        ))}

        {/* Taken PM slots */}
        {takenPM.map((slot) => (
          <FeedingSlot
            key={slot.id}
            slot={slot}
            onClick={() => onSlotClick(day, slot)}
            isAvailable={false}
          />
        ))}
        
      </div>
    </div>
  );
}

export default DayCard;