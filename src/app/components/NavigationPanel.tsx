import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Navigation, Route, Clock, CheckCircle } from 'lucide-react';
import { RouteData } from '../hooks/useOSRM';

interface NavigationPanelProps {
  isVisible: boolean;
  onClose: () => void;
  destination: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
  userLocation?: [number, number];
  routeData?: RouteData | null;
  isLoadingRoute?: boolean;
  routeError?: string | null;
}

export function NavigationPanel({ 
  isVisible, 
  onClose, 
  destination, 
  userLocation,
  routeData,
  isLoadingRoute,
  routeError
}: NavigationPanelProps) {
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl flex flex-col">
        <div className="p-4 border-b shrink-0">
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

        {routeData && !isLoadingRoute && !routeError && (
          <div className="p-4 border-b bg-muted/30 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{routeData.distance}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">{routeData.duration}</span>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          {!userLocation ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Waiting for your location...</p>
            </div>
          ) : isLoadingRoute ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground font-medium">Calculating best route...</p>
            </div>
          ) : routeError ? (
            <div className="p-6 text-center bg-red-50 dark:bg-red-950/20 m-4 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{routeError}</p>
              <p className="text-xs text-muted-foreground mt-2">Could not load directions.</p>
            </div>
          ) : routeData?.steps ? (
            <div className="p-2 space-y-1">
              {routeData.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mt-0.5 shadow-sm">
                    <span className="text-xs font-bold text-green-700 dark:text-green-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed">{step.instruction}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px] uppercase font-semibold tracking-wider">
                        {step.distance}
                      </Badge>
                    </div>
                  </div>
                  {index === routeData.steps.length - 1 && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}