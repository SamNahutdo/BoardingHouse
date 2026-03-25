import { Card } from '../components/ui/card';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Camera, MapPin, QrCode, X } from 'lucide-react';

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
  const [selectedHouseId, setSelectedHouseId] = useState<string>(
    boardingHouses[0]?.id ?? '1',
  );

  const selectedHouse = useMemo(
    () =>
      boardingHouses.find((h) => h.id === selectedHouseId) ?? boardingHouses[0],
    [selectedHouseId],
  );

  const boholCenter: [number, number] = selectedHouse.position;
  const googleMapsUrl = useMemo(() => {
    const [lat, lng] = selectedHouse.position;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${lat},${lng}`,
    )}`;
  }, [selectedHouse.position]);

  useEffect(() => {
    setMapReady(true);
  }, []);

  function MapFocus({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.flyTo(position, 13, { duration: 0.35 });
    }, [map, position]);
    return null;
  }

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastDetectAtRef = useRef<number>(0);

  const resolveHouseFromScanText = (text: string) => {
    const normalized = text.trim();
    if (!normalized) return null;

    // QR content may be just the numeric id (e.g. "1", "2", ...).
    const direct = boardingHouses.find((h) => h.id === normalized);
    if (direct) return direct;

    // Or it might include the id inside other text; grab the first number token.
    const numberMatch = normalized.match(/\b\d+\b/);
    if (numberMatch) {
      const id = numberMatch[0];
      return boardingHouses.find((h) => h.id === id) ?? null;
    }

    // Or it might contain part of the name/location.
    const lowered = normalized.toLowerCase();
    return (
      boardingHouses.find((h) => h.name.toLowerCase().includes(lowered)) ??
      boardingHouses.find((h) => h.location.toLowerCase().includes(lowered)) ??
      null
    );
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    detectorRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCode = (rawValue: string) => {
    const house = resolveHouseFromScanText(rawValue);
    setScannedCode(rawValue);

    if (house) {
      setSelectedHouseId(house.id);
      setScanError(null);
    } else {
      setScanError('No matching boarding house found for this code.');
    }
  };

  const startScanning = async () => {
    setScanError(null);
    setScannedCode('');

    const BarcodeDetectorCtor = (window as any).BarcodeDetector as
      | (new (options?: { formats?: string[] }) => {
          detect: (input: CanvasImageSource) => Promise<
            Array<{ rawValue?: string; format?: string }>
          >;
        })
      | undefined;

    if (!navigator.mediaDevices?.getUserMedia) {
      setScanError('Camera access is not supported in this browser.');
      return;
    }

    if (!BarcodeDetectorCtor) {
      setScanError(
        'QR/barcode scanning is not supported here. (BarcodeDetector is missing.)',
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      detectorRef.current = new BarcodeDetectorCtor({ formats: ['qr_code'] });
      setIsScanning(true);

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas?.getContext('2d') ?? null;

      const loop = async (t: number) => {
        rafRef.current = requestAnimationFrame(loop);
        if (!ctx || !canvas || !video || !detectorRef.current) return;
        if (t - lastDetectAtRef.current < 200) return;
        lastDetectAtRef.current = t;

        if (video.videoWidth === 0 || video.videoHeight === 0) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const detections = await detectorRef.current.detect(canvas);
          const first = detections?.[0];
          const value = first?.rawValue;
          if (value) {
            stopScanning();
            handleCode(value);
          }
        } catch {
          // Ignore per-frame detector failures.
        }
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch (err: any) {
      setScanError(
        err?.message ??
          'Could not start the camera. Please check permissions and try again.',
      );
      stopScanning();
    }
  };

  useEffect(() => {
    return () => stopScanning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden rounded-2xl border-2">
              <div className="h-[600px] w-full relative">
                {mapReady && (
                  <MapContainer
                    center={boholCenter}
                    zoom={12}
                    scrollWheelZoom
                    attributionControl={false}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapInvalidator />
                    <MapFocus position={selectedHouse.position} />

                    {boardingHouses.map((house) => (
                      <Marker
                        key={house.id}
                        position={house.position}
                        icon={house.id === selectedHouseId ? greenIcon : icon}
                        eventHandlers={{
                          click: () => setSelectedHouseId(house.id),
                        }}
                      />
                    ))}
                  </MapContainer>
                )}
              </div>

              <div className="p-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 mt-0.5 text-green-600" />
                  <div>
                    <div className="font-semibold text-sm">Boarding house location</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedHouse.location}
                    </div>
                  </div>
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

          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden rounded-2xl border-2 p-5">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="h-5 w-5 text-green-600" />
                <div className="font-semibold">Scan to locate</div>
              </div>

              <div className="text-xs text-muted-foreground mb-4">
                Expected QR content: the boarding house id (for example:{' '}
                <span className="font-mono">1</span>).
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-muted p-3">
                  <video
                    ref={videoRef}
                    className="w-full h-52 rounded-lg bg-black"
                    muted
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex gap-2">
                  {!isScanning ? (
                    <Button
                      type="button"
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 flex-1"
                      onClick={startScanning}
                      disabled={!mapReady}
                    >
                      <Camera className="h-5 w-5" />
                      Start scanning
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1"
                      onClick={stopScanning}
                    >
                      <X className="h-5 w-5 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>

                {scanError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                    {scanError}
                  </div>
                )}

                {scannedCode && (
                  <div className="text-sm">
                    Scanned code:{' '}
                    <span className="font-mono">{scannedCode}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 border-t pt-5">
                <div className="font-medium text-sm mb-2">
                  Or enter code manually
                </div>
                <div className="flex gap-2">
                  <Input
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. 1"
                  />
                  <Button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    onClick={() => handleCode(manualCode)}
                    disabled={!manualCode.trim()}
                  >
                    Locate
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden rounded-2xl border-2 p-5">
              <div className="font-semibold mb-3">Boarding houses</div>
              <div className="space-y-2">
                {boardingHouses.map((house) => (
                  <button
                    key={house.id}
                    type="button"
                    onClick={() => setSelectedHouseId(house.id)}
                    className={[
                      'w-full text-left rounded-xl border p-3 transition',
                      house.id === selectedHouseId
                        ? 'border-green-600 bg-green-50'
                        : 'border-border hover:bg-muted',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-sm">{house.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {house.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">₱{house.price}</div>
                        <div className="text-xs text-muted-foreground">
                          ★ {house.rating}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
