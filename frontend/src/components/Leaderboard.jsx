import React, { useState, useEffect, useMemo } from 'react';
import { collectionGroup, getDocs, collection } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';
import { getSemester, getYear, isDayInRange } from '../utils/semester.js';
import darkBrownCat from '../assets/darkbrowncat.png';
import blackCat from '../assets/blackcat.png';
import calicoCat from '../assets/calicocat.png';
import creamCat from '../assets/creamcat.png';
import grayCat from '../assets/graycat.png';
import lightBrownCat from '../assets/lightbrowncat.png';
import orangeCat from '../assets/orangecat.png';
import tuxedoCat from '../assets/tuxedocat.png';
import whiteCat from '../assets/whitecat.png';

const normEmail = (e) => (e || '').trim().toLowerCase();

/** Toggle options, with the footer stat labels each one implies. */
const VIEWS = [
  {
    id: 'semester',
    label: 'This Semester',
    volunteers: 'Volunteers This Semester',
    feedings: 'Feedings This Semester'
  },
  {
    id: 'year',
    label: 'This Year',
    volunteers: 'Volunteers This Year',
    feedings: 'Feedings This Year'
  },
  { id: 'all', label: 'All Time', volunteers: 'Total Volunteers', feedings: 'Total Feedings' }
];

function Leaderboard() {
  const [loading, setLoading] = useState(true);
  // 'semester' = the term we're in, 'year' = this calendar year, 'all' = ever.
  const [view, setView] = useState('semester');
  // Raw day docs are kept in state so switching views re-counts locally
  // instead of re-reading the whole collection group from Firestore.
  const [days, setDays] = useState([]);
  const [validEmails, setValidEmails] = useState(() => new Set());

  // Recomputed only if the component outlives a term boundary — cheap, and it
  // keeps the label honest if the page is left open across Dec 31.
  const semester = useMemo(() => getSemester(), []);
  const year = useMemo(() => getYear(), []);

  // The date window each view counts over. `all` has no window.
  const range = view === 'semester' ? semester : view === 'year' ? year : null;

  // Helper to convert stored path to actual image
  const getCatImageFromPath = (photoURL) => {
    if (!photoURL) return darkBrownCat;
    
    const catMap = {
      'darkbrowncat': darkBrownCat,
      'darkbrown': darkBrownCat,
      'blackcat': blackCat,
      'black': blackCat,
      'calicocat': calicoCat,
      'calico': calicoCat,
      'creamcat': creamCat,
      'cream': creamCat,
      'graycat': grayCat,
      'gray': grayCat,
      'lightbrowncat': lightBrownCat,
      'lightbrown': lightBrownCat,
      'orangecat': orangeCat,
      'orange': orangeCat,
      'tuxedocat': tuxedoCat,
      'tuxedo': tuxedoCat,
      'whitecat': whiteCat,
      'white': whiteCat
    };

    const match = photoURL.match(/\/assets\/(\w+)/);
    if (match && match[1]) {
      const catName = match[1].toLowerCase();
      return catMap[catName] || darkBrownCat;
    }
    
    return darkBrownCat;
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Get all days from all weeks. The doc id is the `YYYY-MM-DD` day id,
        // which is what the semester filter keys off.
        const daysQuery = collectionGroup(db, 'days');
        const daysSnapshot = await getDocs(daysQuery);

        const dayRows = daysSnapshot.docs.map((dayDoc) => ({
          dayId: dayDoc.id,
          slots: dayDoc.data().slots || {}
        }));

        // Get all valid users from the users collection
        const usersSnapshot = await getDocs(collection(db, 'users'));
        // Normalised so a case/whitespace difference between the users doc and
        // the slot can't silently drop a volunteer from the board.
        const emails = new Set(
          usersSnapshot.docs.map(doc => normEmail(doc.data().email)).filter(Boolean)
        );

        setDays(dayRows);
        setValidEmails(emails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Counting lives here rather than in the fetch so flipping between
  // semester and all-time is instant and costs no extra reads.
  const leaderboardData = useMemo(() => {
    const userFeedings = {};

    days.forEach(({ dayId, slots }) => {
      if (range && !isDayInRange(dayId, range)) return;

      Object.values(slots).forEach(slot => {
        if (slot && slot.email) {
          if (!userFeedings[slot.email]) {
            userFeedings[slot.email] = {
              email: slot.email,
              name: slot.volunteer || slot.email.split('@')[0],
              photoURL: slot.photoURL || "/assets/darkbrowncat.png",
              count: 0
            };
          }
          userFeedings[slot.email].count++;
        }
      });
    });

    // Filter to only include users that still exist in the users collection
    return Object.values(userFeedings)
      .filter(user => validEmails.has(normEmail(user.email)))
      .sort((a, b) => b.count - a.count)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
  }, [days, validEmails, range]);

  // Derived rather than stored, so it tracks the active view.
  const currentUserRank = useMemo(() => {
    const me = normEmail(auth.currentUser?.email);
    if (!me) return null;
    return leaderboardData.find(u => normEmail(u.email) === me)?.rank ?? null;
  }, [leaderboardData]);

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  // Get rank message and style
  const getRankInfo = () => {
    if (!currentUserRank || leaderboardData.length === 0) return null;

    let message, emoji, bgColor, textColor, borderColor;

    if (currentUserRank === 1) {
      message = `You are the #1 most active feeder! Thanks for all your help! 🎉`;
      emoji = '🥇';
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-700';
      borderColor = 'border-yellow-300';
    } else if (currentUserRank === 2) {
      message = `You are the #2 most active feeder! Keep up the great work!`;
      emoji = '🥈';
      bgColor = 'bg-soft';
      textColor = 'text-ink';
      borderColor = 'border-line';
    } else if (currentUserRank === 3) {
      message = `You are the #3 most active feeder! Amazing job!`;
      emoji = '🥉';
      bgColor = 'bg-orange-50';
      textColor = 'text-orange-700';
      borderColor = 'border-orange-300';
    } else if (currentUserRank <= 5) {
      message = `You're #${currentUserRank} out of ${leaderboardData.length} volunteers! You're in the top 5!`;
      emoji = '⭐';
      bgColor = 'bg-soft';
      textColor = 'text-accent';
      borderColor = 'border-line';
    } else if (currentUserRank <= 10) {
      message = `You're #${currentUserRank} out of ${leaderboardData.length} volunteers! You're in the top 10!`;
      emoji = '🌟';
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-300';
    } else {
      message = `You're #${currentUserRank} out of ${leaderboardData.length} volunteers. Keep feeding!`;
      emoji = '💪';
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      borderColor = 'border-green-300';
    }

    return { message, emoji, bgColor, textColor, borderColor };
  };

  const currentUser = auth.currentUser;
  const rankInfo = getRankInfo();

  if (loading) {
    return (
      <div className="c4-panel font-hand rounded-[18px] p-4">
        <p className="text-ink/70 text-center">Loading leaderboard...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="c4-panel font-hand rounded-[18px] p-4">
        <p className="text-ink/70 text-center">Please sign in to view the leaderboard</p>
      </div>
    );
  }

  const isEmpty = leaderboardData.length === 0;
  const activeView = VIEWS.find((v) => v.id === view) || VIEWS[0];

  return (
    <div className="c4-panel font-hand rounded-[18px] p-4 sm:p-5">
      {/* Rank Message Banner */}
      {rankInfo && (
        <div className={`mb-6 p-4 ${rankInfo.bgColor} border-2 ${rankInfo.borderColor} rounded-lg ${rankInfo.textColor}`}>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">{rankInfo.emoji}</span>
            <p className="font-bold text-center">{rankInfo.message}</p>
          </div>
        </div>
      )}

      <h2 className="font-pix text-accent m-0 mb-2 text-center text-xl sm:text-2xl">♡ volunteer leaderboard</h2>
      <p className="text-sm text-ink/70 mb-3 text-center">
        {range ? `Top feeders — ${range.label}` : 'Top feeders of all time'}
      </p>

      {/* Semester / year / all-time toggle.
          The selected option is a soft white pill on a tinted track rather than
          a solid block — it reads as "lifted" instead of stamped on, and keeps
          the label at full ink contrast on white. */}
      <div className="c4-seg-track mx-auto mb-5">
        {VIEWS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setView(opt.id)}
            aria-pressed={view === opt.id}
            className="c4-seg"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isEmpty && (
        <p className="text-ink/70 py-4 text-center">
          {range
            ? `No feedings logged yet for ${range.label}.`
            : 'No feeding data yet. Be the first to sign up!'}
        </p>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {leaderboardData.map((user) => {
          const isCurrentUser = user.email === currentUser.email;
          const medal = getMedalEmoji(user.rank);

          return (
            <div
              key={user.email}
              style={{ paddingRight: '18px' }}
              className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
                isCurrentUser
                  ? 'bg-purple-100 border-2 border-purple-400'
                  : 'bg-soft hover:bg-soft'
              }`}
            >
              {/* Left: Rank, Avatar, Name */}
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className="w-8 text-center">
                  {medal ? (
                    <span className="text-2xl">{medal}</span>
                  ) : (
                    <span className="text-lg font-bold text-ink/70">
                      #{user.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white border-2 border-line flex items-center justify-center overflow-hidden">
                  <img 
                    src={getCatImageFromPath(user.photoURL)} 
                    alt={user.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Name */}
                <div>
                  <p className={`font-semibold ${isCurrentUser ? 'text-accent' : 'text-ink'}`}>
                    {user.name}
                    {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                  </p>
                </div>
              </div>

              {/* Right: Feeding Count */}
              <div className="text-right">
                <p className={`text-xl font-bold ${isCurrentUser ? 'text-accent' : 'text-ink'}`}>
                  {user.count}
                </p>
                <p className="text-xs text-ink/60">
                  feeding{user.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Stats — scoped to whichever view is active */}
      {!isEmpty && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-accent">
                {leaderboardData.length}
              </p>
              <p className="text-sm text-ink/70">{activeView.volunteers}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                {leaderboardData.reduce((sum, user) => sum + user.count, 0)}
              </p>
              <p className="text-sm text-ink/70">{activeView.feedings}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;