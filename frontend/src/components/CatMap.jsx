import { useEffect, useRef } from 'react';
import mapThumbnail from '../assets/mapthumbnail.png';

function CatMapWithMarkers() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const feedingLocations = [
    {
      id: 1,
      name: 'Equal Opportunity Building',
      position: { lat: 29.718734, lng: -95.344658 },
      cats: ['Mo', 'Mr. Claude']
    },
    {
      id: 2,
      name: 'Zone D Parking Lot',
      position: { lat: 29.715792, lng: -95.341824 },
      cats: ['Artificer', 'Friday the 13th', 'Mage']
    },
    {
      id: 3,
      name: 'Law Center across The Nook',
      position: { lat: 29.723095, lng: -95.337672 },
      cats: ['Margot, Enid']
    },
    {
      id: 4,
      name: 'Law Center near Lofts',
      position: { lat: 29.722842, lng: -95.339067 },
      cats: ['Ruth']
    },
    {
      id: 5,
      name: 'Moody Towers',
      position: { lat: 29.7175235, lng: -95.3423427 },
      cats: ['Natasha']
    }
  ];

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', initMap);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLEMAPSAPIKEY}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Create map centered on campus
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 29.7199, lng: -95.3422 },
        zoom: 15,
        styles: [
          // Pastel styling
          {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{ "saturation": -20 }, { "lightness": 20 }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#e0d5f0" }]
          },
          {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{ "color": "#f5f0fa" }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Add markers for each location
      feedingLocations.forEach((location) => {
        const marker = new window.google.maps.Marker({
          position: location.position,
          map: map,
          title: location.name,
          icon: {
            url: mapThumbnail, // Use custom cat icon if you have one
            scaledSize: new window.google.maps.Size(40, 40),
            // If you don't have a cat icon yet, comment out the above 2 lines
          }
        });

        // Create info window content.
        // Google renders this outside the React tree and outside `.c4-scope`,
        // so it can only use inline styles with literal colours — utility
        // classes and the padding reset opt-out don't reach in here.
        const infoWindowContent = `
          <div style="font-family: 'Patrick Hand', 'Comic Sans MS', cursive; padding: 10px; min-width: 200px; color: #5c4678;">
            <h3 style="margin: 0 0 10px 0; font-family: 'Pixelify Sans', monospace; font-size: 16px; color: #9b7bc4;">${location.name}</h3>
            <p style="margin: 5px 0; font-size: 14px; opacity: 0.7;">Cats here:</p>
            <p style="margin: 5px 0; font-weight: 600;">${location.cats.join(', ')}</p>
            <div style="margin-top: 10px; display: flex; gap: 8px;">
              <a href="http://maps.apple.com/?q=${location.position.lat},${location.position.lng}"
                 target="_blank"
                 style="background: #e9ddf4; color: #5c4678; border: 1.5px solid #c9b6df; padding: 6px 12px; border-radius: 10px; text-decoration: none; font-size: 12px;">
                Apple Maps
              </a>
              <a href="https://maps.google.com/?q=${location.position.lat},${location.position.lng}"
                 target="_blank"
                 style="background: #e9ddf4; color: #5c4678; border: 1.5px solid #c9b6df; padding: 6px 12px; border-radius: 10px; text-decoration: none; font-size: 12px;">
                Google Maps
              </a>
            </div>
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoWindowContent
        });

        // Show info window on marker click
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
    };

    loadGoogleMaps();
  }, []);

  const CHIPS = [
    'var(--color-chip-1)',
    'var(--color-chip-2)',
    'var(--color-chip-3)',
    'var(--color-chip-4)',
    'var(--color-chip-5)'
  ];

  return (
    <div className="font-hand">
      {/* Google Map with custom markers */}
      <div className="c4-panel mb-3.5 overflow-hidden rounded-[18px] p-3.5">
        <div
          ref={mapRef}
          className="rounded-[12px] overflow-hidden"
          style={{ width: '100%', height: '450px' }}
        />
      </div>

      {/* Location Cards (optional - you can remove if you only want the map) */}
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {feedingLocations.map((location, i) => (
          <div
            key={location.id}
            className="border-line rounded-[14px] border-[1.5px] p-4 text-center"
            style={{ background: CHIPS[i % CHIPS.length] }}
          >
            <h3 className="font-pix text-ink m-0 mb-2 text-lg">{location.name}</h3>

            <div className="mb-3">
              <p className="text-ink/70 m-0 mb-0.5 text-sm">Cats here:</p>
              <p className="text-ink m-0 font-semibold">{location.cats.join(', ')}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <a
                href={`http://maps.apple.com/?q=${location.position.lat},${location.position.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border-line bg-panel rounded-[12px] border-[1.5px] px-4 py-2 no-underline transition-transform hover:-translate-y-0.5"
              >
                <span className="text-ink text-sm">Apple Maps</span>
              </a>
              <a
                href={`https://maps.google.com/?q=${location.position.lat},${location.position.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border-line bg-panel rounded-[12px] border-[1.5px] px-4 py-2 no-underline transition-transform hover:-translate-y-0.5"
              >
                <span className="text-ink text-sm">Google Maps</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CatMapWithMarkers;