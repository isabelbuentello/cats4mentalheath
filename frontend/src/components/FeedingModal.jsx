function FeedingModal({ isOpen, onClose, selectedDay, selectedSlot, onSignUp, onCancel, currentUser }) {
  if (!isOpen) return null;

  const isUserSignedUp = selectedSlot?.email === currentUser?.email;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl text-center flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="w-full flex justify-end -mb-4">
          <button 
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {selectedSlot?.time}
          </h2>
          <p className="text-[#a084a0] font-medium uppercase tracking-wide text-sm">
            {selectedDay?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Info Section */}
        <div className="w-full space-y-3 mb-8">
          <div className="bg-[#f8f0f8] py-3 px-4 rounded-xl border border-[#dfbfdf]/30">
            <p className="text-sm text-gray-500 mb-1">Location</p>
            <p className="text-gray-800 font-semibold">{selectedSlot?.location}</p>
          </div>
          
          {selectedSlot?.volunteer ? (
            <div className="bg-[#cadaed]/30 py-4 px-4 rounded-xl border border-[#cadaed]">
              <p className="text-xs text-[#6a8da8] uppercase font-bold tracking-tighter mb-1">Currently Signed Up</p>
              <p className="text-lg font-bold text-[#5a7d98]">{selectedSlot.volunteer}</p>
            </div>
          ) : (
            <div className="bg-[#d4edca]/40 py-4 px-4">
              <p className="text-[#6b8e5b] font-bold">Slot is available!</p>
            </div>
          )}
        </div>
        
        {/* User Status/Alerts */}
        {!currentUser && (
          <div className="mb-6 px-4 py-2 bg-pink-50 rounded-lg">
            <p className="text-xs text-pink-600 font-medium italic">Please log in to sign up for slots</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="w-full space-y-3">
          {currentUser && !selectedSlot?.volunteer && (
            <button
              onClick={() => onSignUp(selectedDay, selectedSlot)}
              className="w-full bg-[#d1abc3] hover:bg-[#ffb3c1] text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              Sign Up for This Slot
            </button>
          )}

          {currentUser && isUserSignedUp && (
            <button
              onClick={() => onCancel(selectedDay, selectedSlot)}
              className="w-full bg-[#ede0ca] hover:bg-[#f3ead8] text-[#8a7a5f] font-bold py-4 rounded-xl transition-all active:scale-[0.98]"
            >
              Cancel My Sign-Up
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full text-gray-400 hover:text-gray-600 font-semibold py-2 transition-colors text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedingModal;