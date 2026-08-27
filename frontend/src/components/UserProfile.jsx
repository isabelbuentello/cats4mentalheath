import React, { useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { collectionGroup, getDocs, writeBatch, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Import cat images
import darkbrowncat from '../assets/darkbrowncat.png';
import blackcat from '../assets/blackcat.png';
import calicocat from '../assets/calicocat.png';
import creamcat from '../assets/creamcat.png';
import graycat from '../assets/graycat.png';
import lightbrowncat from '../assets/lightbrowncat.png';
import orangecat from '../assets/orangecat.png';
import tuxedocat from '../assets/tuxedocat.png';
import whitecat from '../assets/whitecat.png';

function UserProfile() {
  const auth = getAuth();
  const user = auth.currentUser;

  // Helper to convert stored path to actual image
  const getCatImageFromPath = (photoURL) => {
    if (!photoURL) return darkbrowncat;
    
    const catMap = {
      'darkbrowncat': darkbrowncat,
      'darkbrown': darkbrowncat,
      'blackcat': blackcat,
      'black': blackcat,
      'calicocat': calicocat,
      'calico': calicocat,
      'creamcat': creamcat,
      'cream': creamcat,
      'graycat': graycat,
      'gray': graycat,
      'lightbrowncat': lightbrowncat,
      'lightbrown': lightbrowncat,
      'orangecat': orangecat,
      'orange': orangecat,
      'tuxedocat': tuxedocat,
      'tuxedo': tuxedocat,
      'whitecat': whitecat,
      'white': whitecat
    };

    // Handle /assets/catname.png format
    const match = photoURL.match(/\/assets\/(\w+)/);
    if (match && match[1]) {
      const catName = match[1].toLowerCase();
      return catMap[catName] || darkbrowncat;
    }
    
    return darkbrowncat;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || "/assets/darkbrowncat.png");
  const [saving, setSaving] = useState(false);

  // Available cat avatars
  const catAvatars = [
    { id: 'darkbrown', src: darkbrowncat, name: 'Dark Brown Cat', path: '/assets/darkbrowncat.png' },
    { id: 'black', src: blackcat, name: 'Black Cat', path: '/assets/blackcat.png' },
    { id: 'calico', src: calicocat, name: 'Calico Cat', path: '/assets/calicocat.png' },
    { id: 'cream', src: creamcat, name: 'Cream Cat', path: '/assets/creamcat.png' },
    { id: 'gray', src: graycat, name: 'Gray Cat', path: '/assets/graycat.png' },
    { id: 'lightbrown', src: lightbrowncat, name: 'Light Brown Cat', path: '/assets/lightbrowncat.png' },
    { id: 'orange', src: orangecat, name: 'Orange Cat', path: '/assets/orangecat.png' },
    { id: 'tuxedo', src: tuxedocat, name: 'Tuxedo Cat', path: '/assets/tuxedocat.png' },
    { id: 'white', src: whitecat, name: 'White Cat', path: '/assets/whitecat.png' },
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

    // Update the Firestore users doc. This is the source of truth for the
    // weekly calendar, admin panel, and hours tracker — without this write it
    // keeps whatever DEFAULT_AVATAR was set at signup, so everywhere except
    // the leaderboard (which reads slot.photoURL) shows the default cat.
    await setDoc(
      doc(db, 'users', user.uid),
      {
        displayName: displayName.trim() || null,
        photoURL: selectedAvatar
      },
      { merge: true }
    );

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
    
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to update profile. Please try again.');
  } finally {
    setSaving(false);
  }
};

  const handleCancel = () => {
    setDisplayName(user?.displayName || '');
    setSelectedAvatar(user?.photoURL || "/assets/darkbrowncat.png");
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="c4-panel font-hand rounded-[18px] p-4 text-center">
        <p className="text-ink/70">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="c4-panel font-hand rounded-[18px] p-4">
      <div className="flex flex-col items-center">
        {/* Profile Picture */}
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-line">
            <img 
              src={getCatImageFromPath(selectedAvatar)} 
              alt="Profile" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Avatar Selector (only in edit mode) */}
        {isEditing && (
          <div className="w-full mb-4">
            <p className="text-sm font-semibold text-ink mb-3 text-center">Choose Your Avatar:</p>
            <div className="flex justify-center pb-8">
              <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto p-4 bg-soft rounded-lg">
                {catAvatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.path)}
                    className={`cursor-pointer rounded-full transition-all ${
                      selectedAvatar === avatar.path
                        ? 'ring-4 ring-accent bg-white'
                        : 'hover:ring-2 hover:ring-line bg-white'
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
          </div>
        )}

        {/* User Info */}
        <div className="text-center w-full">
          {isEditing ? (
            // Edit mode
            <div className="mb-4">
              <label className="block text-sm font-semibold text-ink mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-center"
                maxLength={50}
              />
            </div>
          ) : (
            // View mode
            <h2 className="font-pix text-accent m-0 mb-2 text-xl sm:text-2xl">
              {user.displayName || 'Volunteer'}
            </h2>
          )}
          
          <div className="space-y-3 mt-4">
            {/* Email (non-editable) */}
            <div className="bg-soft rounded-lg p-3">
              <p className="text-sm text-ink/70 mb-1">Email</p>
              <p className="font-semibold text-ink break-words">{user.email}</p>
            </div>

            {/* Display Name (only show in view mode if exists) */}
            {!isEditing && user.displayName && (
              <div className="bg-soft rounded-lg p-3">
                <p className="text-sm text-ink/70 mb-1">Name</p>
                <p className="font-semibold text-ink">{user.displayName}</p>
              </div>
            )}

            {/* Member Since */}
            <div className="bg-soft rounded-lg p-3">
              <p className="text-sm text-ink/70 mb-1">Member Since</p>
              <p className="font-semibold text-ink">
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
        <div style={{ padding: '24px 16px 12px 16px' }} className="w-full">
          {isEditing ? (
            <div className="flex gap-2">
              <button 
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 bg-soft hover:bg-soft disabled:bg-soft text-ink font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="c4-btn flex-1"
                style={{ background: 'var(--color-accent)', color: 'var(--color-panel)' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="c4-btn w-full"
              style={{ background: 'var(--color-chip-1)' }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;