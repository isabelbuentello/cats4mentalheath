import { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config.js';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import DayCard from './DayCard.jsx';
import FeedingModal from './FeedingModal.jsx';

function WeeklyCalendar() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
  // Get current date in 2025
  const now = new Date();
  const currentDate2025 = new Date(2025, now.getMonth(), now.getDate());
  
  // Calculate the Sunday of the current week
  const day = currentDate2025.getDay();
  const diff = currentDate2025.getDate() - day;
  const sunday = new Date(currentDate2025);
  sunday.setDate(diff);
  
  return sunday;
});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fixed feeding zones - these never change
  // Fixed feeding zones - these never change
const FEEDING_ZONES = [
  { id: 'am_law', time: 'am law', location: 'Law Building', isPM: false },
  { id: 'pm_law', time: 'pm law', location: 'Law Building', isPM: true },
  { id: 'am_equal_op', time: 'am equal op', location: 'Equal Opportunity', isPM: false },
  { id: 'pm_equal_op', time: 'pm equal op', location: 'Equal Opportunity', isPM: true },
  { id: 'am_zone_d', time: 'am zone d', location: 'Zone D', isPM: false },
  { id: 'pm_zone_d', time: 'pm zone d', location: 'Zone D', isPM: true },
];

  // Get week start (Sunday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Navigate weeks
  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  // Generate week days
  const getWeekDays = () => {
    const weekStart = getWeekStart(currentWeekStart);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'];

  // Format week range
  const formatWeekRange = () => {
  const start = weekDays[0];
  const end = weekDays[6];
  const year = start.getFullYear();
  return `Week of\n${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}, ${year}`;
};

  // Get week ID for Firestore
  const getWeekId = (date) => {
    const weekStart = getWeekStart(date);
    return weekStart.toISOString().split('T')[0]; // "2024-11-23" format
  };

  // Get day ID for Firestore
  const getDayId = (date) => {
    return date.toISOString().split('T')[0]; // "2024-11-26" format
  };

  // Initialize empty slots for a day
  const initializeEmptySlots = () => {
    const slots = {};
    FEEDING_ZONES.forEach(zone => {
      slots[zone.id] = { 
        volunteer: null, 
        email: null, 
        signedUpAt: null 
      };
    });
    return slots;
  };

  // Fetch schedule data from Firebase
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      const weekId = getWeekId(currentWeekStart);
      const newScheduleData = {};

      for (const day of weekDays) {
        const dayId = getDayId(day);
        const dayDocRef = doc(db, 'feeding-schedule', weekId, 'days', dayId);
        
        try {
          const dayDoc = await getDoc(dayDocRef);
          
          if (dayDoc.exists()) {
            const data = dayDoc.data();
            newScheduleData[dayId] = data.slots || data; // Handle both formats
          } else {
            // Initialize with empty slots if document doesn't exist
            const emptySlots = initializeEmptySlots();
            newScheduleData[dayId] = emptySlots;
            
            // Create the document in Firebase with slots field
            await setDoc(dayDocRef, { 
              slots: emptySlots,
              createdAt: new Date().toISOString()
            });
            
            console.log(`Created empty schedule for ${dayId}`);
          }
        } catch (error) {
          console.error('Error fetching day schedule:', error);
          newScheduleData[dayId] = initializeEmptySlots();
        }
      }

      setScheduleData(newScheduleData);
      setLoading(false);
    };

    fetchSchedule();
  }, [currentWeekStart]);

  // Get slots for a specific day
  const getSlots = (day) => {
    const dayId = getDayId(day);
    const daySlots = scheduleData[dayId] || {};
    
    return FEEDING_ZONES.map(zone => ({
      ...zone,
      volunteer: daySlots[zone.id]?.volunteer || null,
      email: daySlots[zone.id]?.email || null,
    }));
  };

  // Handle slot click
  const handleSlotClick = (day, slot) => {
    setSelectedDay(day);
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  // Handle sign up
  const handleSignUp = async (day, slot) => {
    const user = auth.currentUser;
    
    if (!user) {
      alert('Please log in to sign up for feeding slots!');
      return;
    }

    const weekId = getWeekId(currentWeekStart);
    const dayId = getDayId(day);
    const dayDocRef = doc(db, 'feeding-schedule', weekId, 'days', dayId);

    try {
      console.log('Signing up for:', { weekId, dayId, slotId: slot.id });
      
      // Get current data
      const currentDoc = await getDoc(dayDocRef);
      let currentSlots = {};
      
      if (currentDoc.exists()) {
        const data = currentDoc.data();
        currentSlots = data.slots || data;
      }

      // Update the specific slot
      const updatedSlots = {
        ...currentSlots,
        [slot.id]: {
          volunteer: user.displayName || user.email.split('@')[0],
          email: user.email,
          signedUpAt: new Date().toISOString(),
        }
      };

      // Use setDoc with merge to ensure document exists
      await setDoc(dayDocRef, { 
        slots: updatedSlots,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('Successfully updated Firebase');

      // Update local state
      setScheduleData(prev => ({
        ...prev,
        [dayId]: updatedSlots
      }));

      alert('Successfully signed up!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error signing up:', error);
      alert(`Failed to sign up: ${error.message}`);
    }
  };

  // Handle cancellation 
  const handleCancelSignUp = async (day, slot) => {
    const user = auth.currentUser;
    
    if (!user) {
      alert('Please log in!');
      return;
    }

    const dayId = getDayId(day);
    const slotData = scheduleData[dayId]?.[slot.id];

    // Check if this user signed up for this slot
    if (slotData?.email !== user.email) {
      alert('You can only cancel your own sign-ups!');
      return;
    }

    const weekId = getWeekId(currentWeekStart);
    const dayDocRef = doc(db, 'feeding-schedule', weekId, 'days', dayId);

    try {
      console.log('Cancelling sign-up for:', { weekId, dayId, slotId: slot.id });

      // Get current data
      const currentDoc = await getDoc(dayDocRef);
      let currentSlots = {};
      
      if (currentDoc.exists()) {
        const data = currentDoc.data();
        currentSlots = data.slots || data;
      }

      // Clear the slot
      const updatedSlots = {
        ...currentSlots,
        [slot.id]: {
          volunteer: null,
          email: null,
          signedUpAt: null,
        }
      };

      await setDoc(dayDocRef, { 
        slots: updatedSlots,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('Successfully cancelled in Firebase');

      // Update local state
      setScheduleData(prev => ({
        ...prev,
        [dayId]: updatedSlots
      }));

      alert('Sign-up cancelled!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error cancelling:', error);
      alert(`Failed to cancel: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-white">Loading schedule...</p>
      </div>
    );
  }

  return (
  <div className="pb-12 px-4 sm:px-6 md:px-8">
    {/* Week Header with Arrows */}
    <div className="flex justify-center items-center gap-6 sm:gap-12 py-12 px-4">
      <button 
        onClick={previousWeek}
        className="text-4xl sm:text-5xl font-bold hover:text-white transition-colors px-4"
      >
        ←
      </button>
      
      <div className="text-center">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight whitespace-pre-line">
          {formatWeekRange()}
        </h2>
        <p className="text-xl sm:text-2xl mt-4 text-white">sign up to feed!!!</p>

        {/* Spacer div */}
      <div className="h-3 sm:h-4 md:h-10 lg:h-14"></div>

      </div>

      
      <button 
        onClick={nextWeek}
        className="text-4xl sm:text-5xl font-bold hover:text-white transition-colors px-4"
      >
        →
      </button>
    </div>

    {/* Calendar Grid - Desktop */}
<div className="hidden md:grid md:grid-cols-7 gap-6 px-4 sm:px-8 md:px-12 lg:px-16 pb-12">
  {weekDays.map((day, index) => (
    <DayCard
      key={index}
      day={day}
      dayName={dayNames[day.getDay()]}
      slots={getSlots(day)}
      onSlotClick={handleSlotClick}
    />
  ))}
</div>

{/* Calendar Grid - Mobile - 2 columns */}
<div className="md:hidden px-8 sm:px-12 pb-12 grid grid-cols-2 gap-4">
  {weekDays.map((day, index) => (
    <DayCard
      key={index}
      day={day}
      dayName={dayNames[day.getDay()]}
      slots={getSlots(day)}
      onSlotClick={handleSlotClick}
    />
  ))}
</div>

    {/* Modal */}
    <FeedingModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      selectedDay={selectedDay}
      selectedSlot={selectedSlot}
      onSignUp={handleSignUp}
      onCancel={handleCancelSignUp}
      currentUser={auth.currentUser}
    />
  </div>
);
}

export default WeeklyCalendar;