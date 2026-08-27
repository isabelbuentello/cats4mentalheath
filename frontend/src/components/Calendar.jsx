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
        <div key={`empty-${i}`} className="min-h-[84px] sm:min-h-[104px]"></div>
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
          className={`group relative min-h-[84px] overflow-hidden rounded-[10px] border-[1.5px] p-1 transition-colors sm:min-h-[104px] sm:p-2
            ${isAdmin ? 'cursor-pointer' : ''}`}
          style={{
            borderColor: 'var(--color-line)',
            background:
              dayEvents.length > 0
                ? 'var(--color-chip-3)'
                : isToday
                  ? 'var(--color-chip-1)'
                  : 'var(--color-panel)'
          }}
        >
          {dayEvents.length > 0 ? (
            // Event display - takes up full box
            <div className="flex h-full flex-col">
              <div className="text-ink/70 mb-1 text-[10px] font-bold sm:text-xs">
                {day}
              </div>
              <div className="flex flex-1 flex-col items-center justify-center px-1 text-center">
                <p className="text-ink m-0 text-xs leading-tight font-bold sm:text-sm">
                  {dayEvents[0].title}
                </p>
                {dayEvents.length > 1 && (
                  <p className="text-ink/70 m-0 mt-1 text-[10px]">
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
                  aria-label={`Delete event: ${dayEvents[0].title}`}
                  className="absolute top-1 right-1 grid h-5 w-5 place-items-center text-xs leading-none opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    padding: 0,
                    borderRadius: 999,
                    border: '1.5px solid var(--color-line)',
                    background: '#e0908f',
                    color: '#fff'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            // Empty day - just show number
            <div className="text-ink/80 text-xs font-semibold sm:text-sm">
              {day}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div>
      {/* Calendar Header */}
      <div className="c4-panel rounded-[18px] p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button onClick={() => changeMonth(-1)} className="c4-btn" aria-label="Previous month">
            ←
          </button>
          <h2 className="font-pix text-accent m-0 text-xl tracking-wide sm:text-3xl">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={() => changeMonth(1)} className="c4-btn" aria-label="Next month">
            →
          </button>
        </div>

        {/* Days of Week */}
        <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-ink/70 py-2 text-center text-xs font-bold sm:text-sm">
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgb(92 70 120 / 0.55)' }}
        >
          <div className="c4-panel font-hand w-full max-w-md rounded-[18px] p-5">
            <h3 className="font-pix text-accent m-0 mb-3 text-xl">
              ★ add event — {monthNames[currentDate.getMonth()]} {selectedDay}
            </h3>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="event title"
              className="text-ink mb-4 w-full rounded-[10px] border-[1.5px] px-4 py-3 focus:outline-none"
              style={{ borderColor: 'var(--color-line)', background: 'var(--color-panel)' }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddEvent}
                className="c4-btn flex-1"
                style={{ background: 'var(--color-chip-4)' }}
              >
                add event
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEventTitle('');
                }}
                className="c4-btn flex-1"
                style={{ background: 'var(--color-soft)' }}
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;