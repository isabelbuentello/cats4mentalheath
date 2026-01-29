import React, { useState, useEffect } from 'react';
import { collectionGroup, getDocs, doc, updateDoc, getDoc , onSnapshot} from 'firebase/firestore';
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



function VolunteerHoursTracker() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('users');
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
          } else if (shift.status === 'no-show') {
            userShiftsMap[shift.userEmail].noShowShifts++;
          }
        });

        const usersList = Object.values(userShiftsMap);
        usersList.forEach(user => {
          user.shifts.sort((a, b) => b.date - a.date);
        });
        usersList.sort((a, b) => b.totalShifts - a.totalShifts);

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
    return <div className="bg-white rounded-xl shadow-lg p-6">Loading...</div>;
  }

  if (!currentUser || !isAdmin) {
    return <div className="bg-white rounded-xl shadow-lg p-6">Admin access required.</div>;
  }

  const totalStats = {
    totalVolunteers: users.length,
    totalShifts: users.reduce((sum, u) => sum + u.totalShifts, 0),
    totalVerified: users.reduce((sum, u) => sum + u.verifiedShifts, 0),
    totalPending: users.reduce((sum, u) => sum + u.pendingShifts, 0),
    totalHours: users.reduce((sum, u) => sum + u.verifiedHours, 0)
  };

  return (
    <div style={{ padding: '32px', fontFamily: "'Instrument Sans', sans-serif" }} className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">Volunteer Hours Management</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportToCSV}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 md:px-4 rounded-lg transition-colors text-xs md:text-sm flex-1 sm:flex-none"
          >
            Export Summary
          </button>
          <button
            onClick={exportDetailedCSV}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 md:px-4 rounded-lg transition-colors text-xs md:text-sm flex-1 sm:flex-none"
          >
            Export Details
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div style={{ marginLeft: '16px', marginRight: '16px' }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 mb-4 md:mb-6">
        <div style={{ padding: '16px' }} className="bg-purple-100 rounded-lg text-center">
          <p className="text-xl md:text-2xl font-bold text-purple-700">{totalStats.totalVolunteers}</p>
          <p className="text-xs text-purple-700">Volunteers</p>
        </div>
        <div style={{ padding: '16px' }} className="bg-blue-100 rounded-lg text-center">
          <p className="text-xl md:text-2xl font-bold text-blue-700">{totalStats.totalShifts}</p>
          <p className="text-xs text-blue-700">Total Shifts</p>
        </div>
        <div style={{ padding: '16px' }} className="bg-yellow-100 rounded-lg text-center">
          <p className="text-xl md:text-2xl font-bold text-yellow-700">{totalStats.totalPending}</p>
          <p className="text-xs text-yellow-700">Pending</p>
        </div>
        <div style={{ padding: '16px' }} className="bg-green-100 rounded-lg text-center">
          <p className="text-xl md:text-2xl font-bold text-green-700">{totalStats.totalVerified}</p>
          <p className="text-xs text-green-700">Verified</p>
        </div>
        <div style={{ padding: '16px' }} className="bg-pink-100 rounded-lg text-center col-span-2 md:col-span-1">
          <p className="text-xl md:text-2xl font-bold text-pink-700">{totalStats.totalHours.toFixed(1)}</p>
          <p className="text-xs text-pink-700">Total Hours</p>
        </div>
      </div>

      {/* Volunteers List */}
      {!selectedUser ? (
        <div style={{ marginLeft: '16px', marginRight: '16px' }}>
          <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Volunteers</h3>
          <div className="space-y-2 md:space-y-3 max-h-96 overflow-y-auto">
            {users.map(user => (
              <div
                key={user.email}
                style={{ padding: '20px' }}
                className="border-2 border-gray-200 rounded-lg hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left: User Info */}
                  <div className="flex items-center gap-3 min-w-0">
                   <img 
                    src={getCatImageFromPath(user.photoURL)}
                    alt={user.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-contain bg-gray-100 border-2 border-gray-300 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm md:text-base lg:text-lg truncate">{user.name}</p>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Right: Stats */}
                  <div className="flex gap-4 md:gap-6 justify-around sm:justify-end">
                    <div className="text-center">
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-purple-600">{user.verifiedHours.toFixed(1)}</p>
                      <p className="text-xs text-gray-600">Hours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600">{user.totalShifts}</p>
                      <p className="text-xs text-gray-600">Shifts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-yellow-600">{user.pendingShifts}</p>
                      <p className="text-xs text-gray-600">Pending</p>
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
              className="text-purple-600 hover:text-purple-700 font-bold text-sm md:text-base"
            >
              ← Back to All Volunteers
            </button>
            <div className="flex items-center gap-3">
              <img 
                src={getCatImageFromPath(selectedUser.photoURL)}
                alt={selectedUser.name}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-contain bg-gray-100 border-2 border-purple-300"
              />
              <div className="min-w-0">
                <p className="font-bold text-base md:text-lg lg:text-xl truncate">{selectedUser.name}</p>
                <p className="text-xs md:text-sm text-gray-600 truncate">{selectedUser.email}</p>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
            <div style={{ padding: '16px' }} className="bg-purple-100 rounded-lg text-center">
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-700">{selectedUser.verifiedHours.toFixed(1)}</p>
              <p className="text-xs text-purple-700">Verified Hours</p>
            </div>
            <div style={{ padding: '16px' }} className="bg-green-100 rounded-lg text-center">
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-700">{selectedUser.verifiedShifts}</p>
              <p className="text-xs text-green-700">Completed</p>
            </div>
            <div style={{ padding: '16px' }} className="bg-yellow-100 rounded-lg text-center">
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-700">{selectedUser.pendingShifts}</p>
              <p className="text-xs text-yellow-700">Pending</p>
            </div>
            <div style={{ padding: '16px' }} className="bg-red-100 rounded-lg text-center">
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-red-700">{selectedUser.noShowShifts}</p>
              <p className="text-xs text-red-700">No-Shows</p>
            </div>
          </div>

          {/* User Shifts Table */}
          <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Date</th>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Time</th>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Hours</th>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Status</th>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedUser.shifts.map(shift => (
                  <tr key={shift.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 md:p-3 text-xs md:text-sm">{shift.date.toLocaleDateString()}</td>
                    <td className="p-2 md:p-3 text-xs md:text-sm">{shift.timeLabel}</td>
                    <td className="p-2 md:p-3 text-xs md:text-sm">{shift.hours}h</td>
                    <td className="p-2 md:p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        shift.status === 'verified' ? 'bg-green-100 text-green-700' :
                        shift.status === 'no-show' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {shift.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2 md:p-3">
                      {shift.status === 'pending' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleVerify(shift, 'verified')}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm transition-colors"
                            title="Mark as completed"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleVerify(shift, 'no-show')}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm transition-colors"
                            title="Mark as no-show"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVerify(shift, 'pending')}
                          className="bg-gray-400 hover:bg-gray-500 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm transition-colors"
                          title="Reset to pending"
                        >
                          ↺
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerHoursTracker;