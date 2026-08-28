import React, { useState, useEffect } from 'react';
import { collectionGroup, getDocs, doc, updateDoc, getDoc , onSnapshot} from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';
import {
  getShiftState,
  isPMShift,
  isApprovable,
  compareShifts,
  SHIFT_STATE_LABEL,
  SHIFT_STATE_STYLE
} from '../utils/shiftApproval.js';

import darkBrownCat from '../assets/darkbrowncat.png';
import blackCat from '../assets/blackcat.png';
import calicoCat from '../assets/calicocat.png';
import creamCat from '../assets/creamcat.png';
import grayCat from '../assets/graycat.png';
import lightBrownCat from '../assets/lightbrowncat.png';
import orangeCat from '../assets/orangecat.png';
import tuxedoCat from '../assets/tuxedocat.png';
import whiteCat from '../assets/whitecat.png';



function VolunteerHoursTracker() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('users');
  const [search, setSearch] = useState('');
  // Re-render each minute so shifts flip from "upcoming" to "awaiting approval"
  // the moment their window opens (6am for AM, noon for PM) without a reload.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const currentUser = auth.currentUser;


  const getCatImageFromPath = (photoURL) => {
        if (!photoURL) return darkBrownCat; // default
            const catMap = {
                'darkbrowncat': darkBrownCat,
                'blackcat': blackCat,
                'calicocat': calicoCat,
                'creamcat': creamCat,
                'graycat': grayCat,
                'lightbrowncat': lightBrownCat,
                'orangecat': orangeCat,
                'tuxedocat': tuxedoCat,
                'whitecat': whiteCat
            };

        const match = photoURL.match(/\/assets\/(\w+)/);
        if (match && match[1]) {
            const catName = match[1].toLowerCase();
            return catMap[catName] || darkBrownCat;
        }
        
        return darkBrownCat;
    };
  

  useEffect(() => {
  const setupListener = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists() || !userDoc.data().isAdmin) {
        setLoading(false);
        return;
      }
      
      setIsAdmin(true);

      // Set up real-time listener on shifts collection
      const shiftsQuery = collectionGroup(db, 'shifts');
      
      const unsubscribe = onSnapshot(shiftsQuery, (snapshot) => {
        const userShiftsMap = {};

        snapshot.forEach(doc => {
          const shift = doc.data();
          const shiftData = {
            id: doc.id,
            path: doc.ref.path,
            ...shift,
            date: (() => {
              const [year, month, day] = shift.date.split('-').map(Number);
              return new Date(year, month - 1, day);
            })(),
            signedUpAt: shift.signedUpAt?.toDate()
          };

          if (!userShiftsMap[shift.userEmail]) {
            userShiftsMap[shift.userEmail] = {
              email: shift.userEmail,
              name: shift.userName,
              photoURL: shift.photoURL || null,
              shifts: [],
              totalShifts: 0,
              verifiedShifts: 0,
              pendingShifts: 0,
              awaitingShifts: 0,
              upcomingShifts: 0,
              noShowShifts: 0,
              verifiedHours: 0,
              totalPossibleHours: 0
            };
          }

          userShiftsMap[shift.userEmail].shifts.push(shiftData);
          userShiftsMap[shift.userEmail].totalShifts++;
          userShiftsMap[shift.userEmail].totalPossibleHours += shift.hours || 0;

          if (shift.status === 'verified') {
            userShiftsMap[shift.userEmail].verifiedShifts++;
            userShiftsMap[shift.userEmail].verifiedHours += shift.hours || 0;
          } else if (shift.status === 'pending') {
            userShiftsMap[shift.userEmail].pendingShifts++;
            // Split pending into actionable vs not-yet-happened, so the admin
            // list can surface only what's actually approvable.
            if (isApprovable(shiftData)) {
              userShiftsMap[shift.userEmail].awaitingShifts++;
            } else {
              userShiftsMap[shift.userEmail].upcomingShifts++;
            }
          } else if (shift.status === 'no-show') {
            userShiftsMap[shift.userEmail].noShowShifts++;
          }
        });

        const usersList = Object.values(userShiftsMap);
        usersList.forEach(user => {
          user.shifts.sort((a, b) => compareShifts(a, b));
        });
        // Volunteers with shifts waiting on you float to the top.
        usersList.sort(
          (a, b) => b.awaitingShifts - a.awaitingShifts || b.totalShifts - a.totalShifts
        );

        setUsers(usersList);
        setLoading(false);
      }, (error) => {
        console.error('Error listening to shifts:', error);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up listener:', error);
      setLoading(false);
    }
  };

  const cleanup = setupListener();
  return () => {
    cleanup.then(unsubscribe => unsubscribe && unsubscribe());
  };
}, [currentUser]);

  // Sync selectedUser when users state updates
  useEffect(() => {
    if (selectedUser) {
      const updatedUser = users.find(u => u.email === selectedUser.email);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  }, [users]);

  const query = search.trim().toLowerCase();
  const filteredUsers = query
    ? users.filter(
        (u) =>
          (u.name || '').toLowerCase().includes(query) ||
          (u.email || '').toLowerCase().includes(query)
      )
    : users;

  // How many shifts across everyone are actually waiting on an admin right now.
  const totalAwaiting = users.reduce((n, u) => n + u.awaitingShifts, 0);

  const handleVerify = async (shift, newStatus) => {
  if (!isAdmin) return;

  try {
    const pathParts = shift.path.split('/');
    const userId = pathParts[1];
    const shiftId = pathParts[3];
    
    const shiftRef = doc(db, 'volunteer-logs', userId, 'shifts', shiftId);
    
    // Update Firestore - the onSnapshot listener will automatically update the UI
    await updateDoc(shiftRef, {
      status: newStatus,
      verifiedBy: currentUser.uid,
      verifiedAt: new Date()
    });
    
    console.log('✅ Shift updated successfully');
  } catch (error) {
    console.error('Error updating shift:', error);
    alert('Failed to update shift status.');
  }
};

  const exportToCSV = () => {
    const headers = ['Volunteer Name', 'Email', 'Total Shifts', 'Verified Shifts', 'Pending Shifts', 'No-Shows', 'Verified Hours', 'Completion Rate'];
    const rows = users.map(user => [
      user.name,
      user.email,
      user.totalShifts,
      user.verifiedShifts,
      user.pendingShifts,
      user.noShowShifts,
      user.verifiedHours.toFixed(1),
      ((user.verifiedShifts / user.totalShifts) * 100).toFixed(1) + '%'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volunteer-hours-summary-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportDetailedCSV = () => {
    const headers = ['Date', 'Volunteer Name', 'Email', 'Location', 'Time Slot', 'Hours', 'Status'];
    const rows = [];
    
    users.forEach(user => {
      user.shifts.forEach(shift => {
        rows.push([
          shift.date.toLocaleDateString(),
          user.name,
          user.email,
          shift.location,
          shift.timeLabel,
          shift.hours,
          shift.status
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volunteer-detailed-shifts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="c4-panel font-hand rounded-[18px] p-4">Loading...</div>;
  }

  if (!currentUser || !isAdmin) {
    return <div className="c4-panel font-hand rounded-[18px] p-4">Admin access required.</div>;
  }

  const totalStats = {
    totalVolunteers: users.length,
    totalShifts: users.reduce((sum, u) => sum + u.totalShifts, 0),
    totalVerified: users.reduce((sum, u) => sum + u.verifiedShifts, 0),
    totalPending: users.reduce((sum, u) => sum + u.pendingShifts, 0),
    totalHours: users.reduce((sum, u) => sum + u.verifiedHours, 0)
  };

  return (
    <div className="c4-panel font-hand rounded-[18px] p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h2 className="font-pix text-accent m-0 text-xl sm:text-2xl">Volunteer Hours Management</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportToCSV}
            className="c4-btn flex-1 text-sm sm:flex-none"
            style={{ background: 'var(--color-chip-4)' }}
          >
            Export Summary
          </button>
          <button
            onClick={exportDetailedCSV}
            className="c4-btn flex-1 text-sm sm:flex-none"
            style={{ background: 'var(--color-chip-3)' }}
          >
            Export Details
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div style={{ marginLeft: '16px', marginRight: '16px' }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="border-line rounded-[12px] border-[1.5px] p-3 text-center" style={{ background: 'var(--color-chip-1)' }}>
          <p className="text-xl md:text-2xl font-bold text-accent">{totalStats.totalVolunteers}</p>
          <p className="text-xs text-accent">Volunteers</p>
        </div>
        <div className="border-line rounded-[12px] border-[1.5px] p-3 text-center" style={{ background: 'var(--color-chip-3)' }}>
          <p className="text-xl md:text-2xl font-bold text-ink">{totalStats.totalShifts}</p>
          <p className="text-xs text-ink">Total Shifts</p>
        </div>
        <div className="border-line rounded-[12px] border-[1.5px] p-3 text-center" style={{ background: 'var(--color-chip-5)' }}>
          <p className="text-xl md:text-2xl font-bold text-ink">{totalStats.totalPending}</p>
          <p className="text-xs text-ink">Pending</p>
        </div>
        <div className="border-line rounded-[12px] border-[1.5px] p-3 text-center" style={{ background: 'var(--color-chip-4)' }}>
          <p className="text-xl md:text-2xl font-bold text-ink">{totalStats.totalVerified}</p>
          <p className="text-xs text-ink">Verified</p>
        </div>
        <div className="border-line rounded-[12px] border-[1.5px] p-3 text-center col-span-2 md:col-span-1" style={{ background: 'var(--color-chip-2)' }}>
          <p className="text-xl md:text-2xl font-bold text-ink">{totalStats.totalHours.toFixed(1)}</p>
          <p className="text-xs text-ink">Total Hours</p>
        </div>
      </div>

      {/* Volunteers List */}
      {!selectedUser ? (
        <div style={{ marginLeft: '16px', marginRight: '16px' }}>
          <h3 className="font-pix text-accent m-0 mb-3 text-lg">Volunteers</h3>

          <div
            className="border-line mb-3 rounded-[12px] border-[1.5px] p-3 text-center"
            style={{ background: totalAwaiting > 0 ? 'var(--color-chip-5)' : 'var(--color-soft)' }}
          >
            <p className="text-ink m-0 text-sm">
              {totalAwaiting > 0
                ? `${totalAwaiting} shift${totalAwaiting === 1 ? '' : 's'} awaiting your approval`
                : 'Nothing awaiting approval right now ♡'}
            </p>
          </div>

          <label htmlFor="volunteer-search" className="sr-only">Search volunteers</label>
          <input
            id="volunteer-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search volunteers by name or email…"
            className="c4-input mb-3"
          />

          {filteredUsers.length === 0 && (
            <p className="text-ink/70 m-0 mb-3 italic">
              {search ? `No volunteers matching "${search}"` : 'No volunteers yet'}
            </p>
          )}

          <div className="space-y-2 md:space-y-3 max-h-96 overflow-y-auto">
            {filteredUsers.map(user => (
              <div
                key={user.email}
                className="border-2 rounded-lg hover:border-accent transition-colors cursor-pointer"
                style={{
                  padding: '20px',
                  borderColor: user.awaitingShifts > 0 ? 'var(--color-accent)' : 'var(--color-line)',
                  background: user.awaitingShifts > 0 ? 'var(--color-chip-5)' : 'var(--color-panel)'
                }}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left: User Info */}
                  <div className="flex items-center gap-3 min-w-0">
                   <img 
                    src={getCatImageFromPath(user.photoURL)}
                    alt={user.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-contain bg-soft border-2 border-line flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm md:text-base lg:text-lg truncate">{user.name}</p>
                      <p className="text-xs md:text-sm text-ink/70 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Right: Stats */}
                  <div className="flex gap-4 md:gap-6 justify-around sm:justify-end">
                    <div className="text-center">
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-accent">{user.verifiedHours.toFixed(1)}</p>
                      <p className="text-xs text-ink/70">Hours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600">{user.totalShifts}</p>
                      <p className="text-xs text-ink/70">Shifts</p>
                    </div>
                    <div className="text-center">
                      <p
                        className="text-lg md:text-xl lg:text-2xl font-bold"
                        style={{ color: user.awaitingShifts > 0 ? 'var(--color-accent)' : 'var(--color-ink)' }}
                      >
                        {user.awaitingShifts}
                      </p>
                      <p className="text-xs text-ink/70">To approve</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-ink/50">{user.upcomingShifts}</p>
                      <p className="text-xs text-ink/70">Upcoming</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Individual User View */
        <div style={{ marginLeft: '16px', marginRight: '16px' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
            <button
              onClick={() => setSelectedUser(null)}
              className="text-accent hover:text-accent font-bold text-sm md:text-base"
            >
              ← Back to All Volunteers
            </button>
            <div className="flex items-center gap-3">
              <img 
                src={getCatImageFromPath(selectedUser.photoURL)}
                alt={selectedUser.name}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-contain bg-soft border-2 border-line"
              />
              <div className="min-w-0">
                <p className="font-bold text-base md:text-lg lg:text-xl truncate">{selectedUser.name}</p>
                <p className="text-xs md:text-sm text-ink/70 truncate">{selectedUser.email}</p>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="border-line rounded-[12px] border-[1.5px] p-3 text-center" style={{ background: 'var(--color-chip-1)' }}>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-accent">{selectedUser.verifiedHours.toFixed(1)}</p>
              <p className="text-xs text-accent">Verified Hours</p>
            </div>
            <div className="border-line rounded-[12px] border-[1.5px] p-3 text-center" style={{ background: 'var(--color-chip-4)' }}>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-ink">{selectedUser.verifiedShifts}</p>
              <p className="text-xs text-ink">Completed</p>
            </div>
            <div className="border-line rounded-[12px] border-[1.5px] p-3 text-center" style={{ background: 'var(--color-chip-5)' }}>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-ink">{selectedUser.pendingShifts}</p>
              <p className="text-xs text-ink">Pending</p>
            </div>
            <div style={{ padding: '16px' }} className="bg-red-100 rounded-lg text-center">
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-red-700">{selectedUser.noShowShifts}</p>
              <p className="text-xs text-red-700">No-Shows</p>
            </div>
          </div>

          {/* User Shifts — stacked cards on mobile.
              The table below needs min-w-[500px] for its five columns, which on a
              phone pushes Status and Actions off-screen behind a horizontal
              scroll. Approving a shift shouldn't require scrolling sideways, so
              small screens get one card per shift instead. */}
          <div className="max-h-96 space-y-2.5 overflow-y-auto md:hidden">
            {selectedUser.shifts.map(shift => {
              const state = getShiftState(shift, now);
              const canApprove = state === 'awaiting';
              return (
                <div
                  key={shift.id}
                  className="border-line rounded-[12px] border-[1.5px] p-3"
                  style={{
                    background: 'var(--color-panel)',
                    opacity: state === 'upcoming' ? 0.6 : 1
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-ink m-0 font-bold">{shift.date.toLocaleDateString()}</p>
                      <p className="text-ink/70 m-0 text-sm">
                        {shift.timeLabel} · {shift.hours}h
                      </p>
                    </div>
                    <span
                      className="inline-block shrink-0 rounded border px-2 py-1 text-xs font-bold whitespace-nowrap"
                      style={SHIFT_STATE_STYLE[state]}
                    >
                      {SHIFT_STATE_LABEL[state]}
                    </span>
                  </div>

                  <div className="mt-2.5 flex gap-2">
                    {shift.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleVerify(shift, 'verified')}
                          disabled={!canApprove}
                          className="flex-1 rounded-lg bg-green-500 py-2 text-sm text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ✓ approve
                        </button>
                        <button
                          onClick={() => handleVerify(shift, 'no-show')}
                          disabled={!canApprove}
                          className="flex-1 rounded-lg bg-red-500 py-2 text-sm text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ✗ no-show
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleVerify(shift, 'pending')}
                        className="border-line bg-soft text-ink flex-1 rounded-lg border py-2 text-sm"
                      >
                        ↺ reset to pending
                      </button>
                    )}
                  </div>

                  {!canApprove && shift.status === 'pending' && (
                    <p className="text-ink/60 m-0 mt-1.5 text-center text-xs">
                      unlocks {isPMShift(shift) ? 'at noon' : 'at 6am'} on the shift day
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Shifts Table — md and up */}
          <div className="hidden overflow-x-auto max-h-96 overflow-y-auto border rounded-lg md:block">
            <table className="w-full min-w-[500px]">
              <thead className="bg-soft sticky top-0">
                <tr>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Date</th>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Time</th>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Hours</th>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Status</th>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedUser.shifts.map(shift => {
                  const state = getShiftState(shift, now);
                  const canApprove = state === 'awaiting';
                  return (
                  <tr
                    key={shift.id}
                    className="border-b hover:bg-soft"
                    style={state === 'upcoming' ? { opacity: 0.6 } : undefined}
                  >
                    <td className="p-2 md:p-3 text-xs md:text-sm">{shift.date.toLocaleDateString()}</td>
                    <td className="p-2 md:p-3 text-xs md:text-sm">{shift.timeLabel}</td>
                    <td className="p-2 md:p-3 text-xs md:text-sm">{shift.hours}h</td>
                    <td className="p-2 md:p-3">
                      <span
                        className="inline-block rounded border px-2 py-1 text-xs font-bold whitespace-nowrap"
                        style={SHIFT_STATE_STYLE[state]}
                      >
                        {SHIFT_STATE_LABEL[state]}
                      </span>
                    </td>
                    <td className="p-2 md:p-3">
                      {shift.status === 'pending' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleVerify(shift, 'verified')}
                            disabled={!canApprove}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                            title={canApprove ? 'Mark as completed' : "Can't approve yet — this shift hasn't happened"}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleVerify(shift, 'no-show')}
                            disabled={!canApprove}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                            title={canApprove ? 'Mark as no-show' : "Can't approve yet — this shift hasn't happened"}
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVerify(shift, 'pending')}
                          className="bg-gray-400 hover:bg-soft0 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm transition-colors"
                          title="Reset to pending"
                        >
                          ↺
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerHoursTracker;