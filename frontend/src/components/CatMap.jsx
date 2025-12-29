import React, { useEffect, useRef } from 'react';
import mapThumbnail from '../assets/mapthumbnail.png';

function CatMapWithMarkers() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const feedingLocations = [
    {
      id: 1,
      name: 'Equal Opportunity Building',
      position: { lat: 29.718734, lng: -95.344658 },
      cats: ['Whiskers', 'Mittens']
    },
    {
      id: 2,
      name: 'Zone D Parking Lot',
      position: { lat: 29.715792, lng: -95.341824 },
      cats: ['Shadow', 'Luna']
    },
    {
      id: 3,
      name: 'Law Center across The Nook',
      position: { lat: 29.723095, lng: -95.337672 },
      cats: ['Tiger', 'Patches']
    },
    {
      id: 4,
      name: 'Law Center near Lofts',
      position: { lat: 29.722842, lng: -95.339067 },
      cats: ['Bella', 'Max']
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

        // Create info window content
        const infoWindowContent = `
          <div style="font-family: 'Instrument Sans', sans-serif; padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">${location.name}</h3>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">Cats here:</p>
            <p style="margin: 5px 0; font-weight: 600;">${location.cats.join(', ')}</p>
            <div style="margin-top: 10px; display: flex; gap: 8px;">
              <a href="http://maps.apple.com/?q=${location.position.lat},${location.position.lng}" 
                 target="_blank" 
                 style="background: #333; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px;">
                Apple Maps
              </a>
              <a href="https://maps.google.com/?q=${location.position.lat},${location.position.lng}" 
                 target="_blank"
                 style="background: #4285f4; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px;">
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

  return (
    <div className="max-w-6xl mx-auto py-8" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
      {/* Google Map with custom markers */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div 
          ref={mapRef} 
          style={{ width: '100%', height: '450px' }}
        />
      </div>

      {/* Location Cards (optional - you can remove if you only want the map) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {feedingLocations.map((location) => (
          <div 
            key={location.id}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          >
            <h3 className="text-xl font-bold mb-3">{location.name}</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Cats here:</p>
              <p className="font-semibold text-gray-800">{location.cats.join(', ')}</p>
            </div>

            <div className="flex gap-3 justify-center">
              <a 
                href={`http://maps.apple.com/?q=${location.position.lat},${location.position.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                style={{ color: 'white', textDecoration: 'none' }}
              >
                Apple Maps
              </a>
              <a 
                href={`https://maps.google.com/?q=${location.position.lat},${location.position.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                style={{ color: 'white', textDecoration: 'none' }}
              >
                Google Maps
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CatMapWithMarkers;