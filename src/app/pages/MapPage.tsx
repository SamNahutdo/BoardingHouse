import { Card } from '../components/ui/card';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LocateFixed, MapPin, Navigation, BadgeCheck } from 'lucide-react';
import { NavigationPanel } from '../components/NavigationPanel';
import {
  mockProperties,
  getPropertyAvailabilityLabel,
  isPropertyFullyBooked,
} from '../data/mockData';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeIcon = L.icon({
  iconUrl:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDguMyAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIwLjggMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHoiIGZpbGw9IiMxNmEzNGEiLz48Y2lyY2xlIGN4PSIxMi41IiBjeT0iMTIuNSIgcj0iNSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

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

function MapFocus({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 13, { duration: 0.4 });
  }, [map, position]);

  return null;
}

export function MapPage() {
  const [mapReady, setMapReady] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState<string>(mockProperties[0]?.id ?? '');
  const [geoMessage, setGeoMessage] = useState('Tap "Find & Navigate" to locate the nearest boarding house and get turn-by-turn directions!');
  const [showNavigation, setShowNavigation] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>();
  const selectedHouse =
    mockProperties.find((property) => property.id === selectedHouseId) ?? mockProperties[0];

  useEffect(() => {
    setMapReady(true);
  }, []);

  const googleMapsUrl = useMemo(() => {
    const [lat, lng] = selectedHouse.coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${lat},${lng}`,
    )}`;
  }, [selectedHouse.coordinates]);

  const findNearestHouse = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const toRadians = (value: number) => (value * Math.PI) / 180;
          const earthRadiusKm = 6371;
          const dLat = toRadians(lat2 - lat1);
          const dLon = toRadians(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) *
              Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
        };

        const nearest = [...mockProperties]
          .map((property) => ({
            property,
            distance: getDistance(
              latitude,
              longitude,
              property.coordinates[0],
              property.coordinates[1],
            ),
          }))
          .sort((a, b) => a.distance - b.distance)[0];

        if (nearest) {
          setSelectedHouseId(nearest.property.id);
          setGeoMessage(
            `Found ${nearest.property.name} (${nearest.distance.toFixed(1)} km away). Tap "Get Directions" to navigate!`,
          );
          setShowNavigation(true);
        }
      },
      () => {
        setGeoMessage('Location permission was denied, so nearest-house scan could not run.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="relative">
          <Card className="overflow-hidden rounded-3xl border-2">
            <div className="h-[72vh] w-full relative">
              {mapReady && (
                <MapContainer
                  center={selectedHouse.coordinates}
                  zoom={12}
                  scrollWheelZoom
                  attributionControl={false}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapInvalidator />
                  <MapFocus position={selectedHouse.coordinates} />
                  {mockProperties.map((house) => (
                    <Marker
                      key={house.id}
                      position={house.coordinates}
                      icon={house.id === selectedHouseId ? activeIcon : icon}
                      eventHandlers={{
                        click: () => setSelectedHouseId(house.id),
                      }}
                    >
                      <Popup>
                        <div className="space-y-1">
                          <div className="font-semibold">{house.name}</div>
                          <div className="text-xs">{house.address || house.location}</div>
                          <div className="text-xs">{getPropertyAvailabilityLabel(house)}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Route line when navigation is active */}
                  {showNavigation && userLocation && (
                    <Polyline
                      positions={[userLocation, selectedHouse.coordinates]}
                      color="#16a34a"
                      weight={4}
                      opacity={0.8}
                      dashArray="10, 10"
                    />
                  )}

                  {/* User location marker */}
                  {userLocation && (
                    <Marker
                      position={userLocation}
                      icon={L.divIcon({
                        html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',
                        className: 'user-location-marker',
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                      })}
                    >
                      <Popup>
                        <div className="text-sm font-medium">Your Location</div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              )}

              <div className="absolute top-4 left-4 right-4 z-[500] flex flex-col sm:flex-row gap-3 sm:items-start sm:justify-between pointer-events-none">
                <div className="bg-background/95 backdrop-blur rounded-2xl p-4 shadow-xl max-w-xl pointer-events-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <h1 className="font-bold text-lg">Boarding house map</h1>
                  </div>
                  <p className="text-sm text-muted-foreground">{geoMessage}</p>
                </div>

                <Button
                  type="button"
                  onClick={findNearestHouse}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg pointer-events-auto"
                >
                  <LocateFixed className="h-4 w-4 mr-2" />
                  Find & Navigate to Nearest House
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
          <Card className="overflow-hidden rounded-2xl border-2 p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedHouse.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedHouse.address || selectedHouse.location}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <Badge variant={selectedHouse.verified ? 'default' : 'secondary'}>
                  {selectedHouse.verified && <BadgeCheck className="h-3.5 w-3.5 mr-1" />}
                  {selectedHouse.verified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge variant={isPropertyFullyBooked(selectedHouse) ? 'destructive' : 'secondary'}>
                  {getPropertyAvailabilityLabel(selectedHouse)}
                </Badge>
              </div>
            </div>

            <img
              src={selectedHouse.image}
              alt={selectedHouse.name}
              className="w-full h-64 rounded-2xl object-cover object-center mb-4"
            />

            <p className="text-sm text-muted-foreground mb-4">{selectedHouse.description}</p>

            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div className="rounded-xl bg-accent/40 p-4">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="font-semibold">₱{selectedHouse.price.toLocaleString()} / month</div>
              </div>
              <div className="rounded-xl bg-accent/40 p-4">
                <div className="text-sm text-muted-foreground">Room capacity</div>
                <div className="font-semibold">{selectedHouse.roomCapacity} people per room</div>
              </div>
              <div className="rounded-xl bg-accent/40 p-4">
                <div className="text-sm text-muted-foreground">Municipality</div>
                <div className="font-semibold">{selectedHouse.municipality}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowNavigation(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
                disabled={!userLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl">
                  <MapPin className="h-4 w-4 mr-2" />
                  View in Maps
                </Button>
              </a>
            </div>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-2 p-5">
            <div className="font-semibold mb-3">All boarding houses</div>
            <div className="space-y-2 max-h-[500px] overflow-auto pr-1">
              {mockProperties.map((house) => (
                <button
                  key={house.id}
                  type="button"
                  onClick={() => setSelectedHouseId(house.id)}
                  className={[
                    'w-full text-left rounded-xl border p-3 transition',
                    house.id === selectedHouseId
                      ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                      : 'border-border hover:bg-muted',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">{house.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {house.municipality} • {house.address || house.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">₱{house.price}</div>
                      <div className="text-xs text-muted-foreground">★ {house.rating}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <NavigationPanel
        isVisible={showNavigation}
        onClose={() => setShowNavigation(false)}
        destination={{
          name: selectedHouse.name,
          coordinates: selectedHouse.coordinates,
          address: selectedHouse.address || selectedHouse.location,
        }}
        userLocation={userLocation}
      />
    </div>
  );
}
