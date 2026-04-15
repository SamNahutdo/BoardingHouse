import { useState, useEffect } from 'react';

export interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuverType: string;
}

export interface RouteData {
  geometry: [number, number][];
  distance: string;
  duration: string;
  steps: NavigationStep[];
}

const generateInstruction = (step: any) => {
  const type = step.maneuver.type;
  const modifier = step.maneuver.modifier;
  const name = step.name ? step.name : 'unnamed road';
  
  const cleanName = name.replace(/^{.*}$/, 'unnamed road'); // Clean up macro names if any

  if (type === 'depart') return `Head ${modifier || 'straight'} on ${cleanName}`;
  if (type === 'arrive') return `You will arrive at your destination`;
  if (type === 'turn') return `Turn ${modifier || 'around'} onto ${cleanName}`;
  if (type === 'new name') return `Continue onto ${cleanName}`;
  if (type === 'continue') return `Continue on ${cleanName}`;
  if (type === 'roundabout') return `Take the roundabout and exit onto ${cleanName}`;
  if (type === 'merge') return `Merge onto ${cleanName}`;
  if (type === 'off ramp') return `Take the off ramp onto ${cleanName}`;
  if (type === 'on ramp') return `Take the on ramp onto ${cleanName}`;
  if (type === 'end of road') return `At the end of the road, turn ${modifier || ''} onto ${cleanName}`;
  if (type === 'fork') return `Keep ${modifier || 'straight'} at the fork onto ${cleanName}`;
  
  return `${type} ${modifier ? modifier : ''} on ${cleanName}`;
};

export function useOSRM(start: [number, number] | undefined, end: [number, number] | undefined) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!start || !end) {
      setRoute(null);
      return;
    }

    const fetchRoute = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // OSRM coordinates are [lon, lat]
        const startLonLat = `${start[1]},${start[0]}`;
        const endLonLat = `${end[1]},${end[0]}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${startLonLat};${endLonLat}?overview=full&geometries=geojson&steps=true`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch route');
        }
        
        const data = await response.json();
        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
          throw new Error('No route found');
        }

        const routeData = data.routes[0];
        // Geometry comes as [lon, lat], Leaflet uses [lat, lon]
        const geometry = routeData.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) as [number, number][];
        
        const totalDistKm = (routeData.distance / 1000).toFixed(1);
        const totalDurMin = Math.ceil(routeData.duration / 60);

        const steps = routeData.legs[0].steps.map((step: any) => ({
          instruction: generateInstruction(step),
          distance: step.distance > 1000 ? `${(step.distance / 1000).toFixed(1)} km` : `${Math.round(step.distance)} m`,
          duration: step.duration < 60 ? '< 1 min' : `${Math.round(step.duration / 60)} mins`,
          maneuverType: step.maneuver.type,
        }));

        if (active) {
          setRoute({
            geometry,
            distance: `${totalDistKm} km`,
            duration: `${totalDurMin} mins`,
            steps
          });
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'An error occurred fetching the route');
          console.error("OSRM Error:", err);
          // Fallback to direct routing inside the components handled gracefully
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchRoute();
    return () => {
      active = false; // clean up
    };
  }, [start, end]);

  return { route, isLoading, error };
}
