/**
 * Semester windows for the leaderboard.
 *
 * Three terms per calendar year:
 *   Spring  Jan 1 – May 31
 *   Summer  Jun 1 – Jul 31
 *   Fall    Aug 1 – Dec 31
 *
 * Every day of the year falls inside exactly one term, so nothing can go
 * missing from the semester board. To change the boundaries, edit TERMS — it's
 * the only place the months are written down.
 *
 * Comparisons are done on `YYYY-MM-DD` day ids (the ids of the docs under
 * `feeding-schedule/{week}/days`). Those sort chronologically as plain strings,
 * so we can filter without parsing dates and without any timezone risk.
 */

export const TERMS = [
  { id: 'spring', label: 'Spring', startMonth: 1, endMonth: 5 },
  { id: 'summer', label: 'Summer', startMonth: 6, endMonth: 7 },
  { id: 'fall', label: 'Fall', startMonth: 8, endMonth: 12 }
];

const pad = (n) => String(n).padStart(2, '0');

/** Last calendar day of `month` (1-indexed) in `year`. */
const lastDayOfMonth = (year, month) => new Date(year, month, 0).getDate();

/**
 * The semester containing `date`.
 * @returns {{key: string, label: string, startDayId: string, endDayId: string}}
 */
export function getSemester(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const term =
    TERMS.find((t) => month >= t.startMonth && month <= t.endMonth) ||
    TERMS[TERMS.length - 1];

  return {
    key: `${term.id}-${year}`,
    label: `${term.label} ${year}`,
    startDayId: `${year}-${pad(term.startMonth)}-01`,
    endDayId: `${year}-${pad(term.endMonth)}-${pad(lastDayOfMonth(year, term.endMonth))}`
  };
}

/**
 * The calendar year containing `date`, in the same shape as getSemester().
 *
 * The three terms above tile a calendar year exactly — Jan 1 through Dec 31
 * with no gaps and no overlap — so "this year" is precisely the union of this
 * year's Spring, Summer and Fall. The two views stay consistent by construction.
 *
 * @returns {{key: string, label: string, startDayId: string, endDayId: string}}
 */
export function getYear(date = new Date()) {
  const year = date.getFullYear();
  return {
    key: `year-${year}`,
    label: String(year),
    startDayId: `${year}-01-01`,
    endDayId: `${year}-12-31`
  };
}

/** Whether a `YYYY-MM-DD` day id falls inside the given {startDayId, endDayId}. */
export function isDayInRange(dayId, range) {
  if (!dayId || !range) return false;
  return dayId >= range.startDayId && dayId <= range.endDayId;
}
