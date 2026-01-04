import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

function PhotoGallery({ catId, catName }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const db = getFirestore();
  const storage = getStorage();
  const auth = getAuth();

  useEffect(() => {
    // Real-time listener for photos
    const photosRef = collection(db, 'cats', catId, 'photos');
    const q = query(photosRef, orderBy('uploadedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPhotos(photosData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading photos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [catId, db]);

  // Delete photo
  const handleDelete = async (photo) => {
    if (!auth.currentUser) return;
    
    // Only allow users to delete their own photos
    if (photo.uploadedBy !== auth.currentUser.uid) {
      alert('You can only delete your own photos');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      // Delete from Storage
      const photoRef = ref(storage, photo.imageUrl);
      await deleteObject(photoRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'cats', catId, 'photos', photo.id));

      alert('Photo deleted successfully');
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl">
        <p className="text-gray-600 mb-2">No photos yet!</p>
        <p className="text-sm text-gray-500">Be the first to share a photo of {catName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">{catName}'s Photo Album ({photos.length})</h3>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.imageUrl}
              alt={photo.caption || `Photo of ${catName}`}
              className="w-full h-48 object-cover"
            />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                {photo.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for full-size photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{selectedPhoto.caption || 'Photo'}</h3>
                  <p className="text-sm text-gray-600">
                    Uploaded by {selectedPhoto.uploadedByEmail}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedPhoto.uploadedAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption || `Photo of ${catName}`}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />

              {/* Delete button (only for photo owner) */}
              {auth.currentUser && selectedPhoto.uploadedBy === auth.currentUser.uid && (
                <button
                  onClick={() => handleDelete(selectedPhoto)}
                  className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Delete Photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoGallery;