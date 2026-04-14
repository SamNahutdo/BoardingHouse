import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Navigation, MapPin, Clock, Route, ArrowRight, CheckCircle } from 'lucide-react';

interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuver?: string;
}

interface NavigationPanelProps {
  isVisible: boolean;
  onClose: () => void;
  destination: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
  userLocation?: [number, number];
}

export function NavigationPanel({ isVisible, onClose, destination, userLocation }: NavigationPanelProps) {
  const [directions, setDirections] = useState<NavigationStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalDistance, setTotalDistance] = useState('');
  const [totalDuration, setTotalDuration] = useState('');

  useEffect(() => {
    if (isVisible && userLocation) {
      fetchDirections();
    }
  }, [isVisible, userLocation, destination]);

  const fetchDirections = async () => {
    if (!userLocation) return;

    setIsLoading(true);
    try {
      const origin = `${userLocation[0]},${userLocation[1]}`;
      const dest = `${destination.coordinates[0]},${destination.coordinates[1]}`;

      // Using Google Maps Directions API (you'll need to add your API key)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=driving&key=YOUR_API_KEY`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch directions');
      }

      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];

        setTotalDistance(leg.distance.text);
        setTotalDuration(leg.duration.text);

        const steps = leg.steps.map((step: any) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
          distance: step.distance.text,
          duration: step.duration.text,
          maneuver: step.maneuver,
        }));

        setDirections(steps);
      } else {
        // Fallback: Create simple directions
        createSimpleDirections();
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      createSimpleDirections();
    } finally {
      setIsLoading(false);
    }
  };

  const createSimpleDirections = () => {
    // Simple fallback directions
    const distance = calculateDistance(userLocation!, destination.coordinates);
    setTotalDistance(`${distance.toFixed(1)} km`);
    setTotalDuration(`${Math.ceil(distance * 3)} mins`);

    setDirections([
      {
        instruction: 'Head towards your destination',
        distance: `${distance.toFixed(1)} km`,
        duration: `${Math.ceil(distance * 3)} mins`,
      },
      {
        instruction: 'Follow the main road to reach the boarding house',
        distance: 'Final destination',
        duration: 'Arriving soon',
      },
    ]);
  };

  const calculateDistance = (start: [number, number], end: [number, number]): number => {
    const [lat1, lon1] = start;
    const [lat2, lon2] = end;
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.coordinates[0]},${destination.coordinates[1]}`;
    window.open(url, '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Navigation Guide</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">{destination.name}</p>
            <p className="text-xs text-muted-foreground">{destination.address}</p>
          </div>
        </div>

        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{totalDistance}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm">{totalDuration}</span>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Getting directions...</p>
            </div>
          ) : (
            <div className="p-2">
              {directions.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{step.instruction}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {step.distance}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {step.duration}
                      </Badge>
                    </div>
                  </div>
                  {index === directions.length - 1 && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <Button onClick={openInMaps} className="w-full bg-green-600 hover:bg-green-700">
            <MapPin className="h-4 w-4 mr-2" />
            Open in Google Maps
          </Button>
        </div>
      </Card>
    </div>
  );
}