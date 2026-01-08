import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';
import darkBrownCat from '../assets/darkbrowncat.png';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const currentUser = auth.currentUser;

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

  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to revoke approval for this user?')) {
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        isApproved: false,
        approvedAt: null,
        approvedBy: null
      });
      
      alert('User approval revoked. ❌');
      await fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to revoke approval.');
    }
  };

  const handleToggleAdmin = async (userId, currentAdminStatus) => {
    if (!confirm(`Are you sure you want to ${currentAdminStatus ? 'remove' : 'grant'} admin privileges?`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: !currentAdminStatus
      });
      
      alert(`Admin status updated! ${!currentAdminStatus ? '👑' : '👤'}`);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Failed to update admin status.');
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
    <div className="bg-white rounded-xl shadow-lg p-6" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
      <h2 className="text-3xl font-bold mb-6"> Admin Panel</h2>

      {/* Pending Approvals */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4 text-orange-600">
          Pending Approvals ({pendingUsers.length})
        </h3>
        
        {pendingUsers.length === 0 ? (
          <p className="text-gray-600 italic">No pending approvals</p>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div key={user.uid} className="border-2 border-orange-300 bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.photoURL || darkBrownCat} 
                      alt={user.displayName || 'User'}
                      className="w-12 h-12 rounded-full object-contain bg-white border-2 border-orange-300"
                    />
                    <div>
                      <p className="font-bold">{user.displayName || 'No Name'}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Applied: {user.appliedAt ? new Date(user.appliedAt.toDate()).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(user.uid)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      ✓ Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Users */}
      <div>
        <h3 className="text-2xl font-bold mb-4 text-green-600">
          Approved Volunteers ({approvedUsers.length})
        </h3>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {approvedUsers.map(user => (
            <div key={user.uid} className="border border-gray-300 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.photoURL || darkBrownCat} 
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full object-contain bg-white border-2 border-gray-300"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{user.displayName || 'No Name'}</p>
                      {user.isAdmin && <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">ADMIN</span>}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Approved: {user.approvedAt ? new Date(user.approvedAt.toDate()).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {user.uid !== currentUser.uid && (
                    <>
                      <button
                        onClick={() => handleToggleAdmin(user.uid, user.isAdmin)}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                      >
                        {user.isAdmin ? ' Remove Admin' : ' Make Admin'}
                      </button>
                      <button
                        onClick={() => handleReject(user.uid)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                      >
                        ✗ Revoke
                      </button>
                    </>
                  )}
                  {user.uid === currentUser.uid && (
                    <span className="text-sm text-gray-500 italic">(You)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;