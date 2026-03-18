import { Card } from '../components/ui/card';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Green marker for boarding houses
const greenIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDguMyAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIwLjggMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHoiIGZpbGw9IiMxNmEzNGEiLz48Y2lyY2xlIGN4PSIxMi41IiBjeT0iMTIuNSIgcj0iNSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Sample boarding house locations in Bohol
const boardingHouses = [
  {
    id: '1',
    name: 'Tagbilaran City Boarders Hub',
    location: 'Tagbilaran City',
    position: [9.6472, 123.8523] as [number, number],
    price: 3500,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
  },
  {
    id: '2',
    name: 'Panglao Beach House',
    location: 'Panglao',
    position: [9.5834, 123.7544] as [number, number],
    price: 4500,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  },
  {
    id: '3',
    name: 'Baclayon Heritage Home',
    location: 'Baclayon',
    position: [9.6200, 123.9100] as [number, number],
    price: 3200,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
  },
  {
    id: '4',
    name: 'Dauis Coastal Living',
    location: 'Dauis',
    position: [9.6234, 123.8456] as [number, number],
    price: 4000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  },
  {
    id: '5',
    name: 'Loboc River Boarders',
    location: 'Loboc',
    position: [9.6378, 124.0311] as [number, number],
    price: 3800,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
  },
  {
    id: '6',
    name: 'Carmen Chocolate Hills View',
    location: 'Carmen',
    position: [9.8500, 124.1167] as [number, number],
    price: 5000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
  },
  {
    id: '7',
    name: 'Alona Beach Residence',
    location: 'Panglao - Alona',
    position: [9.5525, 123.7739] as [number, number],
    price: 5500,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400',
  },
];

// Leaflet sometimes measures container size as 0 in React/Next until after layout.
// This forces Leaflet to recalculate dimensions once mounted.
function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    const t = window.setTimeout(() => {
      map.invalidateSize();
    }, 0);
    return () => window.clearTimeout(t);
  }, [map]);

  return null;
}

export function MapPage() {
  const [mapReady, setMapReady] = useState(false);
  // Focus the map on a single boarding house marker.
  const focusedHouse = boardingHouses[0];
  const boholCenter: [number, number] = focusedHouse.position; // Coordinates for the focused marker
  const googleMapsUrl = 'https://maps.app.goo.gl/xChmHwDB1nb8mCv87';

  useEffect(() => {
    setMapReady(true);
  }, []);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden rounded-2xl border-2">
          <div className="h-[600px] w-full relative">
            {mapReady && (
              <MapContainer
                center={boholCenter}
                zoom={12}
                // Make it "picture-like": keep the map visible, but disable interactions.
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                doubleClickZoom={false}
                boxZoom={false}
                keyboard={false}
                touchZoom={false}
                attributionControl={false}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapInvalidator />

                <Marker position={focusedHouse.position} icon={greenIcon} />
              </MapContainer>
            )}
          </div>

          <div className="p-4 border-t flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-sm">Boarding house location</div>
              <div className="text-xs text-muted-foreground">{focusedHouse.location}</div>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
            >
              Open in Google Maps
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
