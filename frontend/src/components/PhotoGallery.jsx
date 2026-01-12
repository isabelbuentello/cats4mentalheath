import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

function PhotoGallery({ catId, catName }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Delete photo with improved error handling
  const handleDelete = async (photo) => {
    if (!auth.currentUser) {
      alert('You must be signed in to delete photos');
      return;
    }
    
    // Only allow users to delete their own photos
    if (photo.uploadedBy !== auth.currentUser.uid) {
      alert('You can only delete your own photos');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      // Delete from Storage first
      const storagePath = photo.storagePath || `cat-photos/${catId}/${photo.id}`;
      
      try {
        const photoRef = ref(storage, storagePath);
        await deleteObject(photoRef);
        console.log('Photo deleted from storage');
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue even if storage deletion fails - Firestore deletion is more important
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'cats', catId, 'photos', photo.id));
      console.log('Photo deleted from Firestore');

      setSelectedPhoto(null);
      setDeleting(false);
      
      // Success message
      alert('Photo deleted successfully! ✓');
    } catch (error) {
      console.error('Error deleting photo:', error);
      setDeleting(false);
      alert('Failed to delete photo. Please try again or contact support.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-500"></div>
        <p className="text-gray-600 mt-4 font-medium">Loading photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-200">
        <svg className="mx-auto w-20 h-20 text-purple-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-700 text-lg font-bold mb-2">No photos yet!</p>
        <p className="text-gray-600">Be the first to share a photo of {catName} 📸</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {catName}'s Photo Album
        </h3>
        <div style={{ padding: '16px 32px' }} className="bg-purple-100 text-purple-700 font-bold rounded-full text-sm sm:text-base">
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </div>
      </div>

      {/* Photo Grid - Responsive masonry-style layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={photo.imageUrl}
                alt={photo.caption || `Photo of ${catName}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Caption preview */}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-bold line-clamp-2 drop-shadow-lg">
                    {photo.caption}
                  </p>
                </div>
              )}
            </div>
            
            {/* View icon on hover */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full-size photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-auto shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 z-10">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  {selectedPhoto.caption && (
                    <h3 className="text-lg sm:text-2xl font-bold mb-2 text-gray-800">
                      {selectedPhoto.caption}
                    </h3>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 font-medium truncate">
                        {selectedPhoto.uploadedByEmail || 'Anonymous'}
                      </span>
                    </div>
                    {selectedPhoto.uploadedAt && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {selectedPhoto.uploadedAt.toDate().toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Close button */}
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="p-4 sm:p-6">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption || `Photo of ${catName}`}
                className="w-full max-h-[60vh] object-contain rounded-lg bg-gray-50"
              />
            </div>

            {/* Delete button (only for photo owner) */}
            {auth.currentUser && selectedPhoto.uploadedBy === auth.currentUser.uid && (
              <div className="p-4 sm:p-6 pt-0">
                <button
                  onClick={() => handleDelete(selectedPhoto)}
                  disabled={deleting}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-3 sm:py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Photo
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add simple CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default PhotoGallery;