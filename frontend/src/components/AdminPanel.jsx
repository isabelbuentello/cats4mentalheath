import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
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

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPending, setShowPending] = useState(true);
  const [showApproved, setShowApproved] = useState(true);
  const currentUser = auth.currentUser;

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
    const checkAdmin = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true);
          await fetchUsers();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      
      // Sort: pending first, then approved, then by email
      usersList.sort((a, b) => {
        if (a.isApproved !== b.isApproved) {
          return a.isApproved ? 1 : -1;
        }
        return (a.email || '').localeCompare(b.email || '');
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: currentUser.uid
      });
      
      alert('User approved! ✅');
      await fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const isAdmin = newRole === 'admin';
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: isAdmin
      });
      
      await fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Please sign in to access the admin panel.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">You do not have admin privileges.</p>
      </div>
    );
  }

  const pendingUsers = users.filter(u => !u.isApproved);
  const approvedUsers = users.filter(u => u.isApproved);

  return (
    <div style={{ padding: '32px', fontFamily: "'Instrument Sans', sans-serif" }} className="bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Admin Panel</h2>

      {/* Pending Approvals */}
      <div className="mb-8">
        <button
          onClick={() => setShowPending(!showPending)}
          className="w-full flex items-center justify-between text-xl md:text-2xl font-bold mb-4 text-orange-600 hover:text-orange-700 transition-colors"
        >
          <span>Pending Approvals ({pendingUsers.length})</span>
          <span className="text-2xl">{showPending ? '▼' : '▶'}</span>
        </button>
        
        {showPending && (
          <>
            {pendingUsers.length === 0 ? (
          <p className="text-gray-600 italic">No pending approvals</p>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div key={user.uid} className="border-2 border-orange-300 bg-orange-50 rounded-lg p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={getCatImageFromPath(user.photoURL)} 
                      alt={user.displayName || 'User'}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-contain bg-white border-2 border-orange-300 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm md:text-base truncate">{user.displayName || 'No Name'}</p>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Applied: {user.appliedAt ? new Date(user.appliedAt.toDate()).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApprove(user.uid)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm md:text-base w-full sm:w-auto flex-shrink-0"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>

      {/* Approved Users */}
      <div>
        <button
          onClick={() => setShowApproved(!showApproved)}
          className="w-full flex items-center justify-between text-xl md:text-2xl font-bold mb-4 text-green-600 hover:text-green-700 transition-colors"
        >
          <span>Approved Volunteers ({approvedUsers.length})</span>
          <span className="text-2xl">{showApproved ? '▼' : '▶'}</span>
        </button>
        
        {showApproved && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {approvedUsers.map(user => (
              <div key={user.uid} className="border border-gray-300 rounded-lg p-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={getCatImageFromPath(user.photoURL)} 
                      alt={user.displayName || 'User'}
                      className="w-10 h-10 rounded-full object-contain bg-white border-2 border-gray-300 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm md:text-base">{user.displayName || 'No Name'}</p>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Approved: {user.approvedAt ? new Date(user.approvedAt.toDate()).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {user.uid !== currentUser.uid ? (
                    <select
                      value={user.isAdmin ? 'admin' : 'volunteer'}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                      className="bg-white border-2 border-purple-500 text-purple-700 font-bold py-1 px-2 rounded text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 flex-shrink-0"
                    >
                      <option value="volunteer">Approved Volunteer</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className="text-sm text-gray-500 italic">(You)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;