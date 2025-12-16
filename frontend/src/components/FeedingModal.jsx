function FeedingModal({ isOpen, onClose, selectedDay, selectedSlot, onSignUp, onCancel, currentUser }) {
  if (!isOpen) return null;

  const isUserSignedUp = selectedSlot?.email === currentUser?.email;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">
            {selectedSlot?.time}
          </h2>
          <button 
            onClick={onClose}
            className="text-3xl hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <p className="text-gray-600 mb-2">
          {selectedDay?.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>

        <p className="text-sm text-gray-500 mb-4">
          Location: {selectedSlot?.location}
        </p>
        
        {selectedSlot?.volunteer ? (
          <div className="bg-green-100 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600">Signed up:</p>
            <p className="text-lg font-semibold">{selectedSlot.volunteer}</p>
          </div>
        ) : (
          <div className="bg-yellow-100 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600">This slot is available!</p>
          </div>
        )}
        
        {!currentUser && (
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-600">Please log in to sign up for slots!</p>
          </div>
        )}
        
        <div className="space-y-3">
          {currentUser && !selectedSlot?.volunteer && (
            <button
              onClick={() => onSignUp(selectedDay, selectedSlot)}
              className="w-full bg-[#9fc8a7] hover:bg-[#8db896] text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Sign Up for This Slot
            </button>
          )}

          {currentUser && isUserSignedUp && (
            <button
              onClick={() => onCancel(selectedDay, selectedSlot)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Cancel My Sign-Up
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedingModal;