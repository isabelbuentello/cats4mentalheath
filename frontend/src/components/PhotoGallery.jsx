import { useState, useEffect } from 'react';
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
      <div className="c4-panel rounded-[18px] py-10 text-center">
        <div className="border-soft border-t-accent inline-block h-12 w-12 animate-spin rounded-full border-4"></div>
        <p className="font-pix text-accent mt-3 mb-0 text-lg">loading photos…</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="bg-soft border-line rounded-[18px] border-2 border-dashed py-10 text-center">
        <svg className="text-line mx-auto mb-3 h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="font-pix text-accent m-0 mb-1 text-lg">no photos yet!</p>
        <p className="text-ink m-0">Be the first to share a photo of {catName} 📸</p>
      </div>
    );
  }

  return (
    <div className="c4-panel font-hand rounded-[18px] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-pix text-accent m-0 text-xl sm:text-2xl">
          {catName}'s photo album
        </h3>
        <div
          className="border-line text-ink rounded-full border-[1.5px] px-4 py-1.5 text-sm font-bold"
          style={{ background: 'var(--color-chip-1)' }}
        >
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </div>
      </div>

      {/* Photo Grid - Responsive masonry-style layout */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group border-line bg-panel relative cursor-pointer overflow-hidden rounded-[12px] border-[1.5px] transition-transform duration-300 hover:-translate-y-0.5"
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
            <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="bg-panel border-line rounded-full border p-2">
                <svg className="text-accent h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full-size photo - True Polaroid Style */}
      {selectedPhoto && (
        <div
          className="c4-scope animate-fadeIn fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ background: 'rgb(60 44 82 / 0.6)' }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative mx-4 w-full max-w-2xl">
            {/* Close button - Top Right */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="bg-panel border-line text-accent absolute -top-4 -right-4 z-20 rounded-full border-[1.5px] p-3"
              style={{ padding: '10px' }}
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Polaroid card */}
            <div
              className="c4-panel font-hand animate-slideUp relative rounded-[18px]"
              style={{ padding: '20px 20px 32px 20px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image container with delete button */}
              <div className="bg-soft border-line relative mb-4 rounded-[12px] border overflow-hidden">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.caption || `Photo of ${catName}`}
                  className="w-full max-h-[55vh] object-contain"
                />
                
                {/* Delete button - Bottom Right of photo (only for photo owner) */}
                {auth.currentUser && selectedPhoto.uploadedBy === auth.currentUser.uid && (
                  <button
                    onClick={() => handleDelete(selectedPhoto)}
                    disabled={deleting}
                    className="absolute right-3 bottom-3 rounded-full text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ padding: '10px', border: '1.5px solid var(--color-line)', background: '#d97b7b' }}
                    title="Delete photo"
                  >
                    {deleting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {/* Polaroid-style caption area at bottom */}
              <div className="space-y-2 text-center">
                {/* Caption */}
                {selectedPhoto.caption && (
                  <h3 className="text-ink m-0 text-xl font-bold sm:text-2xl">
                    {selectedPhoto.caption}
                  </h3>
                )}

                {/* User and date info */}
                <div className="text-ink/70 flex flex-col items-center justify-center gap-2 text-sm sm:flex-row sm:gap-4">
                  <div className="flex items-center gap-2">
                    <svg className="text-accent h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">
                      {selectedPhoto.uploadedByEmail || 'Anonymous'}
                    </span>
                  </div>
                  {selectedPhoto.uploadedAt && (
                    <div className="flex items-center gap-2">
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
            </div>
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