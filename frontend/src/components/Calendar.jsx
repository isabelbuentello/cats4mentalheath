import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';

function Calendar({ isAdmin = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [showModal, setShowModal] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const eventsQuery = query(collection(db, 'events'), orderBy('date', 'asc'));
      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDay = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return events.filter(event => {
      const eventDate = event.date;
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };

  const handleDayClick = (day) => {
    if (isAdmin) {
      setSelectedDay(day);
      setShowModal(true);
    }
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim()) return;

    try {
      const eventDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        selectedDay
      );

      await addDoc(collection(db, 'events'), {
        title: eventTitle,
        date: eventDate,
        createdBy: auth.currentUser.uid,
        createdAt: new Date()
      });

      setEventTitle('');
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!isAdmin) return;
    
    try {
      await deleteDoc(doc(db, 'events', eventId));
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-1 sm:p-2"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = 
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day)}
          className={`aspect-square p-1 sm:p-2 border-2 rounded-lg relative overflow-hidden
            ${isAdmin ? 'cursor-pointer hover:bg-[#ffb3c1] hover:bg-opacity-30' : ''} 
            ${dayEvents.length > 0 ? 'bg-[#cadaed] border-[#cadaed]' : isToday ? 'bg-[#d5caed] bg-opacity-40 border-[#d5caed]' : 'bg-white border-gray-200'}
            transition-colors group`}
        >
          {dayEvents.length > 0 ? (
            // Event display - takes up full box
            <div className="h-full flex flex-col">
              <div className="text-[10px] sm:text-xs font-bold text-gray-600 mb-1">
                {day}
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center px-1">
                <p className="text-xs sm:text-sm md:text-base font-bold text-gray-800 leading-tight">
                  {dayEvents[0].title}
                </p>
                {dayEvents.length > 1 && (
                  <p className="text-[10px] text-gray-600 mt-1">
                    +{dayEvents.length - 1} more
                  </p>
                )}
              </div>
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(dayEvents[0].id);
                  }}
                  className="absolute top-1 right-1 bg-red-400 text-white rounded-full w-5 h-5 
                    text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            // Empty day - just show number
            <div className="text-xs sm:text-sm font-semibold text-gray-700">
              {day}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div style={{ padding: '16px' }} className="max-w-6xl mx-auto">
      {/* Calendar Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="bg-[#d1abc3] hover:bg-[#ffb3c1] text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            ←
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="bg-[#d1abc3] hover:bg-[#ffb3c1] text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            →
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold text-gray-600 text-xs sm:text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {renderCalendar()}
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-[#dfbfdf] bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Add Event - {monthNames[currentDate.getMonth()]} {selectedDay}
            </h3>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="event title"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-[#d1abc3]"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddEvent}
                className="flex-1 bg-[#d4edca] hover:bg-[#ffb3c1] text-white font-bold py-3 rounded-lg transition-colors"
              >
                Add Event
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEventTitle('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;