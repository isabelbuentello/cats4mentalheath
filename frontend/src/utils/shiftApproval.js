/**
 * When a feeding shift becomes eligible for admin approval.
 *
 * A shift unlocks once its own window has STARTED, on its own date:
 *
 *   AM shift on day D  ->  approvable from 6:00am on D
 *   PM shift on day D  ->  approvable from 12:00pm on D
 *
 * Admins can approve during or right after a shift — the guard exists purely to
 * stop a PM shift being approved while it's still morning (and to stop anything
 * dated in the future being approved at all). It deliberately does NOT wait for
 * the shift to be finished; a 6:01am approval of that day's AM shift is allowed.
 *
 * Before unlock the shift shows as "upcoming" and the verify/no-show buttons are
 * disabled.
 */

/** Hour on the shift's own date at which each window opens. */
export const AM_UNLOCK_HOUR = 6;
export const PM_UNLOCK_HOUR = 12;

/** Zone ids look like `am_law` / `pm_zone_d`; timeLabel ("PM Law") is a fallback. */
export function isPMShift(shift) {
  const slot = (shift?.timeSlot || '').toLowerCase();
  if (slot.startsWith('pm_')) return true;
  if (slot.startsWith('am_')) return false;
  return /^\s*pm\b/i.test(shift?.timeLabel || '');
}

/** The earliest moment this shift can be approved — when its window opens. */
export function shiftUnlocksAt(shift) {
  const unlock = new Date(shift.date);
  unlock.setHours(isPMShift(shift) ? PM_UNLOCK_HOUR : AM_UNLOCK_HOUR, 0, 0, 0);
  return unlock;
}

/**
 * 'verified' | 'no-show' | 'awaiting' | 'upcoming'
 * 'awaiting' = pending and the window has closed, so an admin can action it now.
 * 'upcoming' = pending but hasn't happened yet.
 */
export function getShiftState(shift, now = new Date()) {
  if (shift.status === 'verified') return 'verified';
  if (shift.status === 'no-show') return 'no-show';
  return shiftUnlocksAt(shift) > now ? 'upcoming' : 'awaiting';
}

export function isApprovable(shift, now = new Date()) {
  return getShiftState(shift, now) === 'awaiting';
}

/** Sort order: things needing action first. */
const GROUP = { awaiting: 0, upcoming: 1, verified: 2, 'no-show': 2 };

export function compareShifts(a, b, now = new Date()) {
  const sa = getShiftState(a, now);
  const sb = getShiftState(b, now);
  if (GROUP[sa] !== GROUP[sb]) return GROUP[sa] - GROUP[sb];
  // Awaiting: longest-waiting first, so the backlog drains from the top.
  if (sa === 'awaiting') return a.date - b.date;
  // Upcoming: soonest first.
  if (sa === 'upcoming') return a.date - b.date;
  // Already decided: most recent first.
  return b.date - a.date;
}

export const SHIFT_STATE_LABEL = {
  awaiting: 'awaiting approval',
  upcoming: 'upcoming',
  verified: 'verified',
  'no-show': 'no-show'
};

/** Badge colours, drawn from the palette + the existing semantic red. */
export const SHIFT_STATE_STYLE = {
  awaiting: { background: 'var(--color-chip-5)', color: 'var(--color-ink)', borderColor: 'var(--color-line)' },
  upcoming: { background: 'var(--color-soft)', color: 'var(--color-ink)', borderColor: 'var(--color-line)' },
  verified: { background: 'var(--color-chip-4)', color: 'var(--color-ink)', borderColor: 'var(--color-line)' },
  'no-show': { background: '#fbeeee', color: '#8f4b4b', borderColor: '#d99a9a' }
};
