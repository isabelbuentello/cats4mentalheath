import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';

function UserHoursBadge() {
  const [hours, setHours] = useState({
    total: 0,
    semester: 0
  });
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserHours = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get all shifts for this user
        const shiftsRef = collection(db, 'volunteer-logs', user.uid, 'shifts');
        const shiftsSnapshot = await getDocs(shiftsRef);
        
        let totalHours = 0;
        let semesterHours = 0;

        // Get current semester dates
        const now = new Date();
        const currentSemester = getCurrentSemester(now);

        shiftsSnapshot.forEach(doc => {
          const shift = doc.data();
          const shiftDate = new Date(shift.date);
          
          // Only count VERIFIED hours
          if (shift.status === 'verified') {
            totalHours += shift.hours || 0;

            // Count semester hours
            if (shiftDate >= currentSemester.start && 
                shiftDate <= currentSemester.end) {
              semesterHours += shift.hours || 0;
            }
          }
        });

        setHours({
          total: totalHours,
          semester: semesterHours
        });
      } catch (error) {
        console.error('Error fetching hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserHours();
  }, [user]);

  const getCurrentSemester = (date) => {
    const month = date.getMonth();
    const year = date.getFullYear();

    if (month >= 7 && month <= 11) {
      // Fall: August - December
      return {
        name: `Fall ${year}`,
        start: new Date(year, 7, 1),
        end: new Date(year, 11, 31)
      };
    } else if (month >= 0 && month <= 4) {
      // Spring: January - May
      return {
        name: `Spring ${year}`,
        start: new Date(year, 0, 1),
        end: new Date(year, 4, 31)
      };
    } else {
      // Summer: June - July
      return {
        name: `Summer ${year}`,
        start: new Date(year, 5, 1),
        end: new Date(year, 6, 31)
      };
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Loading hours...</p>
      </div>
    );
  }

  const currentSemester = getCurrentSemester(new Date());

  return (
    <div style={{ padding: '32px' }} className="bg-white rounded-xl shadow-lg">
      <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>🕐 Your Volunteer Hours</h3>

      {/* Hours Display - Simple */}
      <div className="grid grid-cols-2 gap-4" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
        <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg p-6 text-center text-white">
          <p className="text-4xl font-bold mb-1">{hours.total.toFixed(1)}</p>
          <p className="text-sm opacity-90">Total Hours</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg p-6 text-center text-white">
          <p className="text-4xl font-bold mb-1">{hours.semester.toFixed(1)}</p>
          <p className="text-sm opacity-90">{currentSemester.name}</p>
        </div>
      </div>

      {hours.total === 0 && (
        <div className="mt-6 text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            Sign up for feeding shifts to start earning volunteer hours! 
          </p>
        </div>
      )}

      {hours.total > 0 && (
        <div className="mt-6 text-center py-3 bg-green-50 rounded-lg">
          <p className="text-green-700 font-semibold" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            Great work! Keep up the amazing volunteering! 
          </p>
        </div>
      )}
    </div>
  );
}

export default UserHoursBadge;