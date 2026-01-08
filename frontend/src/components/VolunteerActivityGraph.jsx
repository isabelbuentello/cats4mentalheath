import React, { useState, useEffect } from 'react';
import { collectionGroup, getDocs, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';

function VolunteerActivityGraph() {
  const [activityData, setActivityData] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalFeedings, setTotalFeedings] = useState(0);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);

  // Define semesters
  const getSemesters = () => {
    const semesters = [];
    const currentYear = new Date().getFullYear();
    
    // Generate semesters for current year and next 2 years
    for (let year = currentYear - 1; year <= currentYear + 2; year++) {
      semesters.push({
        id: `fall-${year}`,
        name: `Fall ${year}`,
        start: new Date(year, 7, 1),  // August 1
        end: new Date(year, 11, 31),  // December 31
        year: year
      });
      semesters.push({
        id: `spring-${year}`,
        name: `Spring ${year}`,
        start: new Date(year, 0, 1),  // January 1
        end: new Date(year, 4, 31),   // May 31
        year: year
      });
      semesters.push({
        id: `summer-${year}`,
        name: `Summer ${year}`,
        start: new Date(year, 5, 1),  // June 1
        end: new Date(year, 6, 31),   // July 31
        year: year
      });
    }
    
    // Sort by date
    semesters.sort((a, b) => a.start - b.start);
    
    return semesters;
  };

  // Determine current semester
  const getCurrentSemester = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();
    
    if (month >= 7 && month <= 11) {
      // August - December = Fall
      return `fall-${year}`;
    } else if (month >= 0 && month <= 4) {
      // January - May = Spring
      return `spring-${year}`;
    } else {
      // June - July = Summer
      return `summer-${year}`;
    }
  };

  const semesters = getSemesters();

  useEffect(() => {
    // Set current semester on mount
    setCurrentSemester(getCurrentSemester());
  }, []);

  useEffect(() => {
    const currentUser = auth.currentUser;
      
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // 1. Set up the Real-time Listener
    const daysQuery = collectionGroup(db, 'days');

    // This runs immediately AND whenever the database changes
    const unsubscribe = onSnapshot(daysQuery, (snapshot) => {
      const activity = {};
      let total = 0;
      const userFeedings = {};

      snapshot.forEach((dayDoc) => {
        const dayData = dayDoc.data();
        const slots = dayData.slots || {};
        const dayId = dayDoc.id;

        // Count slots signed up by this user
        let dayCount = 0;
        Object.values(slots).forEach(slot => {
          // IMPORTANT CHECK:
          // When a slot is cancelled, its email becomes null.
          // This ensures we stop counting it immediately.
          if (slot && slot.email === currentUser.email) {
            dayCount++;
            total++;
          }
          
          // Track all users' feeding counts for ranking
          if (slot && slot.email) {
            if (!userFeedings[slot.email]) {
              userFeedings[slot.email] = 0;
            }
            userFeedings[slot.email]++;
          }
        });

        if (dayCount > 0) {
          activity[dayId] = dayCount;
        }
      });

      // Calculate user's rank
      const sortedUsers = Object.entries(userFeedings)
        .sort(([, a], [, b]) => b - a);
      
      const currentUserIndex = sortedUsers.findIndex(([email]) => email === currentUser.email);
      
      if (currentUserIndex !== -1) {
        setUserRank(currentUserIndex + 1);
        setTotalUsers(sortedUsers.length);
      }

      setActivityData(activity);
      setTotalFeedings(total);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to activity data:', error);
      setLoading(false);
    });

    // 2. Cleanup function
    // This stops the listener when the component unmounts
    return () => unsubscribe();

  }, []); // Run on mount

  // Navigate semesters
  const goToPreviousSemester = () => {
    const currentIndex = semesters.findIndex(s => s.id === currentSemester);
    if (currentIndex > 0) {
      setCurrentSemester(semesters[currentIndex - 1].id);
    }
  };

  const goToNextSemester = () => {
    const currentIndex = semesters.findIndex(s => s.id === currentSemester);
    if (currentIndex < semesters.length - 1) {
      setCurrentSemester(semesters[currentIndex + 1].id);
    }
  };

  const goToCurrentSemester = () => {
    setCurrentSemester(getCurrentSemester());
  };

  // Generate weeks for the selected semester
  const generateWeeks = () => {
    if (!currentSemester) return [];

    const semester = semesters.find(s => s.id === currentSemester);
    if (!semester) return [];

    const weeks = [];
    let currentDate = new Date(semester.start);
    
    // Move to the Sunday of the first week
    const day = currentDate.getDay();
    currentDate.setDate(currentDate.getDate() - day);

    // Generate weeks until we pass the semester end date
    while (currentDate <= semester.end) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        const dateStr = date.toISOString().split('T')[0];
        const count = activityData[dateStr] || 0;
        
        // Only add if date is within semester range
        const isInSemester = date >= semester.start && date <= semester.end;
        
        week.push({
          date: new Date(date),
          dateStr: dateStr,
          count: count,
          isInSemester: isInSemester
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
      
      // Stop if we've gone past the semester
      if (currentDate > semester.end) break;
    }

    return weeks;
  };

  // Calculate semester feedings
  const getSemesterFeedings = () => {
    if (!currentSemester) return 0;
    
    const semester = semesters.find(s => s.id === currentSemester);
    if (!semester) return 0;

    let count = 0;
    Object.entries(activityData).forEach(([dateStr, feedingCount]) => {
      const date = new Date(dateStr);
      if (date >= semester.start && date <= semester.end) {
        count += feedingCount;
      }
    });

    return count;
  };

  // Get color based on activity count
  const getColor = (count, isInSemester) => {
    if (!isInSemester) return '#f5f5f5'; // Very light gray for out-of-semester
    if (count === 0) return '#e0e0e0';
    if (count === 1) return '#e6c3de';
    if (count === 2) return '#d286cd';
    if (count === 3) return '#c151b0';
    return '#a02e91'; // 4+
  };

  // Get rank message and style
  const getRankInfo = () => {
    if (!userRank || !totalFeedings) return null;

    let message, emoji, bgColor, textColor;

    if (userRank === 1) {
      message = `You are the #1 most active feeder! Thanks for all your help! 🎉`;
      emoji = '🥇';
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-700';
    } else if (userRank === 2) {
      message = `You are the #2 most active feeder! Keep up the great work!`;
      emoji = '🥈';
      bgColor = 'bg-gray-50';
      textColor = 'text-gray-700';
    } else if (userRank === 3) {
      message = `You are the #3 most active feeder! Amazing job!`;
      emoji = '🥉';
      bgColor = 'bg-orange-50';
      textColor = 'text-orange-700';
    } else if (userRank <= 5) {
      message = `You're #${userRank} out of ${totalUsers} volunteers! You're in the top 5!`;
      emoji = '⭐';
      bgColor = 'bg-purple-50';
      textColor = 'text-purple-700';
    } else if (userRank <= 10) {
      message = `You're #${userRank} out of ${totalUsers} volunteers! You're in the top 10!`;
      emoji = '🌟';
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-700';
    } else {
      message = `You're #${userRank} out of ${totalUsers} volunteers. Keep feeding!`;
      emoji = '💪';
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
    }

    return { message, emoji, bgColor, textColor };
  };

  const weeks = generateWeeks();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const semesterFeedings = getSemesterFeedings();
  const currentSemesterObj = semesters.find(s => s.id === currentSemester);
  const currentIndex = semesters.findIndex(s => s.id === currentSemester);
  const rankInfo = getRankInfo();

  if (loading || !currentSemester) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Loading activity...</p>
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Please sign in to view your activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Semester Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousSemester}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
        >
          ← Previous
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {currentSemesterObj?.name}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {semesterFeedings} feeding{semesterFeedings !== 1 ? 's' : ''} this semester
          </p>
          <button
            onClick={goToCurrentSemester}
            className="mt-2 text-sm text-purple-600 hover:text-purple-700 underline"
          >
            Jump to Current Semester
          </button>
        </div>

        <button
          onClick={goToNextSemester}
          disabled={currentIndex === semesters.length - 1}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
        >
          Next →
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="flex justify-center">
          <div>
            {/* Month labels */}
            <div className="flex mb-2 ml-16">
              {weeks.map((week, weekIndex) => {
                const firstDay = week[0].date;
                const isFirstWeekOfMonth = firstDay.getDate() <= 7;
                const monthLabel = isFirstWeekOfMonth ? months[firstDay.getMonth()] : '';
                
                return (
                  <div key={weekIndex} className="flex-shrink-0" style={{ width: '18px', marginRight: '4px' }}>
                    <span className="text-xs text-gray-600">{monthLabel}</span>
                  </div>
                );
              })}
            </div>

            {/* Activity grid */}
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col justify-around mr-3 text-xs text-gray-600">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* Weeks */}
              <div className="flex">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col" style={{ marginRight: '4px' }}>
                    {week.map((day, dayIndex) => {
                      const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                      
                      return (
                        <div
                          key={dayIndex}
                          className="relative group"
                          style={{
                            width: '18px',
                            height: '18px',
                            backgroundColor: getColor(day.count, day.isInSemester),
                            marginBottom: '4px',
                            borderRadius: '3px',
                            border: isToday ? '2px solid #d946ef' : 'none',
                            opacity: day.isInSemester ? 1 : 0.3
                          }}
                          title={`${day.date.toLocaleDateString()}: ${day.count} feeding${day.count !== 1 ? 's' : ''}`}
                        >
                          {/* Tooltip on hover */}
                          {day.isInSemester && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                              {day.count} on {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-600">
              <span>Less</span>
              <div style={{ width: '18px', height: '18px', backgroundColor: '#e0e0e0', borderRadius: '3px' }}></div>
              <div style={{ width: '18px', height: '18px', backgroundColor: '#e6c3de', borderRadius: '3px' }}></div>
              <div style={{ width: '18px', height: '18px', backgroundColor: '#d286cd', borderRadius: '3px' }}></div>
              <div style={{ width: '18px', height: '18px', backgroundColor: '#c151b0', borderRadius: '3px' }}></div>
              <div style={{ width: '18px', height: '18px', backgroundColor: '#a02e91', borderRadius: '3px' }}></div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total feedings stat */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Total all-time feedings: <span className="font-bold text-gray-800">{totalFeedings}</span>
        </p>
      </div>
    </div>
  );
}

export default VolunteerActivityGraph;