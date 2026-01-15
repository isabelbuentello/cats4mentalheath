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

  // Your campus cats
  const cats = [
    {
      id: 'druid-zoned',
      name: 'Druid',
      location: 'Zone D Parking Lot',
      description: 'Hard-to-trap orange tabby often spotted on the fence'
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
      description: "Grumpy looking little tabby with white socks"
    },
    {
      id: 'margot-law',
      name: 'Margot',
      location: 'Law Center across The Nook',
      description: 'Almost-social sweet little brown and black tabby'
    },
    {
      id: 'mo-eob',
      name: 'Mo',
      location: 'Equal Opportunity Building',
      description: 'Black spots with white coat and funny mustache'
    },
    {
      id: 'friday-zoned',
      name: 'Friday the 13th',
      location: 'Zone D Parking Lot',
      description: 'Gorgeous black cat spotted once every blue moon'
    },
    {
      id: 'natasha-lofts',
      name: 'Natasha',
      location: 'Moody Towers',
      description: 'Brown and white tabby with a considerable amount of children'
    },
    {
      id: 'ruth-lofts',
      name: 'Ruth',
      location: 'Law Center near Lofts',
      description: "Polite brown tabby who won't yell at you to hurry up feeding"
    },
    {
      id: 'enid-lawcenter',
      name: 'Enid',
      location: 'Law Center across The Nook',
      description: "Grey little tabby with nicely done eyeliner"
    }
  ];

  // Load photo previews for each cat
  useEffect(() => {
    const unsubscribers = [];

    cats.forEach((cat) => {
      const photosRef = collection(db, 'cats', cat.id, 'photos');
      const q = query(photosRef, orderBy('uploadedAt', 'desc'), limit(3));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const photosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setCatPhotoCounts(prev => ({
          ...prev,
          [cat.id]: snapshot.size
        }));

        setCatPreviewPhotos(prev => ({
          ...prev,
          [cat.id]: photosData
        }));
      }, (error) => {
        console.error(`Error loading photos for ${cat.name}:`, error);
      });

      unsubscribers.push(unsubscribe);
    });

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
            Sign Up
          </button>
        </Link>
        <Link to="/map-page">
          <button className="text-2xl text-white font-bold bg-[#ede0ca] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
            Map
          </button>
        </Link>
        <Link to="/ourcats">
          <button className="text-2xl text-white font-bold bg-[#cadaed] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
            Our Cats
          </button>
        </Link>
        <Link to="/feeding-instructions"> 
          <button className="text-2xl text-white font-bold bg-[#d4edca] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
            Feeding Instructions
          </button>
        </Link>
        <Link to="/you-page" className="col-span-2"> 
          <button className="bg-[#d5caed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            You
          </button>
        </Link>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden grid grid-cols-2 gap-4 p-4">
        <Link to="/volunteer">
          <button className="bg-[#d1abc3] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            Sign Up
          </button>
        </Link>
        <Link to="/ourcats">
          <button className="bg-[#cadaed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            Our Cats
          </button>
        </Link>
        <Link to="/map-page">
          <button className="bg-[#ede0ca] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            Map
          </button>
        </Link>
        <Link to="/you-page">
          <button className="bg-[#d5caed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            You
          </button>
        </Link>
        <Link to="/feeding-instructions" className="col-span-2">
          <button className="bg-[#d4edca] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
            Feeding Instructions
          </button>
        </Link>
      </div>

      <h1 className='greeting'>Our Cats</h1>

      <div style={{ padding: '16px' }} className="max-w-7xl mx-auto">
        {!selectedCat ? (
          // Cat list view
          <>
            <p className="text-center text-gray-700 mb-8 text-lg" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              Click on a cat to view their photo album! 📸
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {cats.map((cat) => {
                const previewPhotos = catPreviewPhotos[cat.id] || [];
                const photoCount = catPhotoCounts[cat.id] || 0;

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCat(cat)}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                  >
                    {/* Photo preview section with overlay name */}
                    <div className="relative">
                      {previewPhotos.length > 0 ? (
                        <div className="grid grid-cols-3 gap-0.5 h-40 sm:h-48 bg-gray-100">
                          {previewPhotos.map((photo, index) => (
                            <div key={photo.id} className="relative overflow-hidden">
                              <img
                                src={photo.imageUrl}
                                alt={`${cat.name} preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {/* Fill empty slots with placeholder */}
                          {[...Array(Math.max(0, 3 - previewPhotos.length))].map((_, index) => (
                            <div
                              key={`empty-${index}`}
                              className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                            >
                              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-40 sm:h-48 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                          <div className="text-center">
                            <svg className="mx-auto w-16 h-16 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-400 text-sm font-medium">No photos yet</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Cat name overlay - much more visible */}
                      <div style={{ padding: '20px' }} className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent">
                        <h3 className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg">
                          {cat.name}
                        </h3>
                        {photoCount > 0 && (
                          <div style={{ padding: '8px 12px' }} className="mt-1 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-bold text-gray-700">
                              {photoCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cat info section */}
                    <div style={{ padding: '24px' }} className="sm:p-5">
                      <div className="flex items-start gap-2 mb-3">
                        <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-gray-600 font-medium text-sm sm:text-base">{cat.location}</p>
                      </div>
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{cat.description}</p>
                      
                      <button className="w-full bg-gradient-to-r from-[#d5caed] to-[#c4b5e0] hover:from-[#c4b5e0] hover:to-[#b3a4cf] text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">
                        View Album →
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
              className="mb-6 inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Cats
            </button>

            {/* Add photo button */}
            <div className="mb-8">
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#d5caed] to-[#c4b5e0] hover:from-[#c4b5e0] hover:to-[#b3a4cf] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                {showUploadForm ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Photo
                  </>
                )}
              </button>
            </div>

            {/* Cat info header */}
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 mb-8" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-gray-800">{selectedCat.name}</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 40 40">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-gray-600 font-medium text-base sm:text-lg">{selectedCat.location}</p>
                  </div>
                  <p className="text-gray-700 text-base sm:text-lg">{selectedCat.description}</p>
                </div>
              </div>
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