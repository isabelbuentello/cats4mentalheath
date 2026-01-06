import React, { useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { collection, collectionGroup, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Import cat images
import darkBrownCat from '../assets/darkbrowncat.png';
import blackCat from '../assets/blackcat.png';
import calicoCat from '../assets/calicocat.png';
import creamCat from '../assets/creamcat.png';
import grayCat from '../assets/graycat.png';
import lightBrownCat from '../assets/lightbrowncat.png';
import orangeCat from '../assets/orangecat.png';
import tuxedoCat from '../assets/tuxedocat.png';
import whiteCat from '../assets/whitecat.png';

function UserProfile() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || darkBrownCat);
  const [saving, setSaving] = useState(false);

  // Available cat avatars
  const catAvatars = [
    { id: 'darkbrown', src: darkBrownCat, name: 'Dark Brown Cat' },
    { id: 'black', src: blackCat, name: 'Black Cat' },
    { id: 'calico', src: calicoCat, name: 'Calico Cat' },
    { id: 'cream', src: creamCat, name: 'Cream Cat' },
    { id: 'gray', src: grayCat, name: 'Gray Cat' },
    { id: 'lightbrown', src: lightBrownCat, name: 'Light Brown Cat' },
    { id: 'orange', src: orangeCat, name: 'Orange Cat' },
    { id: 'tuxedo', src: tuxedoCat, name: 'Tuxedo Cat' },
    { id: 'white', src: whiteCat, name: 'White Cat' },
  ];

  // Update all feeding slots with new profile info
  const updateAllFeedingSlots = async (newDisplayName, newPhotoURL) => {
    try {
      const userEmail = user.email;
      
      // Get all days documents
      const daysQuery = collectionGroup(db, 'days');
      const daysSnapshot = await getDocs(daysQuery);

      const batch = writeBatch(db);
      let updateCount = 0;

      daysSnapshot.forEach((dayDoc) => {
        const dayData = dayDoc.data();
        const slots = dayData.slots || {};
        
        // Check if any slot belongs to this user
        let hasUserSlot = false;
        const updatedSlots = { ...slots };

        Object.entries(slots).forEach(([slotId, slot]) => {
          if (slot && slot.email === userEmail) {
            hasUserSlot = true;
            updatedSlots[slotId] = {
              ...slot,
              volunteer: newDisplayName || userEmail.split('@')[0],
              photoURL: newPhotoURL
            };
            updateCount++;
          }
        });

        // If this day has user's slots, add to batch update
        if (hasUserSlot) {
          batch.update(dayDoc.ref, { slots: updatedSlots });
        }
      });

      if (updateCount > 0) {
        await batch.commit();
        console.log(`Updated ${updateCount} feeding slots with new profile info`);
      }

      return updateCount;
    } catch (error) {
      console.error('Error updating feeding slots:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName.trim() || null,
        photoURL: selectedAvatar
      });

      // Update all feeding slots in Firestore
      const updatedCount = await updateAllFeedingSlots(
        displayName.trim() || null,
        selectedAvatar
      );

      if (updatedCount > 0) {
        alert(`Profile updated successfully! 🎉\nUpdated ${updatedCount} feeding slot${updatedCount !== 1 ? 's' : ''}.`);
      } else {
        alert('Profile updated successfully! 🎉');
      }
      
      setIsEditing(false);
      
      // Reload the page to show updated info everywhere
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || '');
    setSelectedAvatar(user?.photoURL || darkBrownCat);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
        <p className="text-gray-600">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
      <div className="flex flex-col items-center">
        {/* Profile Picture */}
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-purple-300">
            <img 
              src={selectedAvatar || darkBrownCat} 
              alt="Profile" 
              className="w-full h-full object-contain"
            />
          </div>
          {isEditing && (
            <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white rounded-full p-2 text-xs">
              ✏️
            </div>
          )}
        </div>

        {/* Avatar Selector (only in edit mode) */}
        {isEditing && (
          <div className="w-full mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Choose Your Avatar:</p>
            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg">
              {catAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.src)}
                  className={`cursor-pointer rounded-full transition-all ${
                    selectedAvatar === avatar.src
                      ? 'ring-4 ring-purple-500 bg-white'
                      : 'hover:ring-2 hover:ring-purple-300 bg-white'
                  }`}
                >
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center p-2">
                    <img 
                      src={avatar.src} 
                      alt={avatar.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="text-center w-full">
          {isEditing ? (
            // Edit mode
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                maxLength={50}
              />
            </div>
          ) : (
            // View mode
            <h2 className="text-2xl font-bold mb-2">
              {user.displayName || 'Volunteer'}
            </h2>
          )}
          
          <div className="space-y-3 mt-4">
            {/* Email (non-editable) */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-gray-800 break-words">{user.email}</p>
            </div>

            {/* Display Name (only show in view mode if exists) */}
            {!isEditing && user.displayName && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="font-semibold text-gray-800">{user.displayName}</p>
              </div>
            )}

            {/* Member Since */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="font-semibold text-gray-800">
                {user.metadata.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing ? (
          <div className="mt-6 w-full flex gap-2">
            <button 
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#d5caed] hover:bg-[#c4b5e0] disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="mt-6 w-full bg-[#d5caed] hover:bg-[#c4b5e0] text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

export default UserProfile;