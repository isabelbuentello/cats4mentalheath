import FeedingSlot from './FeedingSlot.jsx';

function DayCard({ day, dayName, slots, onSlotClick }) {
  // Separate available and taken slots
  const availableSlots = slots.filter(slot => !slot.volunteer);
  const takenSlots = slots.filter(slot => slot.volunteer);

  return (
    <div className="bg-white/30 rounded-xl p-5 pt-12 min-h-[450px] font-sans">
      <h3 className="text-2xl font-bold mb-6 capitalize text-center">
        {dayName}
        <span className="text-base block text-gray-700 mt-2 font-normal">
          {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </h3>
      
      <div className="">
        {/* Available slots first */}
        {availableSlots.map((slot) => (
          <FeedingSlot
            key={slot.id}
            slot={slot}
            onClick={() => onSlotClick(day, slot)}
            isAvailable={true}
          />
        ))}
        
        {/* Taken slots at the bottom, grayed out */}
        {takenSlots.map((slot) => (
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