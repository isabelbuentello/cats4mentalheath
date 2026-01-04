import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar.jsx';
import { Link } from 'react-router-dom';
import PhotoUpload from '../components/PhotoUpload.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

function OurCats() {
  const [selectedCat, setSelectedCat] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [catPhotoCounts, setCatPhotoCounts] = useState({});
  const [catPreviewPhotos, setCatPreviewPhotos] = useState({});

  const db = getFirestore();

  // Your campus cats - add actual cat data here
  const cats = [
    {
      id: 'druid-zoned',
      name: 'Druid',
      location: 'Equal Opportunity Building',
      description: 'Friendly orange tabby who loves chin scratches'
    },
    {
      id: 'mrclaude-eob',
      name: 'Mr. Claude',
      location: 'Equal Opportunity Building',
      description: 'Spherical squatter of the EOB with piercing eyes'
    },
    {
      id: 'artificer-zoned',
      name: 'Artificer',
      location: 'Zone D Parking Lot',
      description: 'Black cat, very shy but sweet'
    },
    {
      id: 'margot-law',
      name: 'Margot',
      location: 'Zone D Parking Lot',
      description: 'Calico with beautiful markings'
    },
    {
      id: 'mo-eob',
      name: 'Mo',
      location: 'Law Center across The Nook',
      description: 'Striped tabby with lots of energy'
    },
    {
      id: 'friday-zoned',
      name: 'Friday the 13th',
      location: 'Law Center across The Nook',
      description: 'Tortoiseshell cat, loves to nap'
    },
    {
      id: 'natasha-lofts',
      name: 'Natasha',
      location: 'Law Center near Lofts',
      description: 'Gray cat with green eyes'
    },
    {
      id: 'ruth-lofts',
      name: 'Ruth',
      location: 'Law Center near Lofts',
      description: 'Large orange tom cat'
    },
    {
      id: 'enid-lawcenter',
      name: 'Enid',
      location: 'Law Center across The Nook',
      description: 'Large orange tom cat'
    }
  ];

  // Load photo previews for each cat
  useEffect(() => {
    const unsubscribers = [];

    cats.forEach((cat) => {
      // Get the 3 most recent photos for preview
      const photosRef = collection(db, 'cats', cat.id, 'photos');
      const q = query(photosRef, orderBy('uploadedAt', 'desc'), limit(3));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const photos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setCatPreviewPhotos(prev => ({
          ...prev,
          [cat.id]: photos
        }));

        setCatPhotoCounts(prev => ({
          ...prev,
          [cat.id]: snapshot.size
        }));
      });

      unsubscribers.push(unsubscribe);
    });

    // Cleanup listeners on unmount
    return () => unsubscribers.forEach(unsub => unsub());
  }, [db]);

  const handleUploadComplete = () => {
    setShowUploadForm(false);
  };

  return (
    <div className="min-h-screen bg-[#dfbfdf]">
      <NavBar startCollapsed={true} />

      {/* Spacer div */}
      <div className="h-3 sm:h-4 md:h-10 lg:h-14"></div>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-center items-center gap-8 py-8 px-4">
        <Link to="/volunteer">
          <button className="text-2xl text-white font-bold bg-[#d1abc3] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
            signup
          </button>
        </Link>
        <Link to="/map-page">
          <button className="text-2xl text-white font-bold bg-[#ede0ca] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
            map
          </button>
        </Link>
        <Link to="/ourcats">
          <button className="text-2xl text-white font-bold bg-[#cadaed] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
            our cats
          </button>
        </Link>
        <Link to="/feeding-instructions"> 
          <button className="text-2xl text-white font-bold bg-[#d4edca] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
            feeding instructions
          </button>
        </Link>
        <Link to="/you-page" className="col-span-2"> 
          <button className="bg-[#d5caed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            you
          </button>
        </Link>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden grid grid-cols-2 gap-4 p-4">
        <Link to="/volunteer">
          <button className="bg-[#d1abc3] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            signup
          </button>
        </Link>
        <Link to="/ourcats">
          <button className="bg-[#cadaed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            our cats
          </button>
        </Link>
        <Link to="/map-page">
          <button className="bg-[#ede0ca] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            map
          </button>
        </Link>
        <Link to="/you-page">
          <button className="bg-[#d5caed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            you
          </button>
        </Link>
        <Link to="/feeding-instructions" className="col-span-2">
          <button className="bg-[#d4edca] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            feeding instructions
          </button>
        </Link>
      </div>

      <h1 className='greeting'>our cats</h1>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!selectedCat ? (
          // Cat list view
          <>
            <p className="text-center text-gray-700 mb-8" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              Click on a cat to view their photo album!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cats.map((cat) => {
                const previewPhotos = catPreviewPhotos[cat.id] || [];
                const photoCount = catPhotoCounts[cat.id] || 0;

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCat(cat)}
                    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                  >
                    {/* Photo preview section */}
                    {previewPhotos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-1 h-32 bg-gray-100">
                        {previewPhotos.map((photo, index) => (
                          <img
                            key={photo.id}
                            src={photo.imageUrl}
                            alt={`${cat.name} preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ))}
                        {/* Fill empty slots with placeholder */}
                        {[...Array(3 - previewPhotos.length)].map((_, index) => (
                          <div
                            key={`empty-${index}`}
                            className="w-full h-full bg-gray-200 flex items-center justify-center"
                          >
                            <span className="text-gray-400 text-2xl">📷</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-32 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-gray-400 text-3xl mb-2">📷</p>
                          <p className="text-gray-500 text-sm">No photos yet</p>
                        </div>
                      </div>
                    )}

                    {/* Cat info section */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                      <p className="text-gray-600 mb-2">📍 {cat.location}</p>
                      <p className="text-gray-700 text-sm mb-3">{cat.description}</p>
                      
                      {/* Photo count */}
                      {photoCount > 0 && (
                        <p className="text-sm text-gray-500 mb-3">
                          {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                        </p>
                      )}

                      <button className="w-full bg-[#d5caed] hover:bg-[#c4b5e0] text-white font-bold py-2 rounded-lg transition-colors">
                        View Photo Album
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // Individual cat photo album view
          <>
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedCat(null);
                setShowUploadForm(false);
              }}
              className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors"
            >
              ← Back to All Cats
            </button>

            {/* Cat info header */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              <h2 className="text-3xl font-bold mb-2">{selectedCat.name}</h2>
              <p className="text-gray-600 mb-2">📍 {selectedCat.location}</p>
              <p className="text-gray-700">{selectedCat.description}</p>
            </div>

            {/* Add photo button */}
            <div className="mb-8">
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="bg-[#d5caed] hover:bg-[#c4b5e0] text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {showUploadForm ? 'Cancel' : '📸 Add Photo'}
              </button>
            </div>

            {/* Upload form */}
            {showUploadForm && (
              <div className="mb-8">
                <PhotoUpload
                  catId={selectedCat.id}
                  catName={selectedCat.name}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            )}

            {/* Photo gallery */}
            <PhotoGallery
              catId={selectedCat.id}
              catName={selectedCat.name}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default OurCats;