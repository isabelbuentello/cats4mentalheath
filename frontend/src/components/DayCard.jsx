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
    <div className="bg-white rounded-xl min-h-[450px] font-sans" style={{ padding: '28px 18px 2px 18px' }}>
      <h3 className="text-2xl font-bold capitalize text-center" style={{ marginBottom: '32px' }}>
        {dayName}
        <span className="text-base block text-gray-700 mt-2 font-normal">
          {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </h3>
      
      <div className="">

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