import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar.jsx';
import { ScallopStrip } from '../components/Decor.jsx';
import { Link } from 'react-router-dom';
import PhotoUpload from '../components/PhotoUpload.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import useIsAdmin from '../hooks/useIsAdmin.js';
import CrestLink from '../components/CrestLink.jsx';

function OurCats() {
  const { isAdmin } = useIsAdmin();
  const [selectedCat, setSelectedCat] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [catPhotoCounts, setCatPhotoCounts] = useState({});
  const [catPreviewPhotos, setCatPreviewPhotos] = useState({});

  const db = getFirestore();

  // Your campus cats
  const cats = [
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
      id: 'druid-zoned',
      name: 'Druid',
      location: 'Now up for adoption!',
      description: 'Formerly a hard-to-trap orange tabby who was often spotted on the fence'
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
    <div className="c4-gingham c4-scope font-hand min-h-screen py-6 sm:py-8">
      <header className="c4-container relative">
        <div className="c4-panel rounded-[22px] px-4 py-5 text-center sm:px-6">
          <div className="flex items-center justify-between gap-3 sm:gap-5">
            <CrestLink />
            <div className="min-w-0 flex-1 text-center">
            <h1 className="font-pix text-accent m-0 text-2xl leading-tight tracking-wide sm:text-4xl">
              ♡ our cats ♡
            </h1>
            <p className="text-ink mt-1 mb-0 text-base sm:text-lg">
              click on a cat to view their photo album!
            </p>
            </div>
            <CrestLink decorative />
          </div>
        </div>
        <ScallopStrip />
      </header>

      <NavBar startCollapsed={true} />

      {/* Desktop Navigation */}
        <div className="c4-scope hidden md:flex justify-center items-center gap-3 py-6 px-4">
            <Link to="/volunteer">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-2)' }}>
                volunteer
            </button>
            </Link>
            <Link to="/map-page">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-5)' }}>
                map
            </button>
            </Link>
            <Link to="/ourcats">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-3)' }}>
                our cats
            </button>
            </Link>
            <Link to="/feeding-instructions"> 
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-4)' }}>
                feeding instructions
            </button>
            </Link>
            <Link to="/you-page" className="col-span-2"> 
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-1)' }}>
                you
            </button>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="col-span-2">
                <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-accent)', color: 'var(--color-panel)' }}>
                  admin
                </button>
              </Link>
            )}
        </div>

        {/* Mobile Navigation */}
        <div className="c4-scope md:hidden grid grid-cols-2 gap-2.5 p-4">
            <Link to="/volunteer">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-2)' }}>
                volunteer
            </button>
            </Link>
            <Link to="/ourcats">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-3)' }}>
                our cats
            </button>
            </Link>
            <Link to="/map-page">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-5)' }}>
                map
            </button>
            </Link>
            <Link to="/you-page">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-1)' }}>
                you
            </button>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="col-span-2">
                <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-accent)', color: 'var(--color-panel)' }}>
                  admin
                </button>
              </Link>
            )}
            <Link to="/feeding-instructions" className="col-span-2">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-4)' }}>
                feeding instructions
            </button>
            </Link>
        </div>


      <div className="c4-container">
        {!selectedCat ? (
          // Cat list view
          <>
            <section className="c4-panel mb-3.5 rounded-[18px] p-4 text-center">
              <p className="text-ink m-0 text-[15px] leading-relaxed">
                {isAdmin ? (
                  <>
                    Click <a
                      href="https://docs.google.com/document/d/1wgzHosL1A4fdNLRzsXPqOYWr34kgo-abW7kcomiCr_o/edit?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-dotted underline-offset-2"
                    >
                      <span className="text-accent font-bold">here</span>
                    </a> to view our extended Cat History Book
                  </>
                ) : (
                  <>
                    Click <a
                      href="https://docs.google.com/document/d/1LaMDEzzvm5ojNlr8yrbCeP7gSRjtxAXwnU8ODxm9Dv4/edit?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-dotted underline-offset-2"
                    >
                      <span className="text-accent font-bold">here</span>
                    </a> for our extended Cat History Book
                  </>
                )}
              </p>
            </section>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {cats.map((cat) => {
                const previewPhotos = catPreviewPhotos[cat.id] || [];
                const photoCount = catPhotoCounts[cat.id] || 0;

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCat(cat)}
                    className="c4-panel cursor-pointer overflow-hidden rounded-[18px] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {/* Photo preview section with overlay name */}
                    <div className="relative">
                      {previewPhotos.length > 0 ? (
                        <div className="bg-soft grid h-40 grid-cols-3 gap-0.5 sm:h-48">
                          {previewPhotos.map((photo, index) => (
                            <div key={photo.id} className="relative overflow-hidden">
                              <img
                                src={photo.imageUrl}
                                alt={`${cat.name} preview ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                          {/* Fill empty slots with placeholder */}
                          {[...Array(Math.max(0, 3 - previewPhotos.length))].map((_, index) => (
                            <div
                              key={`empty-${index}`}
                              className="bg-soft flex h-full w-full items-center justify-center"
                            >
                              <svg className="text-line h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-soft flex h-40 items-center justify-center sm:h-48">
                          <div className="text-center">
                            <svg className="text-line mx-auto mb-2 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-ink/60 m-0 text-sm">no photos yet</p>
                          </div>
                        </div>
                      )}

                      {/* Cat name overlay - much more visible */}
                      <div
                        className="absolute top-0 right-0 left-0 p-3"
                        style={{ background: 'linear-gradient(to bottom, rgb(60 44 82 / 0.75), rgb(60 44 82 / 0.45), transparent)' }}
                      >
                        <h3 className="font-pix m-0 text-xl text-white sm:text-2xl">
                          {cat.name}
                        </h3>
                        {photoCount > 0 && (
                          <div className="bg-panel mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1">
                            <svg className="text-accent h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-ink text-sm font-bold">
                              {photoCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cat info section */}
                    <div className="p-3.5">
                      <div className="mb-2 flex items-start gap-1.5">
                        <svg className="text-accent mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-ink m-0 text-sm font-semibold sm:text-base">{cat.location}</p>
                      </div>
                      <p className="text-ink/80 m-0 mb-3 text-sm">{cat.description}</p>

                      <button
                        className="c4-btn w-full"
                        style={{ background: 'var(--color-chip-1)' }}
                      >
                        view album →
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
              className="c4-btn mb-3.5 inline-flex items-center gap-2"
              style={{ background: 'var(--color-panel)' }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              back to all cats
            </button>

            {/* Add photo button */}
            <div className="mb-3.5">
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="c4-btn inline-flex items-center gap-2"
                style={{ background: 'var(--color-chip-1)' }}
              >
                {showUploadForm ? (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    cancel
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    add photo
                  </>
                )}
              </button>
            </div>

            {/* Cat info header */}
            <div className="c4-panel mb-3.5 rounded-[18px] p-4 sm:p-5">
              <h2 className="font-pix text-accent m-0 mb-2 text-2xl sm:text-3xl">{selectedCat.name}</h2>
              <div className="mb-2 flex items-center gap-2">
                <svg className="text-accent h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="text-ink m-0 font-semibold sm:text-lg">{selectedCat.location}</p>
              </div>
              <p className="text-ink/80 m-0 sm:text-lg">{selectedCat.description}</p>
            </div>

            {/* Upload form */}
            {showUploadForm && (
              <div className="mb-3.5">
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