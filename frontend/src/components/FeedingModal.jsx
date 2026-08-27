function FeedingModal({ isOpen, onClose, selectedDay, selectedSlot, onSignUp, onCancel, currentUser }) {
  if (!isOpen) return null;

  const isUserSignedUp = selectedSlot?.email === currentUser?.email;

  return (
    <div
      className="c4-scope fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
      style={{ background: 'rgb(92 70 120 / 0.55)' }}
      onClick={onClose}
    >
      <div
        className="c4-panel font-hand relative flex w-full max-w-sm flex-col items-center rounded-[18px] py-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Positioned in corner */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-accent absolute top-2 right-2 text-2xl"
          style={{ padding: '0 8px', border: 'none', background: 'none' }}
        >
          ×
        </button>

        {/* Content Container with padding */}
        <div className="w-full px-8">

        <div className="mb-5">
          <h2 className="font-pix text-accent m-0 mb-1 text-2xl">
            {selectedSlot?.time}
          </h2>
          <p className="text-ink/70 m-0 text-sm tracking-wide">
            {selectedDay?.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Info Section */}
        <div className="mb-6 flex w-full flex-col gap-2.5">
          <div className="border-line bg-soft rounded-[12px] border-[1.5px] p-3.5">
            <p className="text-ink/70 m-0 mb-1 text-xs">Location</p>
            <p className="text-ink m-0 font-semibold">{selectedSlot?.location}</p>
          </div>

          {selectedSlot?.volunteer ? (
            <div
              className="border-line rounded-[12px] border-[1.5px] p-3.5"
              style={{ background: 'var(--color-chip-3)' }}
            >
              <p className="text-ink/70 m-0 mb-1 text-xs font-bold">Currently Signed Up</p>
              <p className="text-ink m-0 text-lg font-bold">{selectedSlot.volunteer}</p>
            </div>
          ) : (
            <div
              className="border-line rounded-[12px] border-[1.5px] p-3.5"
              style={{ background: 'var(--color-chip-4)' }}
            >
              <p className="text-ink m-0 font-bold">Slot is available!</p>
            </div>
          )}
        </div>

        {/* User Status/Alerts */}
        {!currentUser && (
          <div className="border-line bg-soft mb-5 w-full rounded-[10px] border border-dashed p-3">
            <p className="text-ink/80 m-0 text-xs italic">Please log in to sign up for slots</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-2.5">
          {currentUser && !selectedSlot?.volunteer && (
            <button
              onClick={() => onSignUp(selectedDay, selectedSlot)}
              className="c4-btn w-full"
              style={{ background: 'var(--color-accent)', color: 'var(--color-panel)' }}
            >
              Sign Up for This Slot
            </button>
          )}

          {currentUser && isUserSignedUp && (
            <button
              onClick={() => onCancel(selectedDay, selectedSlot)}
              className="c4-btn w-full"
              style={{ background: 'var(--color-chip-5)' }}
            >
              Cancel My Sign-Up
            </button>
          )}

          <button
            onClick={onClose}
            className="text-ink/60 text-sm"
            style={{ padding: '8px 0', border: 'none', background: 'none' }}
          >
            Go Back
          </button>
        </div>
        </div> {/* Close content container */}
      </div>
    </div>
  );
}

export default FeedingModal;