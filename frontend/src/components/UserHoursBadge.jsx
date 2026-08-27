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
      <div className="c4-panel font-hand rounded-[18px] p-4">
        <p className="text-ink/70">Loading hours...</p>
      </div>
    );
  }

  const currentSemester = getCurrentSemester(new Date());

  return (
    <div className="c4-panel font-hand rounded-[18px] p-4 sm:p-5">
      <h3 className="font-pix text-accent m-0 mb-3 text-xl sm:text-2xl">♡ your volunteer hours</h3>

      {/* Hours Display - Simple */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          className="border-line rounded-[12px] border-[1.5px] p-4 text-center"
          style={{ background: 'var(--color-chip-1)' }}
        >
          <p className="font-pix text-ink m-0 mb-1 text-3xl">{hours.total.toFixed(1)}</p>
          <p className="text-ink/70 m-0 text-sm">Total Hours</p>
        </div>
        <div
          className="border-line rounded-[12px] border-[1.5px] p-4 text-center"
          style={{ background: 'var(--color-chip-3)' }}
        >
          <p className="font-pix text-ink m-0 mb-1 text-3xl">{hours.semester.toFixed(1)}</p>
          <p className="text-ink/70 m-0 text-sm">{currentSemester.name}</p>
        </div>
      </div>

      {hours.total === 0 && (
        <div className="mt-6 text-center py-4 bg-soft rounded-lg">
          <p className="text-ink/70">
            Sign up for feeding shifts to start earning volunteer hours! 
          </p>
        </div>
      )}

      {hours.total > 0 && (
        <div className="mt-6 text-center py-3 bg-green-50 rounded-lg">
          <p className="text-green-700 font-semibold">
            Great work! Keep up the amazing volunteering! 
          </p>
        </div>
      )}
    </div>
  );
}

export default UserHoursBadge;