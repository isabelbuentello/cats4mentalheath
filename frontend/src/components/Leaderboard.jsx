import React, { useState, useEffect } from 'react';
import { collectionGroup, getDocs, collection } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';
import darkBrownCat from '../assets/darkbrowncat.png';
import blackCat from '../assets/blackcat.png';
import calicoCat from '../assets/calicocat.png';
import creamCat from '../assets/creamcat.png';
import grayCat from '../assets/graycat.png';
import lightBrownCat from '../assets/lightbrowncat.png';
import orangeCat from '../assets/orangecat.png';
import tuxedoCat from '../assets/tuxedocat.png';
import whiteCat from '../assets/whitecat.png';

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);

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
        const userFeedings = {};

        // Get all days from all weeks
        const daysQuery = collectionGroup(db, 'days');
        const daysSnapshot = await getDocs(daysQuery);

        daysSnapshot.forEach((dayDoc) => {
          const dayData = dayDoc.data();
          const slots = dayData.slots || {};

          // Count feedings for each user
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

        // Get all valid users from the users collection
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const validEmails = new Set(usersSnapshot.docs.map(doc => doc.data().email));

        // Filter to only include users that still exist in the users collection
        const leaderboardArray = Object.values(userFeedings)
          .filter(user => validEmails.has(user.email))
          .sort((a, b) => b.count - a.count)
          .map((user, index) => ({
            ...user,
            rank: index + 1
          }));

        // Find current user's rank
        const currentUserData = leaderboardArray.find(
          user => user.email === currentUser.email
        );
        
        if (currentUserData) {
          setCurrentUserRank(currentUserData.rank);
        }

        setLeaderboardData(leaderboardArray);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

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
      bgColor = 'bg-gray-50';
      textColor = 'text-gray-700';
      borderColor = 'border-gray-300';
    } else if (currentUserRank === 3) {
      message = `You are the #3 most active feeder! Amazing job!`;
      emoji = '🥉';
      bgColor = 'bg-orange-50';
      textColor = 'text-orange-700';
      borderColor = 'border-orange-300';
    } else if (currentUserRank <= 5) {
      message = `You're #${currentUserRank} out of ${leaderboardData.length} volunteers! You're in the top 5!`;
      emoji = '⭐';
      bgColor = 'bg-purple-50';
      textColor = 'text-purple-700';
      borderColor = 'border-purple-300';
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600 text-center">Loading leaderboard...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600 text-center">Please sign in to view the leaderboard</p>
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Leaderboard</h2>
        <p className="text-gray-600 text-center">No feeding data yet. Be the first to sign up!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Rank Message Banner */}
      {rankInfo && (
        <div className={`mb-6 p-4 ${rankInfo.bgColor} border-2 ${rankInfo.borderColor} rounded-lg ${rankInfo.textColor}`}>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">{rankInfo.emoji}</span>
            <p className="font-bold text-center">{rankInfo.message}</p>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-2 text-center">Volunteer Leaderboard</h2>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Top feeders of all time 
      </p>

      {/* Current User Rank Highlight - Removed, now shown in banner above */}

      {/* Leaderboard List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {leaderboardData.map((user) => {
          const isCurrentUser = user.email === currentUser.email;
          const medal = getMedalEmoji(user.rank);

          return (
            <div
              key={user.email}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                isCurrentUser
                  ? 'bg-purple-100 border-2 border-purple-400'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Left: Rank, Avatar, Name */}
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className="w-8 text-center">
                  {medal ? (
                    <span className="text-2xl">{medal}</span>
                  ) : (
                    <span className="text-lg font-bold text-gray-600">
                      #{user.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                  <img 
                    src={getCatImageFromPath(user.photoURL)} 
                    alt={user.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Name */}
                <div>
                  <p className={`font-semibold ${isCurrentUser ? 'text-purple-700' : 'text-gray-800'}`}>
                    {user.name}
                    {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                  </p>
                </div>
              </div>

              {/* Right: Feeding Count */}
              <div className="text-right">
                <p className={`text-xl font-bold ${isCurrentUser ? 'text-purple-600' : 'text-gray-700'}`}>
                  {user.count}
                </p>
                <p className="text-xs text-gray-500">
                  feeding{user.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {leaderboardData.length}
            </p>
            <p className="text-sm text-gray-600">Total Volunteers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {leaderboardData.reduce((sum, user) => sum + user.count, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Feedings</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;