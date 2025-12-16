function FeedingSlot({ slot, onClick, isAvailable }) {
  return (
    <div 
      onClick={onClick}
      style={{ marginBottom: '32px' }} 
      className={`rounded-lg p-4 mb-6 cursor-pointer transition-colors font-sans text-center ${
        !isAvailable
          ? 'bg-gray-300 opacity-60' 
          : slot.isPink 
            ? 'bg-pink-100 hover:bg-pink-200' 
            : slot.isPM
              ? 'bg-blue-100 hover:bg-blue-200'  // PM slots - blue
              : 'bg-green-100 hover:bg-green-200'  // AM slots - green
      }`}
    >
      <p className={`text-base font-bold mb-3 ${
        !isAvailable 
          ? 'text-gray-600' 
          : slot.isPink 
            ? 'text-pink-600' 
            : slot.isPM
              ? 'text-blue-700'  // PM text color
              : 'text-green-700'  // AM text color
      }`}>
        {slot.time}
      </p>
      {slot.volunteer ? (
        <p className="text-sm flex items-center justify-center gap-2 mt-2">
          🐱 <span className="font-semibold">{slot.volunteer}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-500 italic font-normal mt-2">Available</p>
      )}
    </div>
  );
}

export default FeedingSlot;