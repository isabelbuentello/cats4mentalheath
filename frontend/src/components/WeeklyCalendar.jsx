import { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase/config.js";
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, runTransaction, getDocs } from "firebase/firestore";
import DayCard from "./DayCard.jsx";
import FeedingModal from "./FeedingModal.jsx";

function WeeklyCalendar() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    // Set to midnight first
    now.setHours(0, 0, 0, 0);
    // Calculate the Sunday of the current week
    const day = now.getDay();
    now.setDate(now.getDate() - day);
    return now;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(null);
  const [checkingApproval, setCheckingApproval] = useState(true);
  const [userProfiles, setUserProfiles] = useState({});

  const activeTransactionsRef = useRef(new Set());
  const [activeTransactions, setActiveTransactions] = useState(new Set());

  const FEEDING_ZONES = [
    { id: "am_law", time: "AM Law", location: "Law Buildings", isPM: false },
    { id: "pm_law", time: "PM Law", location: "Law Buildings", isPM: true },
    {
      id: "am_equal_op",
      time: "AM Equal Op.",
      location: "Equal Opportunity Building",
      isPM: false,
    },
    {
      id: "pm_equal_op",
      time: "PM Equal Op.",
      location: "Equal Opportunity Building",
      isPM: true,
    },
    { id: "am_zone_d", time: "AM Zone D", location: "Zone D Lot", isPM: false },
    { id: "pm_zone_d", time: "PM Zone D", location: "Zone D Lot", isPM: true },
  ];

  // Get week start (Sunday)
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // Set to midnight to avoid any time-based issues
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
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
  const dayNames = ["sun", "mon", "tues", "wed", "thurs", "fri", "sat"];

  // Format week range
  const formatWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const year = start.getFullYear();
    return `Week of\n${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.getDate()}, ${year}`;
  };

  // Get week ID for Firestore
  const getWeekId = (date) => {
    const weekStart = getWeekStart(date);
    const year = weekStart.getFullYear();
    const month = String(weekStart.getMonth() + 1).padStart(2, '0');
    const day = String(weekStart.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

  // Get day ID for Firestore
  const getDayId = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize empty slots for a day
  const initializeEmptySlots = () => {
    const slots = {};
    FEEDING_ZONES.forEach((zone) => {
      slots[zone.id] = {
        volunteer: null,
        email: null,
        photoURL: null, 
        signedUpAt: null,
      };
    });
    return slots;
  };

  useEffect(() => {
  const fetchUserProfiles = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const profiles = {};
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email) {
          profiles[data.email] = {
            displayName: data.displayName || data.email.split('@')[0],
            photoURL: data.photoURL || null
          };
        }
      });
      setUserProfiles(profiles);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
    }
  };

  fetchUserProfiles();
}, []);

  // REAL-TIME LISTENERS: Subscribe to schedule updates
  useEffect(() => {
    const weekId = getWeekId(currentWeekStart);
    const unsubscribers = [];

    setLoading(true);

    weekDays.forEach((day) => {
      const dayId = getDayId(day);
      const dayDocRef = doc(db, "feeding-schedule", weekId, "days", dayId);

      // Subscribe to real-time updates for each day
      const unsubscribe = onSnapshot(
        dayDocRef,
        (docSnapshot) => {
          // Don't update if there's an active transaction for this day
          if (activeTransactionsRef.current.has(dayId)) {
            return;
          }

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setScheduleData((prev) => ({
              ...prev,
              [dayId]: data.slots || data,
            }));
          } else {
            // Initialize with empty slots if document doesn't exist
            const emptySlots = initializeEmptySlots();
            setScheduleData((prev) => ({
              ...prev,
              [dayId]: emptySlots,
            }));
            
            // Create the document in Firebase with slots field
            setDoc(dayDocRef, {
              slots: emptySlots,
              createdAt: new Date().toISOString(),
            }).catch((error) => {
              console.error(`Error creating schedule for ${dayId}:`, error);
            });
          }
        },
        (error) => {
          console.error("Error listening to schedule:", error);
          // Fallback to empty slots on error
          setScheduleData((prev) => ({
            ...prev,
            [dayId]: initializeEmptySlots(),
          }));
        }
      );

      unsubscribers.push(unsubscribe);
    });

    setLoading(false);

    // Cleanup listeners when week changes or component unmounts
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [currentWeekStart]);
  
  useEffect(() => {
    const checkApprovalStatus = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsApproved(false);
        setCheckingApproval(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setIsApproved(userDoc.data().isApproved || false);
        } else {
          setIsApproved(false);
        }
      } catch (error) {
        console.error('Error checking approval:', error);
        setIsApproved(false);
      } finally {
        setCheckingApproval(false);
      }
    };

    checkApprovalStatus();
  }, []);

  // Get slots for a specific day
  const getSlots = (day) => {
  const dayId = getDayId(day);
  const daySlots = scheduleData[dayId] || {};

  return FEEDING_ZONES.map((zone) => {
    const slotData = daySlots[zone.id];
    const email = slotData?.email;
    
    // Get current profile data if user exists
    const currentProfile = email ? userProfiles[email] : null;
    
    return {
      ...zone,
      volunteer: currentProfile?.displayName || slotData?.volunteer || null,
      email: email || null,
      photoURL: currentProfile?.photoURL || slotData?.photoURL || null,
    };
  });
};

  // Handle slot click
  const handleSlotClick = (day, slot) => {
    if (!isApproved) {
      alert('⚠️ Only approved volunteers can sign up for feeding slots.\n\nComplete our training to get approved!');
      return;
    }
    
    setSelectedDay(day);
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const logVolunteerShift = async (user, day, slot) => {
    try {
      // Create unique shift ID
      const shiftId = `${getDayId(day)}_${slot.id}`;
      
      // Determine hours based on shift type (0.5 hours = 30 minutes)
      const hours = 0.5;
      
      // Create shift log
      const shiftLogRef = doc(
        db,
        'volunteer-logs',
        user.uid,
        'shifts',
        shiftId
      );
      
      await setDoc(shiftLogRef, {
        date: getDayId(day),
        location: slot.location,
        timeSlot: slot.id,
        timeLabel: slot.time,
        signedUpAt: new Date(),
        status: 'pending',
        verifiedBy: null,
        verifiedAt: null,
        hours: hours,
        userEmail: user.email,
        userName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || null
      });
      
      console.log('✓ Shift logged successfully');
    } catch (error) {
      console.error('Error logging shift:', error);
    }
  };

  const deleteVolunteerShift = async (user, day, slot) => {
    try {
      const shiftId = `${getDayId(day)}_${slot.id}`;
      const shiftLogRef = doc(db, 'volunteer-logs', user.uid, 'shifts', shiftId);
      
      await deleteDoc(shiftLogRef);
      console.log('✓ Shift log deleted successfully');
    } catch (error) {
      console.error('Error deleting shift log:', error);
    }
  };

  // TRANSACTION-BASED SIGN UP: Prevents race conditions
  const handleSignUp = async (day, slot) => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to sign up for feeding slots!");
      return;
    }

    const weekId = getWeekId(currentWeekStart);
    const dayId = getDayId(day);
    const dayDocRef = doc(db, "feeding-schedule", weekId, "days", dayId);

    // Mark this day as having an active transaction
    activeTransactionsRef.current.add(dayId);
    

    try {
      console.log("Signing up for:", { weekId, dayId, slotId: slot.id });

      let finalSlots = {};

      // Use transaction to ensure atomic read-check-write
      await runTransaction(db, async (transaction) => {
        const dayDoc = await transaction.get(dayDocRef);
        
        let currentSlots = {};
        if (dayDoc.exists()) {
          const data = dayDoc.data();
          currentSlots = data.slots || data;
        }

        // Check if slot is still available
        if (currentSlots[slot.id]?.volunteer) {
          throw new Error("Sorry, someone just signed up for this slot!");
        }

        // Update the specific slot
        finalSlots = {
          ...currentSlots,
          [slot.id]: {
            volunteer: user.displayName || user.email.split("@")[0],
            email: user.email,
            photoURL: user.photoURL || null,
            signedUpAt: new Date().toISOString(),
          },
        };

        // Write update within transaction
        transaction.set(
          dayDocRef,
          {
            slots: finalSlots,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      });

      console.log("Successfully updated Firebase");
      
      // Manually update local state immediately with transaction result
      setScheduleData((prev) => ({
        ...prev,
        [dayId]: finalSlots,
      }));

      // Only log shift AFTER transaction succeeds
      await logVolunteerShift(user, day, slot);

      alert("Successfully signed up!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error signing up:", error);
      alert(error.message || `Failed to sign up: ${error.message}`);
    } finally {
      // Clear transaction lock after a small delay
      setTimeout(() => {
      activeTransactionsRef.current.delete(dayId);
      }, 500);
    }
  };

  // TRANSACTION-BASED CANCEL: Prevents race conditions
  const handleCancelSignUp = async (day, slot) => {
  const user = auth.currentUser;

  if (!user) {
    alert("Please log in!");
    return;
  }

  const weekId = getWeekId(currentWeekStart);
  const dayId = getDayId(day);
  const dayDocRef = doc(db, "feeding-schedule", weekId, "days", dayId);
  
  // Reference to the volunteer log
  const shiftId = `${dayId}_${slot.id}`;
  const shiftLogRef = doc(db, 'volunteer-logs', user.uid, 'shifts', shiftId);

  activeTransactionsRef.current.add(dayId);

  try {
    console.log("Cancelling sign-up for:", {
      weekId,
      dayId,
      slotId: slot.id,
    });

    let finalSlots = {};

    await runTransaction(db, async (transaction) => {
      const dayDoc = await transaction.get(dayDocRef);
      
      let currentSlots = {};
      if (dayDoc.exists()) {
        const data = dayDoc.data();
        currentSlots = data.slots || data;
      }

      if (currentSlots[slot.id]?.email !== user.email) {
        throw new Error("You can only cancel your own sign-ups!");
      }

      finalSlots = {
        ...currentSlots,
        [slot.id]: {
          volunteer: null,
          email: null,
          photoURL: null,
          signedUpAt: null,
        },
      };

      // Update feeding schedule
      transaction.set(
        dayDocRef,
        {
          slots: finalSlots,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Delete volunteer log in same transaction - atomic operation
      transaction.delete(shiftLogRef);
    });

    console.log("Successfully cancelled in Firebase");
    
    setScheduleData((prev) => ({
      ...prev,
      [dayId]: finalSlots,
    }));

    alert("Sign-up cancelled!");
    setIsModalOpen(false);
  } catch (error) {
    console.error("Error cancelling:", error);
    alert(error.message || `Failed to cancel: ${error.message}`);
  } finally {
    setTimeout(() => {
      activeTransactionsRef.current.delete(dayId);
    }, 500);
  }
};


  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-white">loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 px-4 sm:px-6 md:px-8">
      {/* Week Header with Arrows */}
      <div className="flex justify-center items-center gap-6 sm:gap-12 py-12 px-4">
        <button
          onClick={previousWeek}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            color: "white",
            fontSize: "2.5rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#ffc0cb")}
          onMouseLeave={(e) => (e.target.style.color = "white")}
        >
          ←
        </button>

        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight whitespace-pre-line">
            {formatWeekRange()}
          </h2>
          <p className="text-xl sm:text-2xl mt-4 text-white">
            Sign Up to Feed!
          </p>

          {/* Spacer div */}
          <div className="h-3 sm:h-4 md:h-10 lg:h-14"></div>
        </div>

        <button
          onClick={nextWeek}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            color: "white",
            fontSize: "2.5rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#ffc0cb")}
          onMouseLeave={(e) => (e.target.style.color = "white")}
        >
          →
        </button>
      </div>

      {/* Calendar Grid - Desktop */}
      <div
        className="hidden md:grid md:grid-cols-7 gap-6 pb-12"
        style={{ paddingLeft: "32px", paddingRight: "32px" }}
      >
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
      <div
        className="md:hidden pb-12 grid grid-cols-2 gap-4"
        style={{ paddingLeft: "24px", paddingRight: "24px" }}
      >
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
