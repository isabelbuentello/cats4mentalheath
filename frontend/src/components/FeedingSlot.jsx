import React from 'react';
import darkBrownCat from '../assets/darkbrowncat.png';

function FeedingSlot({ slot, onClick, isAvailable }) {
  return (
    <div 
      onClick={onClick}
      style={{ marginBottom: '32px', padding: '8px' }} 
      className={`rounded-lg cursor-pointer transition-colors font-sans text-center ${
        !isAvailable
          ? 'bg-gray-300 opacity-60' 
          : slot.isPink 
            ? 'bg-pink-100 hover:bg-pink-200' 
            : slot.isPM
              ? 'bg-[#e4e9f5] hover:bg-[#b5c7f0]'  // PM slots - pastel blue
              : 'bg-[#fcebf6] hover:bg-[#f7cde9]'  // AM slots - pastel pink
      }`}
    >
      <p className={`text-base font-bold mb-3 ${
        !isAvailable 
          ? 'text-gray-600' 
          : slot.isPink 
            ? 'text-pink-600' 
            : slot.isPM
              ? 'text-blue-300'  // PM text color
              : 'text-pink-300'  // AM text color
      }`}>
        {slot.time}
      </p>
      {slot.volunteer && (
        <div className="flex items-center justify-center gap-2 mt-2">
          {/* User Avatar */}
          <img 
            src={slot.photoURL || darkBrownCat} 
            alt={slot.volunteer}
            className="w-6 h-6 rounded-full object-cover"
          />
          {/* Display Name */}
          <span className="text-sm font-semibold">{slot.volunteer}</span>
        </div>
      )}
    </div>
  );
}

export default FeedingSlot;